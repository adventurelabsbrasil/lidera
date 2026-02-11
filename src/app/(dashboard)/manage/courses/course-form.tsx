"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "@/components/ui";
import { Loader2, Save } from "lucide-react";
import type { Course } from "@/types/database";

interface CourseFormProps {
  orgId: string;
  course?: Course;
}

export function CourseForm({ orgId, course }: CourseFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(course?.title || "");
  const [description, setDescription] = useState(course?.description || "");
  const [thumbnailUrl, setThumbnailUrl] = useState(course?.thumbnail_url || "");
  const [published, setPublished] = useState(course?.published || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!course;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    if (isEditing) {
      const { error } = await supabase
        .from("courses")
        .update({
          title,
          description,
          thumbnail_url: thumbnailUrl || null,
          published,
          updated_at: new Date().toISOString(),
        })
        .eq("id", course.id);

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
    } else {
      const { error } = await supabase.from("courses").insert({
        org_id: orgId,
        title,
        description,
        thumbnail_url: thumbnailUrl || null,
        published,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
    }

    router.push("/manage/courses");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informacoes do Curso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titulo *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Lideranca Transformadora"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descricao</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o conteudo do curso..."
              className="w-full min-h-[100px] p-3 rounded-md border border-slate-300 bg-transparent resize-y focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnail">URL da Imagem de Capa</Label>
            <Input
              id="thumbnail"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            <Label htmlFor="published">Publicar curso</Label>
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-4">
        <Button type="submit" disabled={loading || !title}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isEditing ? "Salvar Alteracoes" : "Criar Curso"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
