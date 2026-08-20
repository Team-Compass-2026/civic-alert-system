/**
 * Civic Early-Warning Design System — public barrel.
 *
 * Consumers import components from here:
 *   import { Button, RiskBadge } from "@/design-system/design-idea-5cd787/design-system/civic-ew";
 *
 * To receive the theme tokens + Tailwind v4 utility mappings, import the
 * canonical stylesheet once in your app root:
 *   import "@/design-system/design-idea-5cd787/design-system/civic-ew/styles/tokens.css";
 *
 * Showcase-only helpers are NOT re-exported here (kept preview-only).
 */

// Utilities
export { cn } from "@/design-system/design-idea-5cd787/lib/utils";

// Generic primitives — Wave 1
export { Button, buttonVariants } from "@/design-system/design-idea-5cd787/components/ui/button";
export type { ButtonProps } from "@/design-system/design-idea-5cd787/components/ui/button";
export { IconButton } from "@/design-system/design-idea-5cd787/components/ui/icon-button";
export type { IconButtonProps } from "@/design-system/design-idea-5cd787/components/ui/icon-button";
export { Input } from "@/design-system/design-idea-5cd787/components/ui/input";
export type { InputProps } from "@/design-system/design-idea-5cd787/components/ui/input";
export { Label } from "@/design-system/design-idea-5cd787/components/ui/label";
export { Badge, badgeVariants } from "@/design-system/design-idea-5cd787/components/ui/badge";
export type { BadgeProps } from "@/design-system/design-idea-5cd787/components/ui/badge";
export { Card, CardHeader, CardBody, CardFooter } from "@/design-system/design-idea-5cd787/components/ui/card";
export type {
  CardProps,
  CardHeaderProps,
  CardBodyProps,
  CardFooterProps,
} from "@/design-system/design-idea-5cd787/components/ui/card";
export { Spinner, spinnerVariants } from "@/design-system/design-idea-5cd787/components/ui/spinner";
export type { SpinnerProps } from "@/design-system/design-idea-5cd787/components/ui/spinner";
export { Separator } from "@/design-system/design-idea-5cd787/components/ui/separator";
export type { SeparatorProps } from "@/design-system/design-idea-5cd787/components/ui/separator";

// Generic primitives — Wave 2 (forms & feedback)
export { Textarea } from "@/design-system/design-idea-5cd787/components/ui/textarea";
export type { TextareaProps } from "@/design-system/design-idea-5cd787/components/ui/textarea";
export { Select, selectVariants } from "@/design-system/design-idea-5cd787/components/ui/select";
export type { SelectProps } from "@/design-system/design-idea-5cd787/components/ui/select";
export { Checkbox, CheckIcon, checkboxVariants } from "@/design-system/design-idea-5cd787/components/ui/checkbox";
export type { CheckboxProps } from "@/design-system/design-idea-5cd787/components/ui/checkbox";
export { Switch } from "@/design-system/design-idea-5cd787/components/ui/switch";
export type { SwitchProps } from "@/design-system/design-idea-5cd787/components/ui/switch";
export { Avatar, avatarVariants } from "@/design-system/design-idea-5cd787/components/ui/avatar";
export type { AvatarProps } from "@/design-system/design-idea-5cd787/components/ui/avatar";
export { Alert, alertVariants } from "@/design-system/design-idea-5cd787/components/ui/alert";
export type { AlertProps } from "@/design-system/design-idea-5cd787/components/ui/alert";
export { Tooltip } from "@/design-system/design-idea-5cd787/components/ui/tooltip";
export type { TooltipProps } from "@/design-system/design-idea-5cd787/components/ui/tooltip";
