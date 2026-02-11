import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CourseForm } from "../course-form";

export const metadata: Metadata = {
  title: "Novo Curso",
  description: "Criar um novo curso",
};

export default async function NewCoursePage() {
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

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Novo Curso
        </h1>
        <p className="text-slate-500">Crie um novo curso para seus alunos</p>
      </div>

      <CourseForm orgId={profile.org_id!} />
    </div>
  );
}
