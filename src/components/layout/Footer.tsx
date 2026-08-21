import { Link } from "@tanstack/react-router";
import { DISCLAIMER } from "@/lib/waterwatch";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-5 py-10 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <span className="font-display text-lg font-bold text-foreground">
            WaterWatch
          </span>
          <span className="text-sm text-muted-foreground">
            See the risk. Share the signal. Protect the community.
          </span>
          <span className="text-xs text-muted-foreground">
            Turning community observations into early warnings for
            waterborne-disease risk
          </span>
          <span className="text-xs text-muted-foreground">Team Compass</span>
        </div>
        <nav
          aria-label="Footer"
          className="flex flex-wrap items-start gap-6 text-sm text-muted-foreground md:justify-end"
        >
          <Link to="/home" className="transition-colors duration-200 hover:text-foreground">
            Your Area
          </Link>
          <Link to="/map" className="transition-colors duration-200 hover:text-foreground">
            Map
          </Link>
          <Link to="/report" className="transition-colors duration-200 hover:text-foreground">
            Report
          </Link>
          <Link to="/alerts" className="transition-colors duration-200 hover:text-foreground">
            Alerts
          </Link>
          <Link to="/faq" className="transition-colors duration-200 hover:text-foreground">
            FAQ
          </Link>
          <Link to="/support" className="transition-colors duration-200 hover:text-foreground">
            Support
          </Link>
          <Link to="/dashboard" className="transition-colors duration-200 hover:text-foreground">
            For Organizations
          </Link>
        </nav>
        <p className="text-xs text-muted-foreground md:col-span-2">
          {DISCLAIMER}
        </p>
      </div>
    </footer>
  );
}
