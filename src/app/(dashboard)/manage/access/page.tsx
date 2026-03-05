import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createAuthClient, createDataClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { BookOpen, CheckCircle, Users, Activity } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Acesso dos Alunos",
  description: "Ver se os alunos estão acessando os conteúdos",
};

export default async function ManageAccessPage() {
  const authClient = await createAuthClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  const dataClient = await createDataClient();
  if (!dataClient) redirect("/learn");

  const { data: profile } = await dataClient
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  if (!profile || (profile.role !== "tenant" && profile.role !== "admin")) {
    redirect("/learn");
  }

  const orgId = profile.org_id!;

  const { data: courses } = await dataClient
    .from("courses")
    .select("id, title")
    .eq("org_id", orgId)
    .order("title");

  if (!courses?.length) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Acesso dos Alunos
          </h1>
          <p className="text-slate-500">
            Veja quem acessou os conteúdos e quantas aulas foram concluídas.
          </p>
        </div>
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            Nenhum conteúdo cadastrado. Crie conteúdos e matricule alunos para ver o acesso.
          </CardContent>
        </Card>
      </div>
    );
  }

  const courseIds = courses.map((c) => c.id);

  const { data: modules } = await dataClient
    .from("modules")
    .select("id, course_id")
    .in("course_id", courseIds);

  const moduleIds = (modules || []).map((m: { id: string }) => m.id);
  const moduleToCourse = Object.fromEntries(
    (modules || []).map((m: { id: string; course_id: string }) => [m.id, m.course_id])
  );

  const { data: lessons } =
    moduleIds.length > 0
      ? await dataClient
          .from("lessons")
          .select("id, module_id")
          .in("module_id", moduleIds)
      : { data: [] };

  const lessonIds = (lessons || []).map((l: { id: string; module_id: string }) => ({
    lessonId: l.id,
    courseId: moduleToCourse[l.module_id],
  }));
  const lessonIdList = lessonIds.map((x) => x.lessonId);
  const lessonToCourse = Object.fromEntries(lessonIds.map((x) => [x.lessonId, x.courseId]));

  const { data: progressRows } =
    lessonIdList.length > 0
      ? await dataClient
          .from("lesson_progress")
          .select("user_id, lesson_id, completed, updated_at")
          .in("lesson_id", lessonIdList)
      : { data: [] };

  const { data: enrollments } = await dataClient
    .from("enrollments")
    .select("user_id, course_id")
    .in("course_id", courseIds)
    .eq("status", "active");

  const uniqueUserIds = [...new Set((enrollments || []).map((e: { user_id: string }) => e.user_id))];
  const { data: profiles } =
    uniqueUserIds.length > 0
      ? await dataClient
          .from("profiles")
          .select("id, full_name, email")
          .in("id", uniqueUserIds)
      : { data: [] };

  const profileMap = Object.fromEntries((profiles || []).map((p: { id: string; full_name: string | null; email: string }) => [p.id, p]));

  const byUser: Record<
    string,
    { lastActivity: string | null; completedCount: number; courseIds: Set<string> }
  > = {};
  for (const r of progressRows || []) {
    const row = r as { user_id: string; lesson_id: string; completed: boolean; updated_at: string };
    if (!byUser[row.user_id]) {
      byUser[row.user_id] = { lastActivity: null, completedCount: 0, courseIds: new Set() };
    }
    const cur = byUser[row.user_id];
    if (row.updated_at && (!cur.lastActivity || row.updated_at > cur.lastActivity)) {
      cur.lastActivity = row.updated_at;
    }
    if (row.completed) cur.completedCount++;
    const cid = lessonToCourse[row.lesson_id];
    if (cid) cur.courseIds.add(cid);
  }

  const byCourse: Record<
    string,
    { enrolled: number; accessed: number; completed: number }
  > = {};
  for (const c of courses) {
    byCourse[c.id] = { enrolled: 0, accessed: 0, completed: 0 };
  }
  for (const e of enrollments || []) {
    const row = e as { user_id: string; course_id: string };
    byCourse[row.course_id].enrolled++;
  }
  for (const r of progressRows || []) {
    const row = r as { lesson_id: string; completed: boolean };
    const cid = lessonToCourse[row.lesson_id];
    if (cid && row.completed) byCourse[cid].completed++;
  }
  for (const cid of Object.keys(byCourse)) {
    const userIdsWithAccess = new Set(
      (progressRows || [])
        .filter((r: { lesson_id: string }) => lessonToCourse[(r as { lesson_id: string }).lesson_id] === cid)
        .map((r: { user_id: string }) => (r as { user_id: string }).user_id)
    );
    byCourse[cid].accessed = userIdsWithAccess.size;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Acesso dos Alunos
        </h1>
        <p className="text-slate-500">
          Veja quem acessou os conteúdos e quantas aulas foram concluídas.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Por conteúdo
          </CardTitle>
          <p className="text-sm text-slate-500">
            Matriculados, quantos acessaram ao menos uma aula e total de aulas concluídas.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {courses.map((course) => {
              const stats = byCourse[course.id];
              return (
                <div
                  key={course.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4 dark:border-slate-700"
                >
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {course.title}
                  </span>
                  <div className="flex gap-6 text-sm">
                    <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                      <Users className="h-4 w-4" />
                      {stats?.enrolled ?? 0} matriculados
                    </span>
                    <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                      <Activity className="h-4 w-4" />
                      {stats?.accessed ?? 0} acessaram
                    </span>
                    <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                      <CheckCircle className="h-4 w-4" />
                      {stats?.completed ?? 0} aulas concluídas
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Por aluno
          </CardTitle>
          <p className="text-sm text-slate-500">
            Última atividade e total de aulas concluídas por aluno.
          </p>
        </CardHeader>
        <CardContent>
          {uniqueUserIds.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum aluno matriculado.</p>
          ) : (
            <div className="space-y-3">
              {uniqueUserIds.map((uid) => {
                const p = profileMap[uid];
                const stats = byUser[uid];
                return (
                  <div
                    key={uid}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-3 dark:border-slate-700"
                  >
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {p?.full_name || "Sem nome"}
                      </p>
                      <p className="text-sm text-slate-500">{p?.email}</p>
                    </div>
                    <div className="flex gap-6 text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        Último acesso:{" "}
                        {stats?.lastActivity
                          ? new Date(stats.lastActivity).toLocaleString("pt-BR")
                          : "—"}
                      </span>
                      <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                        <CheckCircle className="h-4 w-4" />
                        {stats?.completedCount ?? 0} aulas concluídas
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-sm text-slate-500">
        <Link href="/manage" className="underline hover:no-underline">
          Voltar ao painel de gestão
        </Link>
      </p>
    </div>
  );
}
