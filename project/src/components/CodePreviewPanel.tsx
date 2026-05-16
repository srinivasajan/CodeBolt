import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import JSZip from "jszip";

interface CodePreviewPanelProps {
  code: string;
  onClose: () => void;
}

function DownloadButton() {
  const { sandpack } = useSandpack();
  
  const handleDownload = async () => {
    const zip = new JSZip();
    
    // Add all files from sandpack
    for (const [path, file] of Object.entries(sandpack.files)) {
      zip.file(path.replace(/^\//, ''), file.code);
    }
    
    // Ensure package.json exists to make it a runnable project
    if (!sandpack.files['/package.json']) {
      zip.file('package.json', JSON.stringify({
        name: "codebolt-sandbox",
        version: "1.0.0",
        dependencies: {
          "react": "^18.2.0",
          "react-dom": "^18.2.0",
          "lucide-react": "latest",
          "framer-motion": "latest",
          "tailwind-merge": "latest",
          "clsx": "latest"
        },
        scripts: {
          "start": "react-scripts start"
        }
      }, null, 2));
    }
    
    // Ensure index.html exists
    if (!sandpack.files['/public/index.html']) {
      zip.file('public/index.html', `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>CodeBolt App</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`);
    }

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = "codebolt-project.zip";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button 
      variant="ghost" 
      size="icon-sm" 
      onClick={handleDownload} 
      className="size-6 mr-1" 
      title="Download Project (ZIP)"
    >
      <Download className="size-4" />
    </Button>
  );
}

export function CodePreviewPanel({ code, onClose }: CodePreviewPanelProps) {
  const isHtml = code.trim().toLowerCase().startsWith('<!doctype html') || code.includes('<html')
  
  const template = isHtml ? 'vanilla' : 'react-ts'
  const mainFile = isHtml ? '/index.html' : '/App.tsx'
  const dependencies = isHtml ? {} : {
    "lucide-react": "latest",
    "framer-motion": "latest",
    "tailwind-merge": "latest",
    "clsx": "latest",
  }

  return (
    <div className="flex h-full w-full flex-col border-l border-border bg-background">
      <SandpackProvider
        template={template}
        theme="dark"
        files={{
          [mainFile]: code,
        }}
        customSetup={{
          dependencies
        }}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-2 bg-card">
          <h3 className="text-sm font-medium">Live Preview {isHtml ? '(Vanilla)' : '(React)'}</h3>
          <div className="flex items-center">
            <DownloadButton />
            <Button variant="ghost" size="icon-sm" onClick={onClose} className="size-6" title="Close Preview">
              <X className="size-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden [&_.sp-wrapper]:h-full [&_.sp-layout]:h-full">
          <SandpackLayout style={{ height: "100%" }}>
            <SandpackCodeEditor showLineNumbers showTabs style={{ height: "100%" }} />
            <SandpackPreview showNavigator style={{ height: "100%" }} />
          </SandpackLayout>
        </div>
      </SandpackProvider>
    </div>
  );
}
