"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, Input, Label } from "@/components/ui";
import { ChevronDown, ChevronRight, Loader2, Plus, Trash2 } from "lucide-react";

interface Module {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  youtube_url: string | null;
  order_index: number;
  duration_minutes: number | null;
}

interface ModuleManagerProps {
  courseId: string;
  modules: Module[];
}

export function ModuleManager({ courseId, modules: initialModules }: ModuleManagerProps) {
  const router = useRouter();
  const [modules, setModules] = useState(initialModules);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<string | null>(null);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [addingModule, setAddingModule] = useState(false);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  async function addModule() {
    if (!newModuleTitle.trim()) return;
    setAddingModule(true);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("modules")
      .insert({
        course_id: courseId,
        title: newModuleTitle,
        order_index: modules.length,
      })
      .select()
      .single();

    if (!error && data) {
      setModules([...modules, { ...data, lessons: [] }]);
      setNewModuleTitle("");
    }

    setAddingModule(false);
  }

  async function addLesson(moduleId: string) {
    setLoading(moduleId);
    const supabase = createClient();

    const module = modules.find((m) => m.id === moduleId);
    const lessonsCount = module?.lessons.length || 0;

    const { data, error } = await supabase
      .from("lessons")
      .insert({
        module_id: moduleId,
        title: `Nova Aula ${lessonsCount + 1}`,
        order_index: lessonsCount,
      })
      .select()
      .single();

    if (!error && data) {
      setModules(
        modules.map((m) =>
          m.id === moduleId
            ? { ...m, lessons: [...m.lessons, data] }
            : m
        )
      );
      setExpandedModules((prev) => new Set(prev).add(moduleId));
    }

    setLoading(null);
  }

  async function deleteModule(moduleId: string) {
    if (!confirm("Tem certeza que deseja excluir este modulo e todas as aulas?")) {
      return;
    }

    setLoading(moduleId);
    const supabase = createClient();

    const { error } = await supabase
      .from("modules")
      .delete()
      .eq("id", moduleId);

    if (!error) {
      setModules(modules.filter((m) => m.id !== moduleId));
    }

    setLoading(null);
  }

  async function updateLesson(
    moduleId: string,
    lessonId: string,
    field: string,
    value: string | number
  ) {
    const supabase = createClient();

    await supabase
      .from("lessons")
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq("id", lessonId);

    setModules(
      modules.map((m) =>
        m.id === moduleId
          ? {
              ...m,
              lessons: m.lessons.map((l) =>
                l.id === lessonId ? { ...l, [field]: value } : l
              ),
            }
          : m
      )
    );
  }

  async function deleteLesson(moduleId: string, lessonId: string) {
    if (!confirm("Tem certeza que deseja excluir esta aula?")) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("lessons")
      .delete()
      .eq("id", lessonId);

    if (!error) {
      setModules(
        modules.map((m) =>
          m.id === moduleId
            ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) }
            : m
        )
      );
    }
  }

  return (
    <div className="space-y-4">
      {modules.map((module, moduleIndex) => {
        const isExpanded = expandedModules.has(module.id);
        const isLoading = loading === module.id;

        return (
          <div
            key={module.id}
            className="border rounded-lg overflow-hidden dark:border-slate-700"
          >
            <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50">
              <button
                onClick={() => toggleModule(module.id)}
                className="p-1 hover:bg-slate-200 rounded dark:hover:bg-slate-700"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              <span className="flex-1 font-medium">
                Modulo {moduleIndex + 1}: {module.title}
              </span>
              <span className="text-sm text-slate-500">
                {module.lessons.length} aulas
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => addLesson(module.id)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteModule(module.id)}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>

            {isExpanded && (
              <div className="p-3 space-y-3">
                {module.lessons.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">
                    Nenhuma aula ainda. Clique em + para adicionar.
                  </p>
                ) : (
                  module.lessons
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((lesson, lessonIndex) => (
                      <div
                        key={lesson.id}
                        className="flex items-start gap-3 p-3 bg-white rounded-lg border dark:bg-slate-900 dark:border-slate-700"
                      >
                        <span className="text-sm text-slate-500 mt-2">
                          {lessonIndex + 1}.
                        </span>
                        <div className="flex-1 space-y-2">
                          <Input
                            value={lesson.title}
                            onChange={(e) =>
                              updateLesson(
                                module.id,
                                lesson.id,
                                "title",
                                e.target.value
                              )
                            }
                            placeholder="Titulo da aula"
                          />
                          <Input
                            value={lesson.youtube_url || ""}
                            onChange={(e) =>
                              updateLesson(
                                module.id,
                                lesson.id,
                                "youtube_url",
                                e.target.value
                              )
                            }
                            placeholder="URL do YouTube"
                          />
                          <Input
                            type="number"
                            value={lesson.duration_minutes || ""}
                            onChange={(e) =>
                              updateLesson(
                                module.id,
                                lesson.id,
                                "duration_minutes",
                                parseInt(e.target.value) || 0
                              )
                            }
                            placeholder="Duracao (minutos)"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteLesson(module.id, lesson.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Add new module */}
      <div className="flex gap-2">
        <Input
          value={newModuleTitle}
          onChange={(e) => setNewModuleTitle(e.target.value)}
          placeholder="Nome do novo modulo"
          onKeyDown={(e) => e.key === "Enter" && addModule()}
        />
        <Button onClick={addModule} disabled={addingModule || !newModuleTitle.trim()}>
          {addingModule ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Adicionar Modulo
        </Button>
      </div>
    </div>
  );
}
