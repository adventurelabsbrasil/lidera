"use client";

import { useState } from "react";
import { Card, CardContent, Label } from "@/components/ui";
import { CourseForm } from "./course-form";

interface Org {
  id: string;
  name: string;
  slug: string;
}

export function NewCourseClient({
  organizations,
  defaultOrgId,
}: {
  organizations: Org[];
  defaultOrgId: string | null;
}) {
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(defaultOrgId);

  if (defaultOrgId) {
    return (
      <CourseForm orgId={defaultOrgId} />
    );
  }

  if (!organizations?.length) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-slate-600 dark:text-slate-400">
            Nenhuma organização cadastrada. Como admin, crie primeiro uma organização em{" "}
            <a href="/admin/orgs" className="text-blue-600 underline">Admin → Organizações</a>.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <Label htmlFor="org" className="block mb-2">Organização do curso *</Label>
          <select
            id="org"
            value={selectedOrgId ?? ""}
            onChange={(e) => setSelectedOrgId(e.target.value || null)}
            className="w-full p-3 rounded-md border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="">Selecione...</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>
        </CardContent>
      </Card>
      {selectedOrgId && <CourseForm orgId={selectedOrgId} />}
    </div>
  );
}
