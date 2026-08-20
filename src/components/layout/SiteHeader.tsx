import { Link } from "@tanstack/react-router";
import { buttonVariants } from "@/design-system/design-idea-5cd787";
import { useAuth } from "@/hooks/useAuth";

export function SiteHeader() {
  const auth = useAuth();
  const isSignedIn = Boolean(auth.user);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/logo-transparent.png"
            alt="WaterWatch"
            className="h-8 w-auto"
            width={32}
            height={32}
          />
          <span className="font-display text-lg font-bold text-foreground">
            WaterWatch
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
          <Link
            to="/home"
            className="text-sm text-muted-foreground hover:text-foreground"
            activeProps={{ className: "text-sm font-medium text-foreground" }}
          >
            Your Area
          </Link>
          <Link
            to="/map"
            className="text-sm text-muted-foreground hover:text-foreground"
            activeProps={{ className: "text-sm font-medium text-foreground" }}
          >
            Map
          </Link>
          <Link
            to="/alerts"
            className="text-sm text-muted-foreground hover:text-foreground"
            activeProps={{ className: "text-sm font-medium text-foreground" }}
          >
            Alerts
          </Link>
          <Link
            to="/faq"
            className="text-sm text-muted-foreground hover:text-foreground"
            activeProps={{ className: "text-sm font-medium text-foreground" }}
          >
            FAQ
          </Link>
          <Link
            to="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground"
            activeProps={{ className: "text-sm font-medium text-foreground" }}
          >
            For Organizations
          </Link>
        </nav>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {isSignedIn ? (
            <Link
              to="/profile"
              className={buttonVariants({ size: "sm", variant: "outline" })}
            >
              <span className="hidden sm:inline">Profile</span>
              <span className="sm:hidden" aria-label="Profile">
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </span>
            </Link>
          ) : (
            <Link
              to="/auth"
              className={buttonVariants({ size: "sm", variant: "outline" })}
            >
              Sign in
            </Link>
          )}
          <Link to="/report" className={buttonVariants({ size: "sm" })}>
            <span className="hidden sm:inline">Report a Problem</span>
            <span className="sm:hidden">Report</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

