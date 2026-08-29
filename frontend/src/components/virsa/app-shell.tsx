import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutGrid,
  Network,
  BookOpen,
  Images,
  GitPullRequestArrow,
  Users,
  Settings,
  Menu,
  LogOut,
} from "lucide-react";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { PersonPortrait } from "./person-portrait";
import { RoleBadge } from "./badges";
import { cn } from "@/lib/utils";
import { getCurrentUser } from "@/services/authService";
import { getMyFamilies } from "@/services/familyService";

const NAV = [
  { to: "/app", label: "Family home", icon: LayoutGrid, exact: true },
  { to: "/app/tree", label: "Family tree", icon: Network },
  { to: "/app/memories", label: "Memories", icon: BookOpen },
  { to: "/app/photos", label: "Photographs", icon: Images },
  { to: "/app/changes", label: "Change requests", icon: GitPullRequestArrow },
  { to: "/app/members", label: "Members", icon: Users },
  { to: "/app/settings", label: "Settings", icon: Settings },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav aria-label="Archive sections" className="space-y-0.5">
      {NAV.map((item) => {
        const active = item.to === "/app" ? pathname === "/app" : pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "focus-ring flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
            )}
            aria-current={active ? "page" : undefined}
          >
            <item.icon className="size-4 shrink-0" aria-hidden />
            <span className="truncate">{item.label}</span>
            {active && <span aria-hidden className="ml-auto h-4 w-px bg-gold" />}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const currentUser = useQuery({ queryKey: ["currentUser"], queryFn: getCurrentUser });
  const families = useQuery({ queryKey: ["families"], queryFn: getMyFamilies });
  const userName =
    currentUser.data?.user?.full_name || currentUser.data?.user?.email || "Family member";
  const familyName = families.data?.[0]?.name || "Family archive";
  const userRole = families.data?.[0]?.myRole || "member";

  return (
    <div className="flex h-full flex-col gap-6 p-5">
      <Logo compact />
      <div className="rounded-lg border border-sidebar-border bg-card/70 p-4">
        <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Archive</p>
        <p className="mt-1.5 font-display text-lg leading-tight">{familyName}</p>
        <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-gold">Private</p>
      </div>
      <NavList onNavigate={onNavigate} />
      <div className="mt-auto space-y-3 border-t border-sidebar-border pt-4">
        <div className="flex items-center gap-3">
          <PersonPortrait name={userName} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm">{userName}</p>
            <RoleBadge role={userRole} className="mt-1" />
          </div>
        </div>
        <Link
          to="/"
          className="focus-ring flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <LogOut className="size-4" aria-hidden /> Sign out
        </Link>
      </div>
    </div>
  );
}

export function AppShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-dvh paper">
      <aside className="sticky top-0 hidden h-dvh w-72 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
        <SidebarBody />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur-md sm:px-8">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Open navigation"
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 border-sidebar-border bg-sidebar p-0">
              <SheetTitle className="sr-only">Archive navigation</SheetTitle>
              <SidebarBody onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-xl leading-tight sm:text-2xl">{title}</h1>
            {description && (
              <p className="mt-0.5 hidden truncate text-xs text-muted-foreground sm:block">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>

        <main className="flex-1 px-4 py-8 sm:px-8 sm:py-10">
          <div className="mx-auto w-full max-w-6xl fade-up">{children}</div>
        </main>
      </div>
    </div>
  );
}
