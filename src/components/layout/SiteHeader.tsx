import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { buttonVariants, cn, IconButton, Separator } from "@/design-system/design-idea-5cd787";
import { useAuth } from "@/hooks/useAuth";

const NAV = [
  { to: "/home", label: "Your Area" },
  { to: "/map", label: "Map" },
  { to: "/alerts", label: "Alerts" },
  { to: "/report", label: "Report" },
  { to: "/faq", label: "FAQ" },
  { to: "/dashboard", label: "For Organizations" },
] as const;

const linkBase =
  "focus-visible:focus-ring px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground";
const linkActive =
  "focus-visible:focus-ring px-3 py-2 text-sm font-medium text-foreground";

const mobileLinkBase =
  "focus-visible:focus-ring block px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground";
const mobileLinkActive =
  "focus-visible:focus-ring block px-3 py-2.5 text-sm font-medium text-foreground";

function MobileNavLink({
  to,
  label,
  onNavigate,
  activeClassName,
}: {
  to: string;
  label: string;
  onNavigate: () => void;
  activeClassName?: string;
}) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className={mobileLinkBase}
      activeProps={{ className: activeClassName ?? mobileLinkActive }}
    >
      {label}
    </Link>
  );

}



export function SiteHeader() {
  const auth = useAuth();
  const isSignedIn = Boolean(auth.user);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 bg-card">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <img
            src="/logo-transparent.png"
            alt="WaterWatch"
            className="h-8 w-auto shrink-0"
            width={32}
            height={32}
          />
          <span className="truncate font-display text-lg font-bold text-foreground">
            WaterWatch
          </span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex" aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={linkBase}
              activeProps={{ className: linkActive }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-2">
          <div className="hidden items-center gap-2 md:flex">
            {isSignedIn ? (
              <Link
                to="/profile"
                className={buttonVariants({ size: "sm", variant: "outline" })}
              >
                Profile
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
              Report a Problem
            </Link>
          </div>

          <IconButton
            label={open ? "Close navigation" : "Open navigation"}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="ww-mobile-nav"
            className="shrink-0 md:hidden"
          >
            <svg
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={open ? "M6 6l12 12M18 6L6 18" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </IconButton>
        </div>
      </div>


      {/* Mobile menu */}
      <div
        id="ww-mobile-nav"
        hidden={!open}
        className={cn("bg-card md:hidden")}
      >
        <nav aria-label="Mobile" className="mx-auto w-full max-w-6xl px-5 py-3">
          <ul className="flex flex-col">
            {[
              ...NAV,
              {
                to: isSignedIn ? "/profile" : "/sign-in",
                label: isSignedIn ? "Profile" : "Sign in",
              },
            ].map((item, i, arr) => (
              <li key={item.to} className="flex flex-col">
                <MobileNavLink
                  to={item.to}
                  label={item.label}
                  onNavigate={() => setOpen(false)}
                />
                {i < arr.length - 1 && (
                  <Separator className="my-2" />
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

