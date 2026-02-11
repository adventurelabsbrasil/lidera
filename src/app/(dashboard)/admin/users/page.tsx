import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui";
import { Shield, User, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Usuarios",
  description: "Gerenciar usuarios",
};

export default async function AdminUsersPage() {
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

  // Get all users with their organizations
  const { data: users } = await supabase
    .from("profiles")
    .select(`
      *,
      organizations (name)
    `)
    .order("created_at", { ascending: false });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4 text-red-500" />;
      case "tenant":
        return <Users className="h-4 w-4 text-blue-500" />;
      default:
        return <User className="h-4 w-4 text-slate-400" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400";
      case "tenant":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Usuarios
        </h1>
        <p className="text-slate-500">
          {users?.length || 0} usuario(s) no sistema
        </p>
      </div>

      {!users?.length ? (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
              Nenhum usuario encontrado
            </h3>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {users.map((userProfile) => (
            <Card key={userProfile.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center dark:bg-slate-800">
                      {getRoleIcon(userProfile.role)}
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-slate-100">
                        {userProfile.full_name || "Sem nome"}
                      </h3>
                      <p className="text-sm text-slate-500">{userProfile.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {userProfile.organizations && (
                      <span className="text-sm text-slate-500">
                        {(userProfile.organizations as { name: string }).name}
                      </span>
                    )}
                    <span
                      className={`px-2 py-1 text-xs rounded-full capitalize ${getRoleBadge(
                        userProfile.role
                      )}`}
                    >
                      {userProfile.role}
                    </span>
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
