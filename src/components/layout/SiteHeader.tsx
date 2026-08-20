import { Link } from "@tanstack/react-router";
import { Button } from "@/design-system/design-idea-5cd787";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
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
          >
            How It Works
          </Link>
          <Link
            to="/map"
            className="text-sm text-muted-foreground hover:text-foreground"
            activeProps={{ className: "text-sm text-foreground font-medium" }}
          >
            Map
          </Link>
          <Link
            to="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground"
            activeProps={{ className: "text-sm text-foreground font-medium" }}
          >
            For Organizations
          </Link>
        </nav>

        <Button asChild={false} className="rounded-pill" size="sm" onClick={undefined}>
          <Link to="/report" className="text-white">
            Report a Problem
          </Link>
        </Button>
      </div>
    </header>
  );
}
