import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui";
import { Button } from "@/components/ui";
import { Clock, Plus, Users } from "lucide-react";
import { AddStudentDialog } from "./add-student-dialog";

export const metadata: Metadata = {
  title: "Gerenciar Alunos",
  description: "Gerencie seus alunos",
};

export default async function ManageStudentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  if (!profile || (profile.role !== "tenant" && profile.role !== "admin")) {
    redirect("/learn");
  }

  // Get students: users enrolled in our org's courses (includes org members + cross-enrolled)
  const { data: courseIds } = await supabase
    .from("courses")
    .select("id")
    .eq("org_id", profile.org_id!);
  const ids = courseIds?.map((c) => c.id) || [];

  const { data: enrollmentsData } =
    ids.length > 0
      ? await supabase
          .from("enrollments")
          .select(`
            user_id,
            status,
            courses (title)
          `)
          .in("course_id", ids)
          .eq("status", "active")
      : { data: [] };

  const uniqueUserIds = [
    ...new Set((enrollmentsData || []).map((e: { user_id: string }) => e.user_id)),
  ];
  const { data: students } =
    uniqueUserIds.length > 0
      ? await supabase
          .from("profiles")
          .select(`
            id,
            full_name,
            email,
            created_at,
            org_id
          `)
          .in("id", uniqueUserIds)
      : { data: [] };

  const enrollmentsByUser: Record<string, { status: string; courses: { title: string } | null }[]> = {};
  for (const e of enrollmentsData || []) {
    const row = e as { user_id: string; status: string; courses: { title: string } | { title: string }[] | null };
    const key = row.user_id;
    if (!enrollmentsByUser[key]) enrollmentsByUser[key] = [];
    const courses = Array.isArray(row.courses) ? row.courses[0] : row.courses;
    enrollmentsByUser[key].push({ status: row.status, courses: courses ?? null });
  }

  const { data: pendingInvites } = await supabase
    .from("pending_invites")
    .select("id, email, full_name, course_ids, created_at")
    .eq("org_id", profile.org_id!)
    .order("created_at", { ascending: false });

  const { data: courses } = await supabase
    .from("courses")
    .select("id, title")
    .eq("org_id", profile.org_id!)
    .eq("published", true);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Alunos
          </h1>
          <p className="text-slate-500">
            {(students || []).length} aluno(s) matriculado(s)
          </p>
        </div>
        <AddStudentDialog
          orgId={profile.org_id!}
          courses={courses || []}
          invitedBy={user!.id}
        />
      </div>

      {pendingInvites && pendingInvites.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-amber-500" />
              Convites pendentes ({pendingInvites.length})
            </h3>
            <p className="text-sm text-slate-500 mb-3">
              Estas pessoas foram convidadas e verão os cursos ao se cadastrarem.
            </p>
            <div className="space-y-2">
              {pendingInvites.map((inv: { id: string; email: string; full_name: string | null; created_at: string }) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0"
                >
                  <div>
                    <p className="font-medium">{inv.full_name || inv.email}</p>
                    <p className="text-sm text-slate-500">{inv.email}</p>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(inv.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!students?.length ? (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
              Nenhum aluno cadastrado
            </h3>
            <p className="text-slate-500 mt-2">
              Adicione seu primeiro aluno
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {(students || []).map((student: {
            id: string;
            full_name: string | null;
            email: string;
            created_at: string;
          }) => (
            <Card key={student.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-slate-100">
                      {student.full_name || "Sem nome"}
                    </h3>
                    <p className="text-sm text-slate-500">{student.email}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {(enrollmentsByUser[student.id] || [])
                        .filter((e) => e.courses)
                        .map((enrollment, i) => (
                          <span
                            key={i}
                            className={`px-2 py-0.5 text-xs rounded-full ${
                              enrollment.status === "active"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                          >
                            {(enrollment.courses as { title: string })?.title}
                          </span>
                        ))}
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">
                    Desde{" "}
                    {new Date(student.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
