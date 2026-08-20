import { Link } from "@tanstack/react-router";
import { buttonVariants } from "@/design-system/design-idea-5cd787";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span aria-hidden="true" className="text-xl">
            💧
          </span>
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
            to="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground"
            activeProps={{ className: "text-sm font-medium text-foreground" }}
          >
            For Organizations
          </Link>
        </nav>

        <Link to="/report" className={buttonVariants({ size: "sm" })}>
          Report a Problem
        </Link>
      </div>
    </header>
  );
}
