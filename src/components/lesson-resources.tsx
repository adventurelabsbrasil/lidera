import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Download, ExternalLink, FileText, Link as LinkIcon } from "lucide-react";

interface ResourceItem {
  id: string;
  title: string;
  type: "link" | "file" | "document";
  url: string;
}

interface LessonResourcesProps {
  resources: ResourceItem[];
}

export function LessonResources({ resources }: LessonResourcesProps) {
  const getIcon = (type: ResourceItem["type"]) => {
    switch (type) {
      case "file":
        return Download;
      case "document":
        return FileText;
      default:
        return LinkIcon;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Materiais de Apoio
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {resources.map((resource) => {
            const Icon = getIcon(resource.type);

            return (
              <a
                key={resource.id}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors dark:bg-slate-800/50 dark:hover:bg-slate-800"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center dark:bg-blue-900/50">
                  <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate dark:text-slate-100">
                    {resource.title}
                  </p>
                  <p className="text-sm text-slate-500 truncate">
                    {resource.type === "link" ? "Link externo" : "Download"}
                  </p>
                </div>
                <ExternalLink className="h-4 w-4 text-slate-400 flex-shrink-0" />
              </a>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
