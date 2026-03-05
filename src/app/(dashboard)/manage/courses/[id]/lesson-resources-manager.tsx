"use client";

import { useState, useEffect, useCallback } from "react";
import { createDataClient } from "@/lib/supabase/client";
import { Button, Input, Label } from "@/components/ui";
import { FileText, Link as LinkIcon, Loader2, Plus, Trash2, Download } from "lucide-react";

export type ResourceType = "link" | "file" | "document";

interface Resource {
  id: string;
  title: string;
  type: ResourceType;
  url: string;
  order_index: number;
}

interface LessonResourcesManagerProps {
  lessonId: string;
}

export function LessonResourcesManager({ lessonId }: LessonResourcesManagerProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<ResourceType>("link");
  const [newUrl, setNewUrl] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editType, setEditType] = useState<ResourceType>("link");
  const [editUrl, setEditUrl] = useState("");

  const fetchResources = useCallback(async () => {
    setLoading(true);
    const dataClient = createDataClient();
    const { data } = await dataClient
      .from("resources")
      .select("id, title, type, url, order_index")
      .eq("lesson_id", lessonId)
      .order("order_index", { ascending: true });
    setResources((data as Resource[]) || []);
    setLoading(false);
  }, [lessonId]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  async function addResource() {
    if (!newTitle.trim() || !newUrl.trim()) return;
    setSaving(true);
    const dataClient = createDataClient();
    const { data, error } = await dataClient
      .from("resources")
      .insert({
        lesson_id: lessonId,
        title: newTitle.trim(),
        type: newType,
        url: newUrl.trim(),
        order_index: resources.length,
      })
      .select()
      .single();

    if (!error && data) {
      setResources([...resources, data as Resource]);
      setNewTitle("");
      setNewUrl("");
      setNewType("link");
    }
    setSaving(false);
  }

  async function updateResource(id: string) {
    if (!editTitle.trim() || !editUrl.trim()) return;
    setSaving(true);
    const dataClient = createDataClient();
    await dataClient
      .from("resources")
      .update({
        title: editTitle.trim(),
        type: editType,
        url: editUrl.trim(),
      })
      .eq("id", id);

    setResources(
      resources.map((r) =>
        r.id === id ? { ...r, title: editTitle.trim(), type: editType, url: editUrl.trim() } : r
      )
    );
    setEditingId(null);
    setSaving(false);
  }

  async function deleteResource(id: string) {
    if (!confirm("Remover este recurso?")) return;
    setSaving(true);
    const dataClient = createDataClient();
    await dataClient.from("resources").delete().eq("id", id);
    setResources(resources.filter((r) => r.id !== id));
    setSaving(false);
  }

  function startEdit(r: Resource) {
    setEditingId(r.id);
    setEditTitle(r.title);
    setEditType(r.type);
    setEditUrl(r.url);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  const typeLabel = (t: ResourceType) => {
    switch (t) {
      case "link":
        return "Link";
      case "file":
        return "Arquivo";
      case "document":
        return "Documento";
    }
  };

  const typeIcon = (t: ResourceType) => {
    switch (t) {
      case "link":
        return LinkIcon;
      case "file":
        return Download;
      case "document":
        return FileText;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-2 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando recursos...
      </div>
    );
  }

  return (
    <div className="space-y-3 pl-6 border-l-2 border-slate-200 dark:border-slate-700">
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
        Materiais de apoio (planilhas, documentos, links)
      </p>

      {resources.length === 0 && !editingId && (
        <p className="text-sm text-slate-500">Nenhum recurso. Adicione abaixo.</p>
      )}

      <ul className="space-y-2">
        {resources.map((r) => (
          <li key={r.id} className="flex items-center gap-2 text-sm">
            {editingId === r.id ? (
              <div className="flex-1 grid grid-cols-1 gap-2 sm:grid-cols-12">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Título"
                  className="sm:col-span-4"
                />
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value as ResourceType)}
                  className="h-9 rounded-md border border-slate-300 bg-white px-3 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 sm:col-span-2"
                >
                  <option value="link">Link</option>
                  <option value="file">Arquivo</option>
                  <option value="document">Documento</option>
                </select>
                <Input
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  placeholder="URL"
                  className="sm:col-span-4"
                />
                <div className="flex gap-1 sm:col-span-2">
                  <Button size="sm" onClick={() => updateResource(r.id)} disabled={saving}>
                    Salvar
                  </Button>
                  <Button size="sm" variant="ghost" onClick={cancelEdit}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <span className="flex-shrink-0 text-slate-400">
                  {(() => {
                    const Icon = typeIcon(r.type);
                    return <Icon className="h-4 w-4" />;
                  })()}
                </span>
                <span className="min-w-0 flex-1 truncate" title={r.title}>
                  {r.title}
                </span>
                <span className="text-slate-500">({typeLabel(r.type)})</span>
                <Button variant="ghost" size="sm" onClick={() => startEdit(r)} disabled={saving}>
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteResource(r.id)}
                  disabled={saving}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </>
            )}
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-12">
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Título do recurso"
          className="sm:col-span-4"
        />
        <select
          value={newType}
          onChange={(e) => setNewType(e.target.value as ResourceType)}
          className="h-9 rounded-md border border-slate-300 bg-white px-3 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 sm:col-span-2"
        >
          <option value="link">Link</option>
          <option value="file">Arquivo</option>
          <option value="document">Documento</option>
        </select>
        <Input
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="URL (link ou download)"
          className="sm:col-span-4"
        />
        <Button
          size="sm"
          onClick={addResource}
          disabled={saving || !newTitle.trim() || !newUrl.trim()}
          className="sm:col-span-2"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Adicionar
        </Button>
      </div>
    </div>
  );
}
