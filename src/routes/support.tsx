import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardBody,
  Input,
  Label,
  Spinner,
  Textarea,
} from "@/design-system/design-idea-5cd787";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const TITLE = "Contact & Support — WaterWatch";
const DESC =
  "Get help with WaterWatch, report a bug, or send us feedback about the platform.";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
    ],
  }),

  component: SupportPage,
});

function SupportPage() {
  const auth = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("support_messages").insert({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        user_id: auth.user?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setDone(true);
      setName("");
      setEmail("");
      setMessage("");
    },
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-2xl font-bold text-foreground">
              Contact & Support
            </h1>
            <p className="text-sm text-muted-foreground">
              Need help, found a bug, or want to share feedback? Send us a
              message and we will get back to you.
            </p>
          </div>

          {done ? (
            <Alert variant="success" title="Message sent!">
              <p className="text-muted-foreground">
                Thank you for reaching out. We will respond as soon as possible.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDone(false)}
                className="mt-2"
              >
                Send another message
              </Button>
            </Alert>
          ) : (
            <Card>
              <CardBody className="flex flex-col gap-4 p-5">
                {auth.loading ? (
                  <div className="flex items-center justify-center gap-2 py-4">
                    <Spinner />
                    <span className="text-sm text-muted-foreground">Loading…</span>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="support-name">Name</Label>
                      <Input
                        id="support-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="support-email">Email</Label>
                      <Input
                        id="support-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={auth.user?.email ?? "you@example.com"}
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="support-message">Message</Label>
                      <Textarea
                        id="support-message"
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="How can we help?"
                        required
                      />
                    </div>

                    {mutation.isError ? (
                      <Alert variant="danger" title="Could not send">
                        {(mutation.error as Error).message}
                      </Alert>
                    ) : null}

                    <Button
                      size="md"
                      disabled={!name.trim() || !email.trim() || !message.trim() || mutation.isPending}
                      onClick={() => mutation.mutate()}
                    >
                      {mutation.isPending ? "Sending…" : "Send Message"}
                    </Button>
                  </>
                )}
              </CardBody>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
