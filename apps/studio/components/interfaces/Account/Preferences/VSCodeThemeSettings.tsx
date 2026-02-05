import { AlertCircle, Check, Code2 } from 'lucide-react'
import { useState } from 'react'

import { useVSCodeTheme } from 'hooks/misc/useVSCodeTheme'
import type { VSCodeThemePreset } from 'lib/vscode-themes'
import {
  Alert_Shadcn_,
  AlertDescription_Shadcn_,
  AlertTitle_Shadcn_,
  Button,
  Card,
  CardContent,
  cn,
  Label_Shadcn_,
  Separator,
  Switch,
  TextArea_Shadcn_,
} from 'ui'

/**
 * Theme preview card component
 */
function ThemePreviewCard({
  preset,
  isSelected,
  onSelect,
}: {
  preset: VSCodeThemePreset
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'relative flex flex-col rounded-lg border p-3 text-left transition-all hover:border-foreground-muted',
        isSelected ? 'border-brand ring-1 ring-brand' : 'border-default'
      )}
    >
      {/* Theme preview colors */}
      <div className="flex gap-1 mb-2">
        <div
          className="w-8 h-8 rounded"
          style={{ backgroundColor: preset.preview.background }}
          title="Background"
        />
        <div
          className="w-8 h-8 rounded"
          style={{ backgroundColor: preset.preview.surface }}
          title="Surface"
        />
        <div
          className="w-8 h-8 rounded"
          style={{ backgroundColor: preset.preview.accent }}
          title="Accent"
        />
        <div
          className="w-8 h-8 rounded border border-default"
          style={{ backgroundColor: preset.preview.foreground }}
          title="Foreground"
        />
      </div>

      {/* Theme name */}
      <span className="text-sm font-medium text-foreground">{preset.name}</span>

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand">
          <Check className="h-3 w-3 text-brand-600" strokeWidth={3} />
        </div>
      )}
    </button>
  )
}

/**
 * VSCode Theme Settings Component
 *
 * Allows users to customize the Studio UI using VSCode themes.
 */
export function VSCodeThemeSettings() {
  const {
    isEnabled,
    currentPresetId,
    customThemeJson,
    presets,
    enablePreset,
    applyCustomTheme,
    setEnabled,
  } = useVSCodeTheme()

  const [customJson, setCustomJson] = useState(customThemeJson || '')
  const [customError, setCustomError] = useState<string | null>(null)
  const [showCustomInput, setShowCustomInput] = useState(false)

  const handleToggle = (checked: boolean) => {
    setEnabled(checked)
    if (!checked) {
      setCustomError(null)
    }
  }

  const handlePresetSelect = (presetId: string) => {
    enablePreset(presetId)
    setShowCustomInput(false)
    setCustomError(null)
  }

  const handleApplyCustomTheme = () => {
    const result = applyCustomTheme(customJson)
    if (!result.success) {
      setCustomError(result.error || 'Failed to apply theme')
    } else {
      setCustomError(null)
    }
  }

  const handleResetCustomTheme = () => {
    setCustomJson('')
    setCustomError(null)
    // If a preset was previously selected, revert to it
    if (presets.length > 0) {
      enablePreset(presets[0].id)
    }
    setShowCustomInput(false)
  }

  const isUsingCustomTheme = isEnabled && !currentPresetId && customThemeJson

  return (
    <>
      <Separator />
      <CardContent className="grid grid-cols-12 gap-6">
        <div className="col-span-full md:col-span-4 flex flex-col gap-2">
          <Label_Shadcn_ htmlFor="vscode-theme" className="text-foreground flex items-center gap-2">
            <Code2 className="h-4 w-4" />
            VSCode Theme
          </Label_Shadcn_>
          <p className="text-sm text-foreground-light">
            Customize the Studio UI with your favorite VSCode themes. Choose from popular presets or
            paste your own theme JSON.
          </p>
        </div>

        <div className="col-span-full md:col-span-8 flex flex-col gap-4">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between">
            <Label_Shadcn_ htmlFor="vscode-theme-toggle" className="text-sm text-foreground-light">
              Enable VSCode theme
            </Label_Shadcn_>
            <Switch id="vscode-theme-toggle" checked={isEnabled} onCheckedChange={handleToggle} />
          </div>

          {isEnabled && (
            <>
              {/* Theme Presets Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {presets.map((preset) => (
                  <ThemePreviewCard
                    key={preset.id}
                    preset={preset}
                    isSelected={currentPresetId === preset.id}
                    onSelect={() => handlePresetSelect(preset.id)}
                  />
                ))}
              </div>

              {/* Custom Theme Toggle */}
              <div className="flex items-center gap-2">
                <Button
                  type="default"
                  size="small"
                  onClick={() => setShowCustomInput(!showCustomInput)}
                >
                  {showCustomInput ? 'Hide custom theme' : 'Use custom theme'}
                </Button>
                {isUsingCustomTheme && (
                  <span className="text-xs text-foreground-light">Currently using custom theme</span>
                )}
              </div>

              {/* Custom Theme Input */}
              {showCustomInput && (
                <Card className="bg-surface-100">
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-2">
                      <Label_Shadcn_ htmlFor="custom-theme-json" className="text-sm">
                        Custom VSCode Theme JSON
                      </Label_Shadcn_>
                      <TextArea_Shadcn_
                        id="custom-theme-json"
                        value={customJson}
                        onChange={(e) => {
                          setCustomJson(e.target.value)
                          setCustomError(null)
                        }}
                        placeholder={`{
  "name": "My Theme",
  "type": "dark",
  "colors": {
    "editor.background": "#1e1e1e",
    "editor.foreground": "#d4d4d4",
    ...
  }
}`}
                        className="font-mono text-xs min-h-[200px]"
                      />
                      <p className="text-xs text-foreground-muted">
                        Paste a VSCode theme JSON. Must include &quot;name&quot;, &quot;type&quot;
                        (dark/light), and &quot;colors&quot; object.
                      </p>
                    </div>

                    {customError && (
                      <Alert_Shadcn_ variant="warning">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle_Shadcn_>Invalid theme</AlertTitle_Shadcn_>
                        <AlertDescription_Shadcn_>{customError}</AlertDescription_Shadcn_>
                      </Alert_Shadcn_>
                    )}

                    <div className="flex gap-2">
                      <Button
                        type="primary"
                        size="small"
                        onClick={handleApplyCustomTheme}
                        disabled={!customJson.trim()}
                      >
                        Apply Theme
                      </Button>
                      <Button type="default" size="small" onClick={handleResetCustomTheme}>
                        Reset
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </CardContent>
    </>
  )
}
