import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getYouTubeThumbnail } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Meus Cursos",
  description: "Seus cursos matriculados",
};

export default async function CoursesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get enrolled courses with details
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      *,
      courses (
        id,
        title,
        description,
        thumbnail_url,
        modules (
          id,
          lessons (id)
        )
      )
    `)
    .eq("user_id", user!.id)
    .eq("status", "active");

  // Get user's lesson progress
  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id, completed")
    .eq("user_id", user!.id)
    .eq("completed", true);

  const completedLessonIds = new Set(progress?.map((p: { lesson_id: string }) => p.lesson_id) || []);

  type ModuleWithLessons = { id: string; lessons: { id: string }[] | null };
  type CourseWithModules = { 
    id: string; 
    title: string; 
    description: string | null; 
    thumbnail_url: string | null;
    modules: ModuleWithLessons[] | null;
  };

  const coursesWithProgress = enrollments?.map((enrollment: { courses: CourseWithModules | null }) => {
    const course = enrollment.courses;
    if (!course) return null;

    const allLessons = course.modules?.flatMap((m: ModuleWithLessons) => m.lessons || []) || [];
    const totalLessons = allLessons.length;
    const completedLessons = allLessons.filter((l: { id: string }) =>
      completedLessonIds.has(l.id)
    ).length;
    const progressPercent =
      totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return {
      ...course,
      totalLessons,
      completedLessons,
      progressPercent,
    };
  }).filter(Boolean);

  if (!coursesWithProgress?.length) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Meus Cursos
          </h1>
          <p className="text-slate-500">Seus cursos matriculados</p>
        </div>

        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
              Nenhum curso encontrado
            </h3>
            <p className="text-slate-500 mt-2">
              Voce ainda nao esta matriculado em nenhum curso.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Meus Cursos
        </h1>
        <p className="text-slate-500">
          {coursesWithProgress.length} curso(s) ativo(s)
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {coursesWithProgress.map((course) => (
          <Link key={course!.id} href={`/learn/courses/${course!.id}`}>
            <Card className="overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="aspect-video relative bg-slate-100 dark:bg-slate-800">
                {course!.thumbnail_url ? (
                  <Image
                    src={course!.thumbnail_url}
                    alt={course!.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-slate-300" />
                  </div>
                )}
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-1">{course!.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {course!.description || "Sem descricao"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Progresso</span>
                    <span className="font-medium">
                      {course!.completedLessons}/{course!.totalLessons} aulas
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
                    <div
                      className="h-full bg-blue-600 transition-all"
                      style={{ width: `${course!.progressPercent}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
