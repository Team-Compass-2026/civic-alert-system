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

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          <Link
            to="/home"
            className="relative rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground after:absolute after:inset-x-3 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-brand-600 after:transition-transform after:duration-200 hover:after:scale-x-100"
            activeProps={{ className: "relative rounded-md px-3 py-2 text-sm font-medium text-foreground after:absolute after:inset-x-3 after:bottom-1 after:h-px after:bg-brand-600" }}
          >
            Your Area
          </Link>
          <Link
            to="/map"
            className="relative rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground after:absolute after:inset-x-3 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-brand-600 after:transition-transform after:duration-200 hover:after:scale-x-100"
            activeProps={{ className: "relative rounded-md px-3 py-2 text-sm font-medium text-foreground after:absolute after:inset-x-3 after:bottom-1 after:h-px after:bg-brand-600" }}
          >
            Map
          </Link>
          <Link
            to="/alerts"
            className="relative rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground after:absolute after:inset-x-3 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-brand-600 after:transition-transform after:duration-200 hover:after:scale-x-100"
            activeProps={{ className: "relative rounded-md px-3 py-2 text-sm font-medium text-foreground after:absolute after:inset-x-3 after:bottom-1 after:h-px after:bg-brand-600" }}
          >
            Alerts
          </Link>
          <Link
            to="/faq"
            className="relative rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground after:absolute after:inset-x-3 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-brand-600 after:transition-transform after:duration-200 hover:after:scale-x-100"
            activeProps={{ className: "relative rounded-md px-3 py-2 text-sm font-medium text-foreground after:absolute after:inset-x-3 after:bottom-1 after:h-px after:bg-brand-600" }}
          >
            FAQ
          </Link>
          <Link
            to="/dashboard"
            className="relative rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground after:absolute after:inset-x-3 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-brand-600 after:transition-transform after:duration-200 hover:after:scale-x-100"
            activeProps={{ className: "relative rounded-md px-3 py-2 text-sm font-medium text-foreground after:absolute after:inset-x-3 after:bottom-1 after:h-px after:bg-brand-600" }}
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
              to="/sign-in"
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

