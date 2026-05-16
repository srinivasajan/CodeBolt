import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { ChatSettings } from '@/types'
import { DEFAULT_SETTINGS } from '@/types'

interface SettingsPanelProps {
  settings: ChatSettings
  onChange: (settings: ChatSettings) => void
  disabled?: boolean
}

export function SettingsPanel({ settings, onChange, disabled }: SettingsPanelProps) {
  return (
    <Sheet>
      <Tooltip>
        <TooltipTrigger asChild>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={disabled}
              className="size-7 text-muted-foreground"
            >
              <Settings className="size-4" />
            </Button>
          </SheetTrigger>
        </TooltipTrigger>
        <TooltipContent>Settings</TooltipContent>
      </Tooltip>

      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle className="text-base">Generation Settings</SheetTitle>
        </SheetHeader>

        <div className="mt-6 flex flex-col gap-6">
          {/* Temperature */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Temperature</Label>
              <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs">
                {settings.temperature.toFixed(2)}
              </span>
            </div>
            <Slider
              value={[settings.temperature]}
              onValueChange={([v]) => onChange({ ...settings, temperature: v })}
              min={0}
              max={2}
              step={0.01}
            />
            <p className="text-xs text-muted-foreground">
              Lower = more focused. Higher = more creative.
            </p>
          </div>

          <Separator />

          {/* Max Tokens */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Max Tokens</Label>
              <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs">
                {settings.maxTokens.toLocaleString()}
              </span>
            </div>
            <Slider
              value={[settings.maxTokens]}
              onValueChange={([v]) => onChange({ ...settings, maxTokens: v })}
              min={256}
              max={32768}
              step={256}
            />
            <p className="text-xs text-muted-foreground">
              Maximum response length in tokens.
            </p>
          </div>

          <Separator />

          {/* System Prompt */}
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">System Prompt</Label>
            <Textarea
              value={settings.systemPrompt}
              onChange={(e) => onChange({ ...settings, systemPrompt: e.target.value })}
              placeholder="You are a helpful assistant..."
              className="min-h-[120px] resize-none text-xs"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onChange(DEFAULT_SETTINGS)}
            className="w-full"
          >
            Reset to Defaults
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
