import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/design-system/design-idea-5cd787/lib/utils";

const NAV = [
  { to: "/home", label: "Home", icon: "🏠" },
  { to: "/map", label: "Map", icon: "🗺️" },
  { to: "/report", label: "Report", icon: "➕" },
  { to: "/alerts", label: "Alerts", icon: "🔔" },
  { to: "/profile", label: "Profile", icon: "👤" },
] as const;

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setMobileOpen((v) => !v)}
        aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={mobileOpen}
        aria-controls="ww-sidebar"
        className="fixed left-4 top-20 z-40 flex size-10 items-center justify-center rounded-md border border-border bg-card text-foreground shadow-sm md:hidden"
      >
        <span className="sr-only">Menu</span>
        <svg
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Backdrop */}
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      {/* Sidebar */}
      <aside
        id="ww-sidebar"
        className={cn(
          "fixed bottom-0 left-0 top-16 z-30 w-60 transform border-r border-border bg-card transition-transform duration-200 md:sticky md:top-16 md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <nav aria-label="WaterWatch sections" className="flex h-full flex-col">
          <ul className="flex flex-col gap-1 p-4">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                  activeProps={{
                    className:
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium bg-muted text-foreground",
                  }}
                >
                  <span aria-hidden="true">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}
