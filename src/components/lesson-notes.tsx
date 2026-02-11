"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Button } from "@/components/ui";
import { Loader2, PenLine, Save } from "lucide-react";

interface LessonNotesProps {
  lessonId: string;
  userId: string;
  initialContent: string;
}

export function LessonNotes({ lessonId, userId, initialContent }: LessonNotesProps) {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(
    initialContent ? new Date() : null
  );

  const saveNote = useCallback(async () => {
    if (!content.trim()) return;
    
    setSaving(true);
    const supabase = createClient();

    const { error } = await supabase.from("notes").upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        content: content,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,lesson_id",
      }
    );

    if (!error) {
      setLastSaved(new Date());
    }
    setSaving(false);
  }, [content, lessonId, userId]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <PenLine className="h-5 w-5" />
            Minhas Anotacoes
          </CardTitle>
          {lastSaved && (
            <span className="text-xs text-slate-500">
              Salvo em {lastSaved.toLocaleTimeString("pt-BR")}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escreva suas anotacoes sobre esta aula..."
          className="w-full min-h-[200px] p-4 rounded-lg border border-slate-200 bg-white resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
        />
        <div className="flex justify-end">
          <Button onClick={saveNote} disabled={saving || !content.trim()}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Salvar Anotacoes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
