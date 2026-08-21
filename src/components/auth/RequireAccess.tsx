import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Spinner,
  buttonVariants,
} from "@/design-system/design-idea-5cd787";
import { useAuth } from "@/hooks/useAuth";
import { getMyAccess } from "@/lib/access.functions";
import { friendlyAuthError } from "@/lib/authErrors";
import type { MyAccess } from "@/lib/access.server";

type Props = {
  /** Only render children when the signed-in account holds one of these roles. */
  roles?: Array<"admin" | "org" | "citizen">;
  children: (access: MyAccess) => ReactNode;
};

function Gate({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <h2 className="font-display text-base font-semibold text-foreground">{title}</h2>
      </CardHeader>
      <CardBody className="flex flex-col gap-4 p-5">
        <p className="text-sm text-muted-foreground">{body}</p>
        {action}
      </CardBody>
    </Card>
  );
}

/**
 * Role- and area-aware gate. Shows a sign-in prompt when the session is gone or
 * expired, and an access notice when the account lacks the required role.
 */
export function RequireAccess({ roles, children }: Props) {
  const auth = useAuth();
  const getMyAccessFn = useServerFn(getMyAccess);

  const access = useQuery({
    queryKey: ["my-access", auth.user?.id ?? null],
    queryFn: () => getMyAccessFn(),
    enabled: Boolean(auth.user),
    retry: false,
  });

  if (auth.loading) {
    return (
      <Card>
        <CardBody className="flex items-center justify-center gap-2 p-5">
          <Spinner />
          <span className="text-sm text-muted-foreground">Checking your access…</span>
        </CardBody>
      </Card>
    );
  }

  if (!auth.user) {
    return (
      <Gate
        title={auth.expired ? "Your session expired" : "Sign in to continue"}
        body={
          auth.expired
            ? "For your security we signed you out after a period of inactivity. Sign in again to pick up where you left off."
            : "This page is only available to signed-in WaterWatch accounts."
        }
        action={
          <Link to="/auth" className={buttonVariants({ size: "sm" })}>
            Sign in
          </Link>
        }
      />
    );
  }

  if (access.isLoading) {
    return (
      <Card>
        <CardBody className="flex items-center justify-center gap-2 p-5">
          <Spinner />
          <span className="text-sm text-muted-foreground">Checking your access…</span>
        </CardBody>
      </Card>
    );
  }

  if (access.isError || !access.data) {
    return (
      <Alert variant="danger" title="We couldn't check your access">
        <div className="flex flex-col gap-3">
          <p className="text-sm">{friendlyAuthError(access.error)}</p>
          <Button size="sm" variant="outline" onClick={() => void access.refetch()}>
            Try again
          </Button>
        </div>
      </Alert>
    );
  }

  const held = access.data.roles;
  if (roles && !roles.some((r) => held.includes(r))) {
    return (
      <Gate
        title="You don't have access to this dashboard"
        body="Organization dashboards are limited to partner and administrator accounts. Your resident account still has full access to alerts, the map and reporting."
        action={
          <Link to="/home" className={buttonVariants({ size: "sm", variant: "secondary" })}>
            Go to your area
          </Link>
        }
      />
    );
  }

  return <>{children(access.data)}</>;
}
