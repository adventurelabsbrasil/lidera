"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "@/components/ui";
import { Loader2, Save } from "lucide-react";

interface PreferencesFormProps {
  userId: string;
  initialData: {
    full_name: string;
    email: string;
    preferences: Record<string, unknown>;
  };
}

export function PreferencesForm({ userId, initialData }: PreferencesFormProps) {
  const [fullName, setFullName] = useState(initialData.full_name);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      setMessage({ type: "error", text: "Erro ao salvar preferencias" });
    } else {
      setMessage({ type: "success", text: "Preferencias salvas com sucesso!" });
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informacoes Pessoais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nome Completo</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Seu nome completo"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={initialData.email}
              disabled
              className="bg-slate-50 dark:bg-slate-800"
            />
            <p className="text-xs text-slate-500">
              O email nao pode ser alterado
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferencias de Aprendizado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notificacoes por Email</p>
              <p className="text-sm text-slate-500">
                Receba atualizacoes sobre novos conteudos
              </p>
            </div>
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300"
              defaultChecked
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Autoplay de Videos</p>
              <p className="text-sm text-slate-500">
                Iniciar videos automaticamente
              </p>
            </div>
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300"
              defaultChecked
            />
          </div>
        </CardContent>
      </Card>

      {message && (
        <p
          className={`text-sm ${
            message.type === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {message.text}
        </p>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        Salvar Preferencias
      </Button>
    </form>
  );
}
