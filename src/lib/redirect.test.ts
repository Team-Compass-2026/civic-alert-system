import { beforeEach, describe, expect, it } from "vitest";
import {
  consumeRedirect,
  rememberRedirect,
  resolveRedirect,
  safeRedirectPath,
} from "./redirect";

/**
 * The redirect helpers are the only thing standing between "send me back where
 * I was" and an open redirect, so they get exhaustive coverage.
 */

const HOSTILE = [
  "https://evil.example/steal",
  "http://evil.example",
  "//evil.example/steal",
  "/\\evil.example/steal",
  "javascript:alert(1)",
  "data:text/html,<script>alert(1)</script>",
  "mailto:someone@example.com",
  "profile",
  "../profile",
  "",
  " /profile",
  null,
  undefined,
  42,
  {},
  ["/profile"],
];

describe("safeRedirectPath", () => {
  it("accepts same-origin paths with query and hash", () => {
    expect(safeRedirectPath("/profile")).toBe("/profile");
    expect(safeRedirectPath("/dashboard/hlaing?tab=reports")).toBe(
      "/dashboard/hlaing?tab=reports",
    );
    expect(safeRedirectPath("/alerts#latest")).toBe("/alerts#latest");
  });

  it("rejects anything that is not a same-origin path", () => {
    for (const value of HOSTILE) {
      expect(safeRedirectPath(value)).toBeNull();
    }
  });

  it("rejects auth routes that would bounce the user in a loop", () => {
    expect(safeRedirectPath("/auth")).toBeNull();
    expect(safeRedirectPath("/sign-in")).toBeNull();
    expect(safeRedirectPath("/sign-in?redirect=/profile")).toBeNull();
    expect(safeRedirectPath("/sign-up")).toBeNull();
    expect(safeRedirectPath("/reset-password")).toBeNull();
    expect(safeRedirectPath("/reset-password/sent")).toBeNull();
  });

  it("does not treat lookalike routes as auth routes", () => {
    expect(safeRedirectPath("/authorities")).toBe("/authorities");
  });

  it("rejects absurdly long values", () => {
    expect(safeRedirectPath(`/${"a".repeat(600)}`)).toBeNull();
  });
});

describe("remember / consume", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("round-trips a safe target once", () => {
    rememberRedirect("/dashboard");
    expect(consumeRedirect()).toBe("/dashboard");
    expect(consumeRedirect()).toBeNull();
  });

  it("never stores a hostile target", () => {
    rememberRedirect("/profile");
    rememberRedirect("https://evil.example");
    expect(consumeRedirect()).toBeNull();
  });
});

describe("resolveRedirect", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("prefers an explicit safe search param", () => {
    rememberRedirect("/alerts");
    expect(resolveRedirect("/dashboard")).toBe("/dashboard");
  });

  it("falls back to the remembered target when the param is hostile", () => {
    rememberRedirect("/alerts");
    expect(resolveRedirect("https://evil.example")).toBe("/alerts");
  });

  it("falls back to the default destination", () => {
    expect(resolveRedirect(undefined)).toBe("/profile");
    expect(resolveRedirect(undefined, "/home")).toBe("/home");
  });

  it("never returns an off-origin destination", () => {
    for (const value of HOSTILE) {
      const result = resolveRedirect(value);
      expect(result.startsWith("/")).toBe(true);
      expect(result.startsWith("//")).toBe(false);
    }
  });
});
