"use client";

import { useActionState } from "react";
import { createTicketAction, type SupportActionState } from "@/app/actions/supportActions";

interface Labels {
  subject: string;
  message: string;
  submit: string;
  submitting: string;
  sent: string;
  errors: Record<string, string>;
}

export default function SupportTicketForm({ labels }: { labels: Labels }) {
  const [state, action, pending] = useActionState<SupportActionState, FormData>(createTicketAction, null);

  return (
    <form action={action} className="surface p-5 md:p-6 space-y-5">
      <div>
        <label htmlFor="ticket-subject" className="label">{labels.subject}</label>
        <input id="ticket-subject" name="subject" required minLength={3} maxLength={120} className="field" />
      </div>
      <div>
        <label htmlFor="ticket-message" className="label">{labels.message}</label>
        <textarea id="ticket-message" name="message" required minLength={10} maxLength={2000} rows={5} className="field" />
      </div>
      {state?.ok === false && (
        <p className="text-sm text-brick-700" role="alert">{labels.errors[state.error ?? "failed"] ?? labels.errors.failed}</p>
      )}
      {state?.ok && <p className="text-sm text-olive-800" role="status">{labels.sent}</p>}
      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending ? labels.submitting : labels.submit}
      </button>
    </form>
  );
}
