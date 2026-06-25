import { DioramaWordmark } from "@/components/logo";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r bg-surface-2 p-12 lg:flex">
        <div className="canvas-grid pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative">
          <DioramaWordmark className="h-7" />
        </div>
        <div className="relative max-w-md">
          <p className="display text-3xl leading-tight tracking-tight text-ink">
            The operating system for fashion brands.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            Plan collections, track every sample round, manage your
            manufacturers, and keep your whole creative pipeline in one calm,
            considered place.
          </p>
        </div>
        <div className="relative flex items-center gap-6 text-xs text-ink-faint">
          <span>Sample Tracker</span>
          <span className="size-1 rounded-full bg-ink-faint/50" />
          <span>Asset Library</span>
          <span className="size-1 rounded-full bg-ink-faint/50" />
          <span>Moodboard AI</span>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <DioramaWordmark className="h-6" />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
