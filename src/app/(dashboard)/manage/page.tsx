import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, PageHeader } from "@/components/ui";
import { BookOpen, GraduationCap, Users } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Gerenciar",
  description: "Painel de gestão",
};

export default async function ManagePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if user is tenant or admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  if (!profile || (profile.role !== "tenant" && profile.role !== "admin")) {
    redirect("/learn");
  }

  // Get stats for this organization
  const { count: coursesCount } = await supabase
    .from("courses")
    .select("*", { count: "exact", head: true })
    .eq("org_id", profile.org_id!);

  const { count: studentsCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("org_id", profile.org_id!)
    .eq("role", "student");

  const { count: enrollmentsCount } = await supabase
    .from("enrollments")
    .select("*, courses!inner(*)", { count: "exact", head: true })
    .eq("courses.org_id", profile.org_id!)
    .eq("status", "active");

  return (
    <div className="space-y-8">
      <PageHeader
        title="Painel de Gestão"
        description="Gerencie seus cursos e alunos"
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Cursos
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coursesCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Alunos
            </CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentsCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Matrículas Ativas
            </CardTitle>
            <BookOpen className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollmentsCount || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/manage/courses">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                Gerenciar Cursos
              </CardTitle>
              <CardDescription>
                Criar, editar e organizar seus cursos
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/manage/students">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Gerenciar Alunos
              </CardTitle>
              <CardDescription>
                Adicionar alunos e gerenciar matriculas
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
