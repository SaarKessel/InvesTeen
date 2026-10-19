import Link from "next/link";
import { ReactNode } from "react";
import { SessionUser } from "@/lib/auth";
import { ToastProvider } from "@/components/easyui/Toasts";
import { SidebarNav, BottomNav } from "@/components/NavSection";

export default function AppShell({ user, children }: { user: SessionUser; children: ReactNode }) {
  return (
    <ToastProvider>
      <div className="min-h-screen flex">
        <aside className="hidden md:flex w-56 flex-col border-l border-navy-800 bg-navy-900/60 p-4 gap-1 sticky top-0 h-screen">
          <Link href="/dashboard" className="text-lg font-extrabold mb-4 px-2">
            InvesTeen<span className="text-accent-500">.</span>
          </Link>
          <SidebarNav />
          <div className="mt-auto text-xs muted px-2">שלום, {user.username}</div>
        </aside>

        <main className="flex-1 pb-20 md:pb-8 px-4 md:px-8 py-5 max-w-5xl w-full mx-auto">{children}</main>

        <nav className="md:hidden fixed bottom-0 inset-x-0 bg-navy-900/95 border-t border-navy-700 backdrop-blur flex justify-around items-center py-1.5 z-40">
          <BottomNav />
        </nav>
      </div>
    </ToastProvider>
  );
}
