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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { ChatSettings } from '@/types'
import { DEFAULT_SETTINGS } from '@/types'

interface SettingsPanelProps {
  settings: ChatSettings
  onChange: (settings: ChatSettings) => void
  disabled?: boolean
}

const PERSONAS = [
  {
    id: 'default',
    name: 'General Assistant',
    prompt: DEFAULT_SETTINGS.systemPrompt,
  },
  {
    id: 'frontend',
    name: 'Frontend React Expert',
    prompt: 'You are an expert Frontend Developer specializing in React, TypeScript, and Tailwind CSS. Always write clean, accessible, and performant UI code. Use modern React patterns (hooks, functional components). When generating complete apps, ensure they are visually stunning, responsive, and ready to be previewed.',
  },
  {
    id: 'backend',
    name: 'Backend Systems Engineer',
    prompt: 'You are a Senior Backend Systems Engineer. Focus on scalable, secure, and efficient server-side code. Prioritize database optimization, clean API design (REST or GraphQL), and robust error handling. When writing Node.js, Python, or Go code, provide detailed comments on performance implications.',
  },
  {
    id: 'data',
    name: 'Data Scientist (Python)',
    prompt: 'You are an expert Data Scientist and Python Developer. When asked about data, provide code using pandas, numpy, and matplotlib/plotly. Focus on statistical accuracy, data visualization best practices, and clean, readable code. Always explain the math or logic behind your algorithms.',
  }
]

export function SettingsPanel({ settings, onChange, disabled }: SettingsPanelProps) {
  // Find current persona based on exact prompt match, or 'custom'
  const currentPersona = PERSONAS.find(p => p.prompt === settings.systemPrompt)?.id || 'custom'

  const handlePersonaChange = (personaId: string) => {
    if (personaId === 'custom') return
    const persona = PERSONAS.find(p => p.id === personaId)
    if (persona) {
      onChange({ ...settings, systemPrompt: persona.prompt })
    }
  }

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

          {/* Personas / System Prompt */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">AI Persona</Label>
              <Select value={currentPersona} onValueChange={handlePersonaChange}>
                <SelectTrigger className="w-full text-xs">
                  <SelectValue placeholder="Select a persona" />
                </SelectTrigger>
                <SelectContent>
                  {PERSONAS.map(p => (
                    <SelectItem key={p.id} value={p.id} className="text-xs">
                      {p.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom" className="text-xs italic text-muted-foreground">
                    Custom Prompt...
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <Label className="text-sm font-medium text-muted-foreground">Custom Instructions</Label>
              <Textarea
                value={settings.systemPrompt}
                onChange={(e) => onChange({ ...settings, systemPrompt: e.target.value })}
                placeholder="You are a helpful assistant..."
                className="min-h-[140px] resize-none text-xs"
              />
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onChange(DEFAULT_SETTINGS)}
            className="w-full mt-4"
          >
            Reset to Defaults
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
