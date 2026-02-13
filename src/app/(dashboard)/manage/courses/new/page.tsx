import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NewCourseClient } from "../new-course-client";

export const metadata: Metadata = {
  title: "Novo Conteúdo",
  description: "Criar um novo conteúdo",
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

  const orgId = profile.org_id ?? null;
  let organizations: { id: string; name: string; slug: string }[] = [];

  if (profile.role === "admin" && !orgId) {
    const { data: orgs } = await supabase
      .from("organizations")
      .select("id, name, slug")
      .order("name");
    organizations = orgs ?? [];
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Novo Conteúdo
        </h1>
        <p className="text-slate-500">
          {orgId
            ? "Crie um novo conteúdo para seus alunos"
            : "Escolha a organização e preencha os dados do conteúdo"}
        </p>
      </div>

      <NewCourseClient organizations={organizations} defaultOrgId={orgId} />
    </div>
  );
}
