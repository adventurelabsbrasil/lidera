import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui";
import { Button } from "@/components/ui";
import { Plus, Users } from "lucide-react";
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

  // Get students for this organization
  const { data: students } = await supabase
    .from("profiles")
    .select(`
      *,
      enrollments (
        id,
        status,
        courses (title)
      )
    `)
    .eq("org_id", profile.org_id!)
    .eq("role", "student")
    .order("created_at", { ascending: false });

  // Get courses for enrollment dropdown
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
            {students?.length || 0} aluno(s) cadastrado(s)
          </p>
        </div>
        <AddStudentDialog orgId={profile.org_id!} courses={courses || []} />
      </div>

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
          {students.map((student: {
            id: string;
            full_name: string | null;
            email: string;
            created_at: string;
            enrollments: { id: string; status: string; courses: { title: string } | null }[] | null;
          }) => (
            <Card key={student.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-slate-100">
                      {student.full_name || "Sem nome"}
                    </h3>
                    <p className="text-sm text-slate-500">{student.email}</p>
                    <div className="flex gap-2 mt-2">
                      {student.enrollments?.map((enrollment: { id: string; status: string; courses: { title: string } | null }) => (
                        <span
                          key={enrollment.id}
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
