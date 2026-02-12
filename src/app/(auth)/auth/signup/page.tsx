import { Metadata } from "next";
import { Suspense } from "react";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Criar conta",
  description: "Crie sua conta para acessar os conteúdos",
};

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupFormSkeleton />}>
      <SignupForm />
    </Suspense>
  );
}

function SignupFormSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white dark:bg-slate-900 shadow p-6 space-y-4 animate-pulse">
      <div className="h-8 bg-slate-200 rounded w-3/4 mx-auto dark:bg-slate-700" />
      <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto dark:bg-slate-700" />
      <div className="h-10 bg-slate-200 rounded dark:bg-slate-700" />
      <div className="h-10 bg-slate-200 rounded dark:bg-slate-700" />
      <div className="h-10 bg-slate-200 rounded dark:bg-slate-700" />
    </div>
  );
}
