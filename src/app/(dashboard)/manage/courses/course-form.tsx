"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "@/components/ui";
import { Loader2, Save, Upload, X } from "lucide-react";
import type { Course } from "@/types/database";

interface CourseFormProps {
  orgId: string;
  course?: Course;
}

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function CourseForm({ orgId, course }: CourseFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(course?.title || "");
  const [description, setDescription] = useState(course?.description || "");
  const [thumbnailUrl, setThumbnailUrl] = useState(course?.thumbnail_url || "");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [published, setPublished] = useState(course?.published || false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!course;

  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (thumbnailFile) {
      const url = URL.createObjectURL(thumbnailFile);
      setBlobUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setBlobUrl(null);
  }, [thumbnailFile]);

  const previewUrl = blobUrl || thumbnailUrl || null;

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError("Formato inválido. Use JPEG, PNG, WebP ou GIF.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("A imagem deve ter no máximo 5MB.");
      return;
    }

    setError(null);
    setThumbnailFile(file);
    setThumbnailUrl("");
  }, []);

  const handleRemoveThumbnail = useCallback(() => {
    setThumbnailFile(null);
    setThumbnailUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file && ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        setError(null);
        setThumbnailFile(file);
        setThumbnailUrl("");
      }
    },
    []
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  async function uploadThumbnail(): Promise<string | null> {
    if (!thumbnailFile) return thumbnailUrl || null;

    const supabase = createClient();
    const ext = thumbnailFile.name.split(".").pop() || "jpg";
    const path = isEditing
      ? `${orgId}/${course!.id}/thumb.${ext}`
      : `${orgId}/${crypto.randomUUID()}/thumb.${ext}`;

    setUploading(true);
    const { data, error: uploadError } = await supabase.storage
      .from("course-thumbnails")
      .upload(path, thumbnailFile, { upsert: true });

    setUploading(false);

    if (uploadError) {
      setError(uploadError.message);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("course-thumbnails")
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    let finalThumbnailUrl = thumbnailUrl;

    if (thumbnailFile) {
      const uploadedUrl = await uploadThumbnail();
      if (uploadedUrl === null) {
        setLoading(false);
        return;
      }
      finalThumbnailUrl = uploadedUrl;
    }

    if (isEditing) {
      const { error } = await supabase
        .from("courses")
        .update({
          title,
          description,
          thumbnail_url: finalThumbnailUrl || null,
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
        thumbnail_url: finalThumbnailUrl || null,
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
          <CardTitle>Informações do Conteúdo</CardTitle>
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
            <Label htmlFor="description">Descrição</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o conteúdo..."
              className="w-full min-h-[100px] p-3 rounded-md border border-slate-300 bg-transparent resize-y focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700"
            />
          </div>

          <div className="space-y-2">
            <Label>Imagem de Capa</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(",")}
              onChange={handleFileSelect}
              className="hidden"
            />
            {previewUrl ? (
              <div className="relative inline-block">
                <div className="relative w-full max-w-xs aspect-video rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized={thumbnailFile !== null}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2 bg-white/90 dark:bg-slate-900/90"
                  onClick={handleRemoveThumbnail}
                  disabled={loading || uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="flex flex-col items-center justify-center w-full max-w-xs aspect-video rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
              >
                <Upload className="h-10 w-10 text-slate-400 mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center px-4">
                  Clique ou arraste uma imagem (JPEG, PNG, WebP ou GIF, máx. 5MB)
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            <Label htmlFor="published">Publicar conteúdo</Label>
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
          {isEditing ? "Salvar Alterações" : "Criar Conteúdo"}
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
