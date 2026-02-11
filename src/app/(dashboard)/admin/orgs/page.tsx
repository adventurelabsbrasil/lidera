import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui";
import { Button } from "@/components/ui";
import { Building2, Plus } from "lucide-react";
import { AddOrgDialog } from "./add-org-dialog";

export const metadata: Metadata = {
  title: "Organizacoes",
  description: "Gerenciar organizacoes",
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
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Organizacoes
          </h1>
          <p className="text-slate-500">
            {organizations?.length || 0} organizacao(oes) cadastrada(s)
          </p>
        </div>
        <AddOrgDialog />
      </div>

      {!organizations?.length ? (
        <Card className="text-center py-12">
          <CardContent>
            <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
              Nenhuma organizacao cadastrada
            </h3>
            <p className="text-slate-500 mt-2">
              Crie sua primeira organizacao
            </p>
          </CardContent>
        </Card>
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
