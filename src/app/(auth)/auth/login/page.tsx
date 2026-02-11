import { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Login",
  description: "Entre na sua conta",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginFormSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow p-6 space-y-4 animate-pulse dark:border-slate-800 dark:bg-slate-900">
      <div className="h-8 bg-slate-200 rounded w-3/4 mx-auto dark:bg-slate-700" />
      <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto dark:bg-slate-700" />
      <div className="h-10 bg-slate-200 rounded dark:bg-slate-700" />
      <div className="h-10 bg-slate-200 rounded dark:bg-slate-700" />
      <div className="h-10 bg-slate-200 rounded dark:bg-slate-700" />
    </div>
  );
}
