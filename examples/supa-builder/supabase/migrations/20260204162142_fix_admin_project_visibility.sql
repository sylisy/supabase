-- Migration: Fix Admin Project Visibility
-- Problem: Admin users cannot see projects created by builders in same organization
-- Solution: Simplify RLS policies and add diagnostic function

-- Step 1: Drop existing policies that might conflict
-- We'll replace them with a single comprehensive policy
drop policy if exists "Admins can view all organization projects" on public.projects;
drop policy if exists "Builders can view their own projects" on public.projects;

-- Step 2: Create a single comprehensive policy
-- This policy allows:
-- 1. Users to see their own projects (creator_id = auth.uid())
-- 2. Admins to see all projects in their organization

create policy "Users can view their own projects or admins can view all org projects"
on public.projects
for select
to authenticated
using (
  deleted_at is null
  and (
    -- Users can always see their own projects
    creator_id = auth.uid()
    or
    -- Admins can see all projects in their organization
    exists (
      select 1
      from public.user_roles
      where user_roles.user_id = auth.uid()
        and user_roles.role = 'admin'
        and user_roles.organization_id = projects.organization_id
    )
  )
);

-- Step 3: Add diagnostic function for troubleshooting
-- This helps verify whether RLS is working correctly
create or replace function public.debug_project_access(p_project_id uuid)
returns table(
  current_user_id uuid,
  current_user_email text,
  is_creator boolean,
  user_role text,
  user_org_id text,
  project_org_id text,
  orgs_match boolean,
  should_have_access boolean
)
language plpgsql
security definer
as $$
begin
  return query
  select
    auth.uid() as current_user_id,
    (select email from auth.users where id = auth.uid()) as current_user_email,
    (p.creator_id = auth.uid()) as is_creator,
    coalesce(ur.role, 'none') as user_role,
    ur.organization_id as user_org_id,
    p.organization_id as project_org_id,
    (ur.organization_id = p.organization_id) as orgs_match,
    (
      p.deleted_at is null
      and (
        p.creator_id = auth.uid()
        or (ur.role = 'admin' and ur.organization_id = p.organization_id)
      )
    ) as should_have_access
  from public.projects p
  left join public.user_roles ur on ur.user_id = auth.uid()
  where p.id = p_project_id;
end;
$$;

grant execute on function public.debug_project_access to authenticated;

-- Step 4: Add comment for documentation
comment on function public.debug_project_access is 'Diagnostic function to help troubleshoot project access issues. Shows whether current user should have access to a project based on RLS rules.';
