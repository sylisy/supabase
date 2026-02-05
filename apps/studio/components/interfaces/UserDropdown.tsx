import { Check, Code2, Command, FlaskConical, Loader2, Settings } from 'lucide-react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { ProfileImage } from 'components/ui/ProfileImage'
import { useIsFeatureEnabled } from 'hooks/misc/useIsFeatureEnabled'
import { useVSCodeTheme } from 'hooks/misc/useVSCodeTheme'
import { IS_PLATFORM } from 'lib/constants'
import { useProfileNameAndPicture } from 'lib/profile'
import { useAppStateSnapshot } from 'state/app-state'
import {
  Button,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  Theme,
  singleThemes,
} from 'ui'
import { useCommandMenuOpenedTelemetry, useSetCommandMenuOpen } from 'ui-patterns/CommandMenu'
import { useFeaturePreviewModal } from './App/FeaturePreview/FeaturePreviewContext'

export function UserDropdown() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const appStateSnapshot = useAppStateSnapshot()
  const profileShowEmailEnabled = useIsFeatureEnabled('profile:show_email')
  const { username, avatarUrl, primaryEmail, isLoading } = useProfileNameAndPicture()

  const setCommandMenuOpen = useSetCommandMenuOpen()
  const sendTelemetry = useCommandMenuOpenedTelemetry()
  const { openFeaturePreviewModal } = useFeaturePreviewModal()

  const {
    isEnabled: isVSCodeThemeEnabled,
    currentPresetId,
    currentPreset,
    presets: vscodePresets,
    enablePreset: enableVSCodePreset,
    disable: disableVSCodeTheme,
  } = useVSCodeTheme()

  const handleCommandMenuOpen = () => {
    setCommandMenuOpen(true)
    sendTelemetry()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="border flex-shrink-0 px-3">
        <Button
          type="default"
          className="[&>span]:flex px-0 py-0 rounded-full overflow-hidden h-8 w-8"
        >
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <Loader2 className="animate-spin text-foreground-lighter" size={16} />
            </div>
          ) : (
            <ProfileImage alt={username} src={avatarUrl} className="w-8 h-8 rounded-md" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent side="bottom" align="end">
        {IS_PLATFORM && (
          <>
            <div className="px-2 py-1 flex flex-col gap-0 text-sm">
              {!!username && (
                <>
                  <span title={username} className="w-full text-left text-foreground truncate">
                    {username}
                  </span>
                  {primaryEmail !== username && profileShowEmailEnabled && (
                    <span
                      title={primaryEmail}
                      className="w-full text-left text-foreground-light text-xs truncate"
                    >
                      {primaryEmail}
                    </span>
                  )}
                </>
              )}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="flex gap-2" asChild>
                <Link
                  href="/account/me"
                  onClick={() => {
                    if (router.pathname !== '/account/me') {
                      appStateSnapshot.setLastRouteBeforeVisitingAccountPage(router.asPath)
                    }
                  }}
                >
                  <Settings size={14} strokeWidth={1.5} className="text-foreground-lighter" />
                  Account preferences
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex gap-2"
                onClick={openFeaturePreviewModal}
                onSelect={openFeaturePreviewModal}
              >
                <FlaskConical size={14} strokeWidth={1.5} className="text-foreground-lighter" />
                Feature previews
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </DropdownMenuGroup>
          </>
        )}
        <DropdownMenuGroup>
          <DropdownMenuLabel>Theme</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={theme}
            onValueChange={(value) => {
              setTheme(value)
            }}
          >
            {singleThemes.map((theme: Theme) => (
              <DropdownMenuRadioItem key={theme.value} value={theme.value}>
                {theme.name}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2">
              <Code2 size={14} strokeWidth={1.5} className="text-foreground-lighter" />
              <span>VSCode Theme</span>
              {isVSCodeThemeEnabled && currentPreset && (
                <span className="ml-auto text-xs text-foreground-muted truncate max-w-[80px]">
                  {currentPreset.name}
                </span>
              )}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-48">
              <DropdownMenuItem
                onClick={() => disableVSCodeTheme()}
                className="flex items-center justify-between"
              >
                <span>Off</span>
                {!isVSCodeThemeEnabled && <Check size={14} className="text-brand" />}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {vscodePresets.map((preset) => (
                <DropdownMenuItem
                  key={preset.id}
                  onClick={() => enableVSCodePreset(preset.id)}
                  className="flex items-center gap-2"
                >
                  <div className="flex gap-0.5 shrink-0">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: preset.preview.background }}
                    />
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: preset.preview.accent }}
                    />
                  </div>
                  <span className="flex-1 truncate">{preset.name}</span>
                  {isVSCodeThemeEnabled && currentPresetId === preset.id && (
                    <Check size={14} className="text-brand shrink-0" />
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href="/account/me"
                  className="text-xs text-foreground-light"
                  onClick={() => {
                    if (router.pathname !== '/account/me') {
                      appStateSnapshot.setLastRouteBeforeVisitingAccountPage(router.asPath)
                    }
                  }}
                >
                  Custom theme...
                </Link>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        {IS_PLATFORM && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onSelect={() => {
                  router.push('/logout')
                }}
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
