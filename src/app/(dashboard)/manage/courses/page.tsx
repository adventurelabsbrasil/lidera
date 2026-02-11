import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { Button } from "@/components/ui";
import { BookOpen, Edit, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Gerenciar Cursos",
  description: "Gerencie seus cursos",
};

export default async function ManageCoursesPage() {
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

  // Get courses for this organization
  const { data: courses } = await supabase
    .from("courses")
    .select(`
      *,
      modules (
        id,
        lessons (id)
      ),
      enrollments (id)
    `)
    .eq("org_id", profile.org_id!)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Cursos
          </h1>
          <p className="text-slate-500">Gerencie seus cursos</p>
        </div>
        <Link href="/manage/courses/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Curso
          </Button>
        </Link>
      </div>

      {!courses?.length ? (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
              Nenhum curso criado
            </h3>
            <p className="text-slate-500 mt-2">
              Comece criando seu primeiro curso
            </p>
            <Link href="/manage/courses/new">
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Criar Curso
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {courses.map((course: { 
            id: string; 
            title: string; 
            description: string | null;
            thumbnail_url: string | null;
            published: boolean;
            modules: { id: string; lessons: { id: string }[] | null }[] | null;
            enrollments: { id: string }[] | null;
          }) => {
            type ModuleData = { id: string; lessons: { id: string }[] | null };
            const totalLessons =
              course.modules?.reduce(
                (acc: number, m: ModuleData) => acc + (m.lessons?.length || 0),
                0
              ) || 0;
            const totalEnrollments = course.enrollments?.length || 0;

            return (
              <Card key={course.id}>
                <div className="flex flex-col sm:flex-row">
                  <div className="w-full sm:w-48 h-32 relative bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                    {course.thumbnail_url ? (
                      <Image
                        src={course.thumbnail_url}
                        alt={course.title}
                        fill
                        className="object-cover rounded-t-xl sm:rounded-l-xl sm:rounded-tr-none"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                          {course.title}
                        </h3>
                        <p className="text-sm text-slate-500 line-clamp-2 mt-1">
                          {course.description || "Sem descricao"}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          course.published
                            ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400"
                        }`}
                      >
                        {course.published ? "Publicado" : "Rascunho"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
                      <span>{totalLessons} aulas</span>
                      <span>{totalEnrollments} matriculas</span>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <Link href={`/manage/courses/${course.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="mr-2 h-3 w-3" />
                          Editar
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
