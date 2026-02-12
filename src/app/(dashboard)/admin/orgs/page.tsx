import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, PageHeader, EmptyState } from "@/components/ui";
import { Button } from "@/components/ui";
import { Building2, Plus } from "lucide-react";
import { AddOrgDialog } from "./add-org-dialog";

export const metadata: Metadata = {
  title: "Organizações",
  description: "Gerenciar organizações",
};

export default async function AdminOrgsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/learn");
  }

  // Get all organizations with stats
  const { data: organizations } = await supabase
    .from("organizations")
    .select(`
      *,
      profiles (id),
      courses (id)
    `)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Organizações"
          description={`${organizations?.length || 0} organização(ões) cadastrada(s)`}
        />
        <AddOrgDialog />
      </div>

      {!organizations?.length ? (
        <EmptyState
          icon={Building2}
          title="Nenhuma organização cadastrada"
          description="Crie sua primeira organização para começar a gerenciar cursos e alunos. Use o botão acima."
        />
      ) : (
        <div className="grid gap-4">
          {organizations.map((org) => (
            <Card key={org.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center dark:bg-blue-900/50">
                      <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-slate-100">
                        {org.name}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {org.domain || org.slug}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-slate-500">
                    <div className="text-center">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {org.profiles?.length || 0}
                      </p>
                      <p>usuarios</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {org.courses?.length || 0}
                      </p>
                      <p>cursos</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
