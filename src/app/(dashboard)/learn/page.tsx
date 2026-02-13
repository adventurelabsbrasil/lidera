import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { BookOpen, CheckCircle, Clock, PlayCircle, Trophy } from "lucide-react";
import Link from "next/link";
import { formatStudyTime } from "@/lib/utils";
import { getAuthUser } from "@/lib/supabase/auth-helpers";

export const metadata: Metadata = {
  title: "Início",
  description: "Sua área de aprendizado",
};

export default async function LearnPage() {
  const supabase = await createClient();
  const user = await getAuthUser(supabase);
  if (!user) redirect("/auth/login");

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Get enrolled courses count
  const { count: enrolledCount } = await supabase
    .from("enrollments")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "active");

  // Get completed lessons count
  const { count: completedLessons } = await supabase
    .from("lesson_progress")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("completed", true);

  // Get completed tasks count
  const { count: completedTasks } = await supabase
    .from("task_completions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Get total study time (watched_seconds)
  const { data: progressRows } = await supabase
    .from("lesson_progress")
    .select("watched_seconds")
    .eq("user_id", user.id);
  const totalWatchedSeconds =
    progressRows?.reduce((acc, row) => acc + (row.watched_seconds || 0), 0) || 0;

  // Get "Continue de onde parou" - first incomplete lesson across enrolled courses
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      courses (
        id,
        title,
        modules (
          id,
          order_index,
          lessons (
            id,
            title,
            order_index
          )
        )
      )
    `)
    .eq("user_id", user.id)
    .eq("status", "active");

  const { data: completedProgress } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", user.id)
    .eq("completed", true);
  const completedLessonIds = new Set(completedProgress?.map((p) => p.lesson_id) || []);

  type LessonData = { id: string; title: string; order_index: number };
  type ModuleData = { id: string; order_index: number; lessons: LessonData[] | null };
  type CourseData = { id: string; title: string; modules: ModuleData[] | null };

  let continueLesson: { lessonId: string; lessonTitle: string; courseTitle: string } | null = null;
  for (const enr of enrollments || []) {
    const raw = enr.courses;
    const course = (Array.isArray(raw) ? raw[0] : raw) as CourseData | null;
    if (!course?.modules) continue;
    const sortedModules = [...course.modules].sort((a, b) => a.order_index - b.order_index);
    for (const mod of sortedModules) {
      const lessons = mod.lessons?.sort((a, b) => a.order_index - b.order_index) || [];
      for (const lesson of lessons) {
        if (!completedLessonIds.has(lesson.id)) {
          continueLesson = {
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            courseTitle: course.title,
          };
          break;
        }
      }
      if (continueLesson) break;
    }
    if (continueLesson) break;
  }

  const firstName = profile?.full_name?.split(" ")[0] || "Aluno";

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold">Olá, {firstName}!</h1>
        <p className="mt-2 text-blue-100">
          Bem-vindo de volta à sua área de aprendizado. Continue de onde parou!
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Conteúdos Ativos
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
              Aulas Concluídas
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
            <div className="text-2xl font-bold">{formatStudyTime(totalWatchedSeconds)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Continue de onde parou */}
      {continueLesson && (
        <Link href={`/learn/lessons/${continueLesson.lessonId}`}>
          <Card className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <PlayCircle className="h-5 w-5" />
                Continue de onde parou
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                <span className="font-medium text-slate-900 dark:text-slate-100">{continueLesson.courseTitle}</span>
                {" — "}
                {continueLesson.lessonTitle}
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      )}

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/learn/courses">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Meus Conteúdos
              </CardTitle>
              <CardDescription>
                Acesse seus conteúdos e continue aprendendo
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/learn/settings">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-600" />
                Preferências
              </CardTitle>
              <CardDescription>
                Configure suas preferências de aprendizado
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
