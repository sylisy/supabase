-- Migration: Simplify RLS by removing organization_id checks
-- Since this is a single-org-per-deployment system, we don't need to check org_id in RLS
-- Admins can see all projects, builders see only their own (creator_id = auth.uid())

-- Step 1: Add foreign key constraint from projects.creator_id to auth.users(id)
-- This ensures referential integrity and enables better query optimization
ALTER TABLE public.projects
DROP CONSTRAINT IF EXISTS projects_creator_id_fkey;

ALTER TABLE public.projects
ADD CONSTRAINT projects_creator_id_fkey
FOREIGN KEY (creator_id)
REFERENCES auth.users(id)
ON DELETE RESTRICT;  -- Prevent deleting users who have created projects

COMMENT ON CONSTRAINT projects_creator_id_fkey ON public.projects IS 'Foreign key to auth.users ensuring referential integrity';

-- Step 2: Drop old complex RLS policies
DROP POLICY IF EXISTS "Users can view their own projects or admins can view all org projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can view all organization projects" ON public.projects;
DROP POLICY IF EXISTS "Builders can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Builders can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can update organization projects" ON public.projects;

-- Step 3: Create simplified RLS policies for SELECT
-- Admins see everything, builders see only their own
CREATE POLICY "Admins can view all projects, builders can view their own"
ON public.projects
FOR SELECT
TO authenticated
USING (
  deleted_at IS NULL
  AND (
    -- User is an admin (can see all projects)
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
    OR
    -- User is the creator (can see their own)
    creator_id = auth.uid()
  )
);

-- Step 4: Simplified INSERT policy
-- Keep existing insert policy (unchanged)
CREATE POLICY "Users can create projects"
ON public.projects
FOR INSERT
TO authenticated
WITH CHECK (creator_id = auth.uid());

-- Step 5: Simplified UPDATE policy
CREATE POLICY "Admins can update all projects, users can update their own"
ON public.projects
FOR UPDATE
TO authenticated
USING (
  -- User is an admin OR is the creator
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
  )
  OR creator_id = auth.uid()
)
WITH CHECK (
  -- Same check for the new row
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
  )
  OR creator_id = auth.uid()
);

-- Step 6: Add helpful comments
COMMENT ON POLICY "Admins can view all projects, builders can view their own" ON public.projects IS
  'Simplified RLS: Admins see all projects, builders see only projects they created (no org_id check needed)';

COMMENT ON POLICY "Users can create projects" ON public.projects IS
  'Users can create projects as long as they set themselves as the creator';

COMMENT ON POLICY "Admins can update all projects, users can update their own" ON public.projects IS
  'Admins can update any project, users can only update their own projects';

-- Step 7: Create index on creator_id for performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_projects_creator_id ON public.projects(creator_id) WHERE deleted_at IS NULL;

-- Step 8: Update helper function to check admin without org_id
CREATE OR REPLACE FUNCTION public.is_user_admin(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY definer
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = p_user_id
      AND role = 'admin'
  );
END;
$$;

COMMENT ON FUNCTION public.is_user_admin IS 'Check if user has admin role (no org_id check needed for single-org deployments)';

GRANT EXECUTE ON FUNCTION public.is_user_admin TO authenticated;
