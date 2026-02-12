"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { CheckSquare, Square } from "lucide-react";

interface TaskItem {
  id: string;
  title: string;
  description: string | null;
}

interface LessonTasksProps {
  tasks: TaskItem[];
  completedTaskIds: Set<string>;
  userId: string;
}

export function LessonTasks({
  tasks,
  completedTaskIds,
  userId,
}: LessonTasksProps) {
  const [completed, setCompleted] = useState(completedTaskIds);
  const [loading, setLoading] = useState<string | null>(null);

  async function toggleTask(taskId: string) {
    setLoading(taskId);
    const supabase = createClient();
    const isCompleted = completed.has(taskId);

    if (isCompleted) {
      // Remove completion
      const { error } = await supabase
        .from("task_completions")
        .delete()
        .eq("user_id", userId)
        .eq("task_id", taskId);

      if (!error) {
        setCompleted((prev) => {
          const newSet = new Set(prev);
          newSet.delete(taskId);
          return newSet;
        });
      }
    } else {
      // Add completion
      const { error } = await supabase.from("task_completions").insert({
        user_id: userId,
        task_id: taskId,
      });

      if (!error) {
        setCompleted((prev) => new Set(prev).add(taskId));
      }
    }

    setLoading(null);
  }

  const completedCount = tasks.filter((t) => completed.has(t.id)).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Tarefas da Aula
          </CardTitle>
          <span className="text-sm text-slate-500">
            {completedCount}/{tasks.length} concluídas
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tasks.map((task) => {
            const isCompleted = completed.has(task.id);
            const isLoading = loading === task.id;

            return (
              <button
                key={task.id}
                onClick={() => toggleTask(task.id)}
                disabled={isLoading}
                className={`flex items-start gap-3 w-full p-3 rounded-lg text-left transition-colors ${
                  isCompleted
                    ? "bg-green-50 dark:bg-green-900/20"
                    : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {isCompleted ? (
                    <CheckSquare className="h-5 w-5 text-green-600" />
                  ) : (
                    <Square className="h-5 w-5 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-medium ${
                      isCompleted
                        ? "text-green-700 line-through dark:text-green-400"
                        : "text-slate-900 dark:text-slate-100"
                    }`}
                  >
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-sm text-slate-500 mt-1">
                      {task.description}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
