import { ChevronDown, Cpu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { NVIDIA_MODELS } from '@/types'
import { cn } from '@/lib/utils'

interface ModelSelectorProps {
  value: string
  onChange: (model: string) => void
  disabled?: boolean
}

export function ModelSelector({ value, onChange, disabled }: ModelSelectorProps) {
  const current = NVIDIA_MODELS.find((m) => m.id === value) ?? NVIDIA_MODELS[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="h-7 gap-1.5 border-border/60 bg-background/50 px-2.5 text-xs font-medium"
        >
          <Cpu className="size-3 text-muted-foreground" />
          <span className="max-w-28 truncate">{current.name}</span>
          <ChevronDown className="size-3 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          NVIDIA NIM Models
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {NVIDIA_MODELS.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => onChange(model.id)}
            className={cn(
              'flex flex-col items-start gap-0.5 py-2',
              value === model.id && 'bg-accent'
            )}
          >
            <div className="flex w-full items-center justify-between">
              <span className="text-sm font-medium">{model.name}</span>
              {value === model.id && (
                <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                  active
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{model.description}</span>
            <span className="text-[10px] text-muted-foreground/60">
              {(model.contextLength / 1000).toFixed(0)}k context
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
