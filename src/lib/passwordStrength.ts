/** Minimum password length accepted at sign-up. */
export const MIN_PASSWORD_LENGTH = 8;

export type PasswordRule = {
  id: string;
  label: string;
  met: boolean;
};

export type PasswordStrength = {
  /** 0-4; 0 = empty / very weak. */
  score: 0 | 1 | 2 | 3 | 4;
  label: "Too short" | "Weak" | "Fair" | "Good" | "Strong";
  /** Risk token name used for the meter and label colour. */
  tone: "low" | "moderate" | "high";
  rules: PasswordRule[];
  /** True when the password clears the minimum bar for account creation. */
  acceptable: boolean;
};

/**
 * Lightweight, dependency-free password assessment used by the sign-up form.
 * Purely advisory in the browser — Supabase still enforces its own policy.
 */
export function assessPassword(password: string): PasswordStrength {
  const rules: PasswordRule[] = [
    {
      id: "length",
      label: `At least ${MIN_PASSWORD_LENGTH} characters`,
      met: password.length >= MIN_PASSWORD_LENGTH,
    },
    { id: "case", label: "Upper and lower case letters", met: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { id: "number", label: "At least one number", met: /\d/.test(password) },
    { id: "symbol", label: "A symbol (! ? # …)", met: /[^A-Za-z0-9]/.test(password) },
  ];

  const met = rules.filter((r) => r.met).length;
  const lengthOk = rules[0]!.met;

  let score: PasswordStrength["score"] = 0;
  if (password.length > 0) {
    score = Math.max(1, Math.min(4, met + (password.length >= 12 ? 1 : 0))) as PasswordStrength["score"];
    if (!lengthOk) score = 1;
  }

  const label: PasswordStrength["label"] =
    password.length === 0 || !lengthOk
      ? "Too short"
      : score >= 4
        ? "Strong"
        : score === 3
          ? "Good"
          : score === 2
            ? "Fair"
            : "Weak";

  const tone: PasswordStrength["tone"] = score >= 4 ? "low" : score >= 3 ? "moderate" : "high";

  return { score, label, tone, rules, acceptable: lengthOk && met >= 2 };
}
