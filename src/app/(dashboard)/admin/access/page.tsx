import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createAuthClient, createDataClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Activity, Building2, CheckCircle, Users } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Acesso dos Alunos",
  description: "Visão geral de acesso e conclusão por organização",
};

export default async function AdminAccessPage() {
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

  if (!profile || profile.role !== "admin") {
    redirect("/learn");
  }

  const { data: orgs } = await dataClient
    .from("organizations")
    .select("id, name")
    .order("name");

  if (!orgs?.length) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Acesso dos Alunos
          </h1>
          <p className="text-slate-500">
            Visão por organização: quem acessou e quantas aulas foram concluídas.
          </p>
        </div>
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            Nenhuma organização cadastrada.
          </CardContent>
        </Card>
      </div>
    );
  }

  const results: {
    orgId: string;
    orgName: string;
    courses: { id: string; title: string; enrolled: number; accessed: number; completed: number }[];
    students: { id: string; full_name: string | null; email: string; lastActivity: string | null; completedCount: number }[];
  }[] = [];

  for (const org of orgs) {
    const { data: courses } = await dataClient
      .from("courses")
      .select("id, title")
      .eq("org_id", org.id)
      .order("title");

    if (!courses?.length) {
      results.push({ orgId: org.id, orgName: org.name, courses: [], students: [] });
      continue;
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

    const byCourse: Record<string, { enrolled: number; accessed: number; completed: number }> = {};
    for (const c of courses) {
      byCourse[c.id] = { enrolled: 0, accessed: 0, completed: 0 };
    }
    for (const e of enrollments || []) {
      const row = e as { course_id: string };
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

    results.push({
      orgId: org.id,
      orgName: org.name,
      courses: courses.map((c) => ({
        id: c.id,
        title: c.title,
        ...byCourse[c.id],
      })),
      students: uniqueUserIds.map((uid) => {
        const p = (profiles || []).find((x: { id: string }) => x.id === uid) as { full_name: string | null; email: string } | undefined;
        const stats = byUser[uid];
        return {
          id: uid,
          full_name: p?.full_name ?? null,
          email: p?.email ?? "",
          lastActivity: stats?.lastActivity ?? null,
          completedCount: stats?.completedCount ?? 0,
        };
      }),
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Acesso dos Alunos
        </h1>
        <p className="text-slate-500">
          Visão por organização: quem acessou os conteúdos e quantas aulas foram concluídas.
        </p>
      </div>

      {results.map(({ orgId, orgName, courses, students }) => (
        <Card key={orgId}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              {orgName}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {courses.length > 0 ? (
              <>
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                    Por conteúdo
                  </p>
                  <div className="space-y-2">
                    {courses.map((course) => (
                      <div
                        key={course.id}
                        className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-3 dark:border-slate-700"
                      >
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {course.title}
                        </span>
                        <div className="flex gap-6 text-sm text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {course.enrolled} matriculados
                          </span>
                          <span className="flex items-center gap-1">
                            <Activity className="h-4 w-4" />
                            {course.accessed} acessaram
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            {course.completed} aulas concluídas
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                    Por aluno
                  </p>
                  {students.length === 0 ? (
                    <p className="text-sm text-slate-500">Nenhum aluno matriculado.</p>
                  ) : (
                    <div className="space-y-2">
                      {students.map((s) => (
                        <div
                          key={s.id}
                          className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-3 dark:border-slate-700"
                        >
                          <div>
                            <p className="font-medium text-slate-900 dark:text-slate-100">
                              {s.full_name || "Sem nome"}
                            </p>
                            <p className="text-sm text-slate-500">{s.email}</p>
                          </div>
                          <div className="flex gap-6 text-sm text-slate-600 dark:text-slate-400">
                            <span>
                              Último acesso:{" "}
                              {s.lastActivity
                                ? new Date(s.lastActivity).toLocaleString("pt-BR")
                                : "—"}
                            </span>
                            <span className="flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" />
                              {s.completedCount} aulas concluídas
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">Nenhum conteúdo nesta organização.</p>
            )}
          </CardContent>
        </Card>
      ))}

      <p className="text-sm text-slate-500">
        <Link href="/admin" className="underline hover:no-underline">
          Voltar ao painel admin
        </Link>
      </p>
    </div>
  );
}
