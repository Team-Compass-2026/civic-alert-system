import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/design-system/design-idea-5cd787/lib/utils";

/**
 * @usage A user's identity — reporter avatar, operator badge, agency logo
 *   fallback. Falls back to initials on a tinted background.
 * @example <Avatar name="Aung Min" src="/u.jpg" />
 * @antipattern Don't use Avatar as a button — wrap an IconButton if it should
 *   act (e.g. open a profile menu).
 */
export const avatarVariants = cva(
  "inline-flex items-center justify-center overflow-hidden rounded-pill bg-slate-200 font-medium text-foreground select-none [&>img]:size-full [&>img]:object-cover",
  {
    variants: {
      size: {
        sm: "size-8 text-xs",
        md: "size-10 text-sm",
        lg: "size-12 text-base",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof avatarVariants> {
  name?: string;
  src?: string;
}

export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ className, size, name, src, ...props }, ref) => {
    const initials = React.useMemo(() => {
      if (!name) return "?";
      const parts = name.trim().split(/\s+/);
      return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
    }, [name]);
    return (
      <span
        ref={ref}
        className={cn(avatarVariants({ size }), className)}
        {...props}
      >
        {src ? (
          <img src={src} alt={name ?? "avatar"} />
        ) : (
          <span className="text-slate-600">{initials.toUpperCase()}</span>
        )}
      </span>
    );
  },
);
Avatar.displayName = "Avatar";
