import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { BookOpen, CheckCircle, Clock, Trophy } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Inicio",
  description: "Sua area de aprendizado",
};

export default async function LearnPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  // Get enrolled courses count
  const { count: enrolledCount } = await supabase
    .from("enrollments")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id)
    .eq("status", "active");

  // Get completed lessons count
  const { count: completedLessons } = await supabase
    .from("lesson_progress")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id)
    .eq("completed", true);

  // Get completed tasks count
  const { count: completedTasks } = await supabase
    .from("task_completions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id);

  const firstName = profile?.full_name?.split(" ")[0] || "Aluno";

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold">Ola, {firstName}!</h1>
        <p className="mt-2 text-blue-100">
          Bem-vindo de volta a sua area de aprendizado. Continue de onde parou!
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Cursos Ativos
            </CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrolledCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Aulas Concluidas
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedLessons || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Tarefas Feitas
            </CardTitle>
            <Trophy className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Tempo de Estudo
            </CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0h</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/learn/courses">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Meus Cursos
              </CardTitle>
              <CardDescription>
                Acesse seus cursos e continue aprendendo
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/learn/settings">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-600" />
                Preferencias
              </CardTitle>
              <CardDescription>
                Configure suas preferencias de aprendizado
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
