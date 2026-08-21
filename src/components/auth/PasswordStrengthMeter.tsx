import { assessPassword } from "@/lib/passwordStrength";

const TONE_BAR = {
  low: "bg-risk-low",
  moderate: "bg-risk-moderate",
  high: "bg-risk-high",
} as const;

const TONE_TEXT = {
  low: "text-risk-low",
  moderate: "text-risk-moderate",
  high: "text-risk-high",
} as const;

/**
 * Advisory strength meter + rule checklist for the sign-up password.
 *
 * Colour is never the only signal: the label ("Weak" / "Strong") and the tick
 * list carry the same information for colourblind and screen-reader users.
 */
export function PasswordStrengthMeter({ password, id }: { password: string; id?: string }) {
  const strength = assessPassword(password);
  const segments = [1, 2, 3, 4];

  return (
    <div id={id} className="flex flex-col gap-2">
      <div className="flex items-center gap-2" aria-hidden="true">
        {segments.map((segment) => (
          <span
            key={segment}
            className={`h-1.5 flex-1 rounded-pill ${
              password.length > 0 && segment <= strength.score
                ? TONE_BAR[strength.tone]
                : "bg-muted"
            }`}
          />
        ))}
      </div>

      <p className="text-xs text-muted-foreground" aria-live="polite">
        Password strength:{" "}
        <span className={`font-mono font-semibold ${password.length > 0 ? TONE_TEXT[strength.tone] : ""}`}>
          {password.length === 0 ? "—" : strength.label}
        </span>
      </p>

      <ul className="flex flex-col gap-1">
        {strength.rules.map((rule) => (
          <li
            key={rule.id}
            className={`flex items-center gap-2 text-xs ${
              rule.met ? "text-risk-low" : "text-muted-foreground"
            }`}
          >
            <span aria-hidden="true" className="font-mono">
              {rule.met ? "✓" : "•"}
            </span>
            <span>{rule.label}</span>
            <span className="sr-only">{rule.met ? " — met" : " — not met yet"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
