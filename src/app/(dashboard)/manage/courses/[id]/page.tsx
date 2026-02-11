import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CourseForm } from "../course-form";
import { ModuleManager } from "./module-manager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

interface EditCoursePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: EditCoursePageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: course } = await supabase
    .from("courses")
    .select("title")
    .eq("id", id)
    .single();

  return {
    title: `Editar: ${course?.title || "Curso"}`,
  };
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const { id } = await params;
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
          youtube_url,
          order_index,
          duration_minutes
        )
      )
    `)
    .eq("id", id)
    .eq("org_id", profile.org_id!)
    .single();

  if (!course) {
    notFound();
  }

  type ModuleWithLessons = {
    id: string;
    title: string;
    description: string | null;
    order_index: number;
    lessons: { id: string; title: string; youtube_url: string | null; order_index: number; duration_minutes: number | null }[];
  };
  
  const sortedModules =
    (course.modules as ModuleWithLessons[] | null)?.sort((a: ModuleWithLessons, b: ModuleWithLessons) => a.order_index - b.order_index) || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Editar Curso
        </h1>
        <p className="text-slate-500">{course.title}</p>
      </div>

      <CourseForm orgId={profile.org_id!} course={course} />

      <Card>
        <CardHeader>
          <CardTitle>Modulos e Aulas</CardTitle>
        </CardHeader>
        <CardContent>
          <ModuleManager courseId={course.id} modules={sortedModules} />
        </CardContent>
      </Card>
    </div>
  );
}
