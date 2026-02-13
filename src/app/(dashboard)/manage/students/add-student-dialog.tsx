"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, Input, Label } from "@/components/ui";
import { Loader2, Plus, X } from "lucide-react";

interface Course {
  id: string;
  title: string;
}

interface AddStudentDialogProps {
  orgId: string;
  courses: Course[];
  invitedBy?: string;
}

export function AddStudentDialog({ orgId, courses, invitedBy }: AddStudentDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    if (selectedCourses.length === 0) {
      setError("Selecione pelo menos um conteúdo.");
      setLoading(false);
      return;
    }

    // Try to find existing user by email (RPC bypasses RLS for this lookup)
    const { data: userId } = await supabase.rpc("find_user_id_by_email", {
      p_email: email.trim(),
    });

    if (userId) {
      // User exists: update profile (org_id, full_name) if allowed by RLS, create enrollments
      await supabase
        .from("profiles")
        .update({
          org_id: orgId,
          ...(fullName.trim() && { full_name: fullName.trim() }),
        })
        .eq("id", userId);

      for (const courseId of selectedCourses) {
        await supabase.from("enrollments").upsert(
          {
            user_id: userId,
            course_id: courseId,
            status: "active",
          },
          { onConflict: "user_id,course_id" }
        );
      }
    } else {
      // User doesn't exist: create pending invite
      const { error: inviteError } = await supabase
        .from("pending_invites")
        .insert({
          email: email.trim().toLowerCase(),
          org_id: orgId,
          course_ids: selectedCourses,
          full_name: fullName.trim() || null,
          invited_by: invitedBy || null,
        });

      if (inviteError) {
        setError(inviteError.message);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    setOpen(false);
    setEmail("");
    setFullName("");
    setSelectedCourses([]);
    router.refresh();
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Adicionar Aluno
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => setOpen(false)}
      />
      <div className="relative bg-white dark:bg-slate-900 rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-semibold mb-4">Adicionar Aluno</h2>
        <p className="text-sm text-slate-500 mb-4">
          Se a pessoa já tem conta, será matriculada. Se não, criaremos um
          convite e ela verá os conteúdos ao se cadastrar.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="aluno@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Nome completo</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nome do aluno"
            />
          </div>

          <div className="space-y-2">
            <Label>Matricular em: *</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {courses.map((course) => (
                <label
                  key={course.id}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedCourses.includes(course.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCourses([...selectedCourses, course.id]);
                      } else {
                        setSelectedCourses(
                          selectedCourses.filter((id) => id !== course.id)
                        );
                      }
                    }}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  <span className="text-sm">{course.title}</span>
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={loading || !email.trim() || selectedCourses.length === 0}
              className="flex-1"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Adicionar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
