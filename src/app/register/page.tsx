"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = React.useState({
    name: "",
    brand: "",
    email: "",
    password: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/dashboard");
  }

  return (
    <AuthShell>
      <div className="space-y-1.5">
        <h1 className="display text-2xl tracking-tight">Create your studio</h1>
        <p className="text-sm text-ink-soft">
          Set up a workspace for your brand in under a minute.
        </p>
      </div>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="name">Your name</Label>
            <Input id="name" value={form.name} onChange={set("name")} placeholder="Sasha Okafor" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="brand">Brand name</Label>
            <Input id="brand" value={form.brand} onChange={set("brand")} placeholder="Olivine" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <Input id="email" type="email" value={form.email} onChange={set("email")} placeholder="you@brand.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={form.password} onChange={set("password")} placeholder="At least 8 characters" />
        </div>
        <Button type="submit" className="w-full" size="lg">
          Create workspace <ArrowRight className="size-4" />
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-ink-faint">or</span>
        <Separator className="flex-1" />
      </div>

      <Button variant="secondary" className="w-full" size="lg">
        Sign up with Google
      </Button>

      <p className="mt-8 text-center text-sm text-ink-soft">
        Already have an account?{" "}
        <Link href="/login" className="text-accent-ink hover:underline">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
