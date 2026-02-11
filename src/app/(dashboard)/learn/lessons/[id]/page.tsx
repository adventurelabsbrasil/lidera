import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VideoPlayer } from "@/components/video-player";
import { LessonTasks } from "@/components/lesson-tasks";
import { LessonResources } from "@/components/lesson-resources";
import { LessonNotes } from "@/components/lesson-notes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";

interface LessonPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: LessonPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: lesson } = await supabase
    .from("lessons")
    .select("title")
    .eq("id", id)
    .single();

  return {
    title: lesson?.title || "Aula",
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get lesson with module and course info
  const { data: lesson } = await supabase
    .from("lessons")
    .select(`
      *,
      module:modules (
        id,
        title,
        course_id,
        course:courses (
          id,
          title
        )
      ),
      tasks (*),
      resources (*)
    `)
    .eq("id", id)
    .single();

  if (!lesson) {
    notFound();
  }

  // Check enrollment
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("*")
    .eq("user_id", user!.id)
    .eq("course_id", lesson.module?.course_id)
    .eq("status", "active")
    .single();

  if (!enrollment) {
    notFound();
  }

  // Get user's note for this lesson
  const { data: note } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", user!.id)
    .eq("lesson_id", id)
    .single();

  // Get user's task completions
  const { data: taskCompletions } = await supabase
    .from("task_completions")
    .select("task_id")
    .eq("user_id", user!.id);

  const completedTaskIds = new Set(taskCompletions?.map((tc) => tc.task_id) || []);

  // Get user's progress
  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("user_id", user!.id)
    .eq("lesson_id", id)
    .single();

  // Get all lessons in this module for navigation
  const { data: moduleLessons } = await supabase
    .from("lessons")
    .select("id, title, order_index")
    .eq("module_id", lesson.module?.id)
    .order("order_index");

  const currentIndex = moduleLessons?.findIndex((l) => l.id === id) ?? -1;
  const prevLesson = currentIndex > 0 ? moduleLessons?.[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < (moduleLessons?.length || 0) - 1
      ? moduleLessons?.[currentIndex + 1]
      : null;

  type TaskData = { id: string; title: string; description: string | null; order_index: number };
  type ResourceData = { id: string; title: string; type: "link" | "file" | "document"; url: string; order_index: number };
  
  const sortedTasks: TaskData[] = (lesson.tasks as TaskData[] | null)?.sort((a: TaskData, b: TaskData) => a.order_index - b.order_index) || [];
  const sortedResources: ResourceData[] = (lesson.resources as ResourceData[] | null)?.sort((a: ResourceData, b: ResourceData) => a.order_index - b.order_index) || [];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link
          href={`/learn/courses/${lesson.module?.course_id}`}
          className="hover:text-slate-900 dark:hover:text-slate-100"
        >
          {lesson.module?.course?.title}
        </Link>
        <span>/</span>
        <span>{lesson.module?.title}</span>
      </div>

      {/* Lesson title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {lesson.title}
        </h1>
        {lesson.description && (
          <p className="mt-2 text-slate-500">{lesson.description}</p>
        )}
      </div>

      {/* Video player */}
      {lesson.youtube_url && (
        <VideoPlayer
          youtubeUrl={lesson.youtube_url}
          lessonId={lesson.id}
          userId={user!.id}
          initialProgress={progress?.watched_seconds || 0}
          isCompleted={progress?.completed || false}
        />
      )}

      {/* Content */}
      {lesson.content && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Conteudo da Aula
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-slate max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />
          </CardContent>
        </Card>
      )}

      {/* Tasks */}
      {sortedTasks.length > 0 && (
        <LessonTasks
          tasks={sortedTasks}
          completedTaskIds={completedTaskIds}
          userId={user!.id}
        />
      )}

      {/* Resources */}
      {sortedResources.length > 0 && (
        <LessonResources resources={sortedResources} />
      )}

      {/* Notes */}
      <LessonNotes
        lessonId={lesson.id}
        userId={user!.id}
        initialContent={note?.content || ""}
      />

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t">
        {prevLesson ? (
          <Link
            href={`/learn/lessons/${prevLesson.id}`}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{prevLesson.title}</span>
            <span className="sm:hidden">Anterior</span>
          </Link>
        ) : (
          <div />
        )}
        {nextLesson ? (
          <Link
            href={`/learn/lessons/${nextLesson.id}`}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <span className="hidden sm:inline">{nextLesson.title}</span>
            <span className="sm:hidden">Proxima</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
