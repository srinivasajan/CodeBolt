import { Sandpack } from "@codesandbox/sandpack-react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CodePreviewPanelProps {
  code: string;
  onClose: () => void;
}

export function CodePreviewPanel({ code, onClose }: CodePreviewPanelProps) {
  return (
    <div className="flex h-full w-full flex-col border-l border-border bg-background">
      <div className="flex items-center justify-between border-b border-border px-4 py-2 bg-card">
        <h3 className="text-sm font-medium">Live Preview</h3>
        <Button variant="ghost" size="icon-sm" onClick={onClose} className="size-6">
          <X className="size-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-hidden [&_.sp-wrapper]:h-full [&_.sp-layout]:h-full">
        <Sandpack
          template="react-ts"
          theme="dark"
          files={{
            "/App.tsx": code,
          }}
          options={{
            showNavigator: true,
            showLineNumbers: true,
            editorHeight: "100%",
          }}
          customSetup={{
            dependencies: {
              "lucide-react": "latest",
              "framer-motion": "latest",
              "tailwind-merge": "latest",
              "clsx": "latest",
            }
          }}
        />
      </div>
    </div>
  );
}
