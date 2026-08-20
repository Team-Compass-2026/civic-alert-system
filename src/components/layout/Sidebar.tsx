import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/design-system/design-idea-5cd787/lib/utils";

const NAV = [
  { to: "/home", label: "Home", icon: "🏠" },
  { to: "/map", label: "Map", icon: "🗺️" },
  { to: "/report", label: "Report", icon: "➕" },
  { to: "/alerts", label: "Alerts", icon: "🔔" },
  { to: "/profile", label: "Profile", icon: "👤" },
] as const;

/**
 * Mobile-only navigation drawer. Desktop navigation lives in SiteHeader,
 * so nothing from this component renders at `md` and up.
 */
export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  return (
    <div className="md:hidden">
      {/* Hamburger toggle */}
      <button
        type="button"
        onClick={() => setMobileOpen((v) => !v)}
        aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={mobileOpen}
        aria-controls="ww-sidebar"
        className="focus-ring fixed left-4 top-20 z-40 flex size-10 items-center justify-center rounded-md border border-border bg-card text-foreground shadow-sm"
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
            d={mobileOpen ? "M6 6l12 12M18 6L6 18" : "M4 6h16M4 12h16M4 18h16"}
          />
        </svg>
      </button>

      {/* Backdrop */}
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-30 bg-black/40"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      {/* Drawer */}
      <aside
        id="ww-sidebar"
        aria-hidden={!mobileOpen}
        className={cn(
          "fixed bottom-0 left-0 top-16 z-30 w-60 transform border-r border-border bg-card transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <nav aria-label="WaterWatch sections" className="flex h-full flex-col">
          <ul className="flex flex-col gap-1 p-4 pt-14">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  tabIndex={mobileOpen ? 0 : -1}
                  onClick={() => setMobileOpen(false)}
                  className="focus-ring flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                  activeProps={{
                    className:
                      "focus-ring flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium bg-muted text-foreground",
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
    </div>
  );
}
