import * as React from "react";
import { cn } from "@/design-system/design-idea-5cd787/lib/utils";

/**
 * @usage On/off toggle for a setting that takes effect immediately — dark mode,
 *   notification channel enable, live updates. Built on a checkbox + button role.
 * @example <Switch checked label="Live updates" />
 * @antipattern Don't use Switch for a form submit or a confirmable choice —
 *   use a Button or Checkbox. Switches act immediately, not on Save.
 */
export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  label?: React.ReactNode;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, id, checked, defaultChecked, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const isControlled = checked !== undefined;
    return (
      <label htmlFor={inputId} className="inline-flex items-center gap-2.5 cursor-pointer select-none">
        <span className="relative inline-flex">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            role="switch"
            className="peer sr-only"
            {...(isControlled ? { checked } : { defaultChecked })}
            {...props}
          />
          <span
            aria-hidden="true"
            className={cn(
              "h-6 w-10 rounded-pill bg-slate-200 transition-colors duration-150 peer-focus-visible:focus-ring peer-checked:bg-brand-600 peer-disabled:opacity-50",
              className,
            )}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-0.5 top-0.5 size-5 rounded-pill bg-white shadow-sm transition-transform duration-150 peer-checked:translate-x-4"
          />
        </span>
        {label ? (
          <span className="text-sm font-medium text-foreground">{label}</span>
        ) : null}
      </label>
    );
  },
);
Switch.displayName = "Switch";
