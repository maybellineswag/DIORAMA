import { Sidebar } from "@/components/app/sidebar";
import { Topbar } from "@/components/app/topbar";
import { CommandMenu } from "@/components/app/command-menu";
import { AiAssistant } from "@/components/app/ai-assistant";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh overflow-hidden bg-paper">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      <CommandMenu />
      <AiAssistant />
    </div>
  );
}
