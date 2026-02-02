import type { ConnectSchema, StepDefinition } from './Connect.types'

/**
 * Install commands for different packages
 */
export const INSTALL_COMMANDS: Record<string, string> = {
  supabasejs: 'npm install @supabase/supabase-js',
  supabasepy: 'pip install supabase',
  supabaseflutter: 'flutter pub add supabase_flutter',
  supabaseswift:
    'swift package add-dependency https://github.com/supabase-community/supabase-swift',
  supabasekt: 'implementation("io.github.jan-tennert.supabase:supabase-kt:VERSION")',
}

// ============================================================================
// Step Definitions (reusable)
// All content paths use template syntax: {{stateKey}} is replaced with state values
// ============================================================================

const frameworkInstallStep: StepDefinition = {
  id: 'install',
  title: 'Install package',
  description: 'Run this command to install the required dependencies.',
  content: 'steps/install',
}

const frameworkConfigureStep: StepDefinition = {
  id: 'configure',
  title: 'Add files',
  description: 'Copy the following code into your project.',
  content: '{{framework}}/{{frameworkVariant}}/{{library}}',
}

const frameworkNextJsFilesStep: StepDefinition = {
  id: 'configure-nextjs',
  title: 'Add files',
  description:
    'Add env variables, create Supabase client helpers, and set up middleware to keep sessions refreshed.',
  content: '{{framework}}/{{frameworkVariant}}/{{library}}',
}

const frameworkReactFilesStep: StepDefinition = {
  id: 'configure-react',
  title: 'Add files',
  description: 'Add env variables, create a Supabase client, and use it in your app to query data.',
  content: '{{framework}}/{{frameworkVariant}}/{{library}}',
}

const frameworkShadcnStep: StepDefinition = {
  id: 'shadcn-add',
  title: 'Add Supabase UI components',
  description: 'Run this command to install the Supabase shadcn components.',
  content: 'steps/shadcn/command',
}

const frameworkShadcnExploreStep: StepDefinition = {
  id: 'shadcn-explore',
  title: 'Check out more UI components',
  description: 'Add auth, realtime and storage functionality to your project',
  content: 'steps/shadcn/explore',
}

const skillsInstallStep: StepDefinition = {
  id: 'install-skills',
  title: 'Install Agent Skills (Optional)',
  description:
    'Agent Skills give AI coding tools ready-made instructions, scripts, and resources for working with Supabase more accurately and efficiently.',
  content: 'steps/skills-install',
}

// ============================================================================
// Main Schema
// ============================================================================

export const connectSchema: ConnectSchema = {
  // -------------------------------------------------------------------------
  // Mode Definitions
  // -------------------------------------------------------------------------
  modes: [
    {
      id: 'framework',
      label: 'Framework',
      description: 'Use a client library',
      fields: ['framework', 'frameworkVariant', 'library', 'frameworkUi'],
    },
  ],

  // -------------------------------------------------------------------------
  // Field Definitions
  // -------------------------------------------------------------------------
  fields: {
    // Framework fields
    framework: {
      id: 'framework',
      type: 'radio-grid',
      label: 'Framework',
      options: { source: 'frameworks' },
      defaultValue: 'nextjs',
    },
    frameworkVariant: {
      id: 'frameworkVariant',
      type: 'select',
      label: 'Variant',
      options: { source: 'frameworkVariants' },
      defaultValue: 'app',
      dependsOn: { framework: ['nextjs', 'react'] }, // Only show for frameworks with multiple variants
    },
    library: {
      id: 'library',
      type: 'select',
      label: 'Library',
      options: { source: 'libraries' },
      defaultValue: 'supabasejs',
    },
    frameworkUi: {
      id: 'frameworkUi',
      type: 'switch',
      label: 'Shadcn',
      description: 'Install components via the Supabase shadcn registry.',
      defaultValue: false,
      dependsOn: { framework: ['nextjs', 'react'] },
    },
  },

  // -------------------------------------------------------------------------
  // Steps - Conditional based on mode and nested selections
  // -------------------------------------------------------------------------
  steps: {
    // Keys are field IDs; each field maps state values to step trees.
    mode: {
      framework: {
        framework: {
          nextjs: {
            frameworkUi: {
              true: [
                frameworkInstallStep,
                frameworkShadcnStep,
                frameworkShadcnExploreStep,
                skillsInstallStep,
              ],
              DEFAULT: [frameworkInstallStep, frameworkNextJsFilesStep, skillsInstallStep],
            },
          },
          react: {
            frameworkUi: {
              true: [
                frameworkInstallStep,
                frameworkShadcnStep,
                frameworkShadcnExploreStep,
                skillsInstallStep,
              ],
              DEFAULT: [frameworkInstallStep, frameworkReactFilesStep, skillsInstallStep],
            },
          },
          DEFAULT: [frameworkInstallStep, frameworkConfigureStep, skillsInstallStep],
        },
      },
    },
  },
}
