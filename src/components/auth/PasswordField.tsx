import { useId, useState } from "react";
import { IconButton, Input, Label } from "@/design-system/design-idea-5cd787";

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" focusable="false">
      <path
        d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" focusable="false">
      <path d="M3 3l18 18" strokeLinecap="round" />
      <path
        d="M10.6 6.1A9.6 9.6 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-3.3 3.9M6.4 8.2A17 17 0 0 0 2.5 12S6 18 12 18a9.8 9.8 0 0 0 3.6-.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password";
  placeholder?: string;
  minLength?: number;
  required?: boolean;
  /** Extra content rendered under the field (hints, strength meter). */
  children?: React.ReactNode;
  /** ID(s) of descriptive content, appended to aria-describedby. */
  describedBy?: string;
  /** Optional trailing control rendered next to the label (e.g. "Forgot?"). */
  labelAction?: React.ReactNode;
};

/**
 * Password input with an in-field show/hide eye toggle.
 *
 * The toggle is a real `<button>` (so Tab/Enter/Space work natively), keeps an
 * accessible name that reflects the *action*, exposes `aria-pressed` for its
 * on/off state, points at the field it controls with `aria-controls`, and
 * announces the resulting state through a polite live region.
 */
export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  placeholder,
  minLength,
  required,
  children,
  describedBy,
  labelAction,
}: Props) {
  const [visible, setVisible] = useState(false);
  const statusId = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id}>{label}</Label>
        {labelAction}
      </div>

      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-describedby={[describedBy, statusId].filter(Boolean).join(" ")}
          className="pr-11"
        />
        <IconButton
          type="button"
          size="sm"
          variant="ghost"
          label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          aria-controls={id}
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-1 my-auto"
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </IconButton>
      </div>

      <p id={statusId} className="sr-only" aria-live="polite">
        {visible ? "Password is visible" : "Password is hidden"}
      </p>

      {children}
    </div>
  );
}
