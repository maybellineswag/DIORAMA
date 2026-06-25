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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("herfreckleslooklikecandybars@gmail.com");
  const [password, setPassword] = React.useState("demo-password");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/dashboard");
  }

  return (
    <AuthShell>
      <div className="space-y-1.5">
        <h1 className="display text-2xl tracking-tight">Welcome back</h1>
        <p className="text-sm text-ink-soft">
          Log in to your Olivine workspace.
        </p>
      </div>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@brand.com"
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <button
              type="button"
              className="text-xs text-accent-ink hover:underline"
            >
              Forgot?
            </button>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>
        <Button type="submit" className="w-full" size="lg">
          Continue <ArrowRight className="size-4" />
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-ink-faint">or</span>
        <Separator className="flex-1" />
      </div>

      <Button variant="secondary" className="w-full" size="lg">
        Continue with Google
      </Button>

      <p className="mt-8 text-center text-sm text-ink-soft">
        New to Diorama?{" "}
        <Link href="/register" className="text-accent-ink hover:underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
