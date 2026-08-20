import { Link } from "@tanstack/react-router";

const TABS = [
  { to: "/home", label: "Home", icon: "🏠" },
  { to: "/map", label: "Map", icon: "🗺️" },
  { to: "/report", label: "Report", icon: "➕" },
  { to: "/alerts", label: "Alerts", icon: "🔔" },
  { to: "/profile", label: "Profile", icon: "👤" },
] as const;

export function TabBar() {
  return (
    <nav
      aria-label="WaterWatch sections"
      className="sticky bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur"
    >
      <ul className="mx-auto flex w-full max-w-6xl items-stretch">
        {TABS.map((tab) => (
          <li key={tab.to} className="flex-1">
            <Link
              to={tab.to}
              className="flex flex-col items-center gap-1 py-2 text-xs text-muted-foreground hover:text-foreground"
              activeProps={{
                className:
                  "flex flex-col items-center gap-1 py-2 text-xs font-medium text-brand-700",
              }}
            >
              <span aria-hidden="true" className="text-base">
                {tab.icon}
              </span>
              {tab.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
