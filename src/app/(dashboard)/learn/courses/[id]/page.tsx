import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { BookOpen, CheckCircle, ChevronRight, Clock, PlayCircle } from "lucide-react";
import Link from "next/link";
import { formatDuration } from "@/lib/utils";

interface CoursePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: CoursePageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: course } = await supabase
    .from("courses")
    .select("title")
    .eq("id", id)
    .single();

  return {
    title: course?.title || "Conteúdo",
  };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check enrollment
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("*")
    .eq("user_id", user!.id)
    .eq("course_id", id)
    .eq("status", "active")
    .single();

  if (!enrollment) {
    redirect("/learn/courses");
  }

  // Get course with modules and lessons
  const { data: course } = await supabase
    .from("courses")
    .select(`
      *,
      modules (
        id,
        title,
        description,
        order_index,
        lessons (
          id,
          title,
          duration_minutes,
          order_index
        )
      )
    `)
    .eq("id", id)
    .single();

  if (!course) {
    notFound();
  }

  // Get user progress
  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id, completed")
    .eq("user_id", user!.id);

  const completedLessonIds = new Set(
    progress?.filter((p) => p.completed).map((p) => p.lesson_id) || []
  );

  // Sort modules and lessons
  type ModuleData = { id: string; title: string; description: string | null; order_index: number; lessons: LessonData[] | null };
  type LessonData = { id: string; title: string; duration_minutes: number | null; order_index: number };
  
  const sortedModules = (course.modules as ModuleData[] | null)
    ?.sort((a: ModuleData, b: ModuleData) => a.order_index - b.order_index)
    .map((module: ModuleData) => ({
      ...module,
      lessons: module.lessons?.sort((a: LessonData, b: LessonData) => a.order_index - b.order_index) || [],
    })) || [];

  const totalLessons = sortedModules.reduce(
    (acc, m) => acc + (m.lessons?.length || 0),
    0
  );
  const completedCount = sortedModules.reduce(
    (acc, m) =>
      acc + (m.lessons?.filter((l) => completedLessonIds.has(l.id)).length || 0),
    0
  );
  const totalDuration = sortedModules.reduce(
    (acc, m) =>
      acc + (m.lessons?.reduce((a, l) => a + (l.duration_minutes || 0), 0) || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Course header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold">{course.title}</h1>
        {course.description && (
          <p className="mt-2 text-blue-100">{course.description}</p>
        )}
        <div className="flex gap-6 mt-4 text-blue-100">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>{totalLessons} aulas</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{formatDuration(totalDuration)}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span>{completedCount} concluídas</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progresso do conteúdo</span>
            <span className="text-sm text-slate-500">
              {Math.round((completedCount / totalLessons) * 100) || 0}%
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{
                width: `${(completedCount / totalLessons) * 100 || 0}%`,
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Modules */}
      <div className="space-y-4">
        {sortedModules.map((module, moduleIndex) => {
          const moduleLessonsCompleted =
            module.lessons?.filter((l) => completedLessonIds.has(l.id)).length || 0;
          const moduleTotalLessons = module.lessons?.length || 0;

          return (
            <Card key={module.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Modulo {moduleIndex + 1}: {module.title}
                  </CardTitle>
                  <span className="text-sm text-slate-500">
                    {moduleLessonsCompleted}/{moduleTotalLessons}
                  </span>
                </div>
                {module.description && (
                  <p className="text-sm text-slate-500">{module.description}</p>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {module.lessons?.map((lesson, lessonIndex) => {
                    const isCompleted = completedLessonIds.has(lesson.id);

                    return (
                      <Link
                        key={lesson.id}
                        href={`/learn/lessons/${lesson.id}`}
                        className="flex items-center gap-4 py-3 hover:bg-slate-50 -mx-6 px-6 transition-colors dark:hover:bg-slate-800/50"
                      >
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            isCompleted
                              ? "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400"
                              : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <PlayCircle className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-medium truncate ${
                              isCompleted
                                ? "text-slate-500 line-through"
                                : "text-slate-900 dark:text-slate-100"
                            }`}
                          >
                            {lessonIndex + 1}. {lesson.title}
                          </p>
                          {lesson.duration_minutes && (
                            <p className="text-sm text-slate-500">
                              {formatDuration(lesson.duration_minutes)}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
