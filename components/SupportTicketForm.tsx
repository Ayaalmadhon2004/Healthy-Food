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
    <form action={action} className="space-y-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
      <label className="block text-sm font-bold text-gray-700">
        {labels.subject}
        <input name="subject" required minLength={3} maxLength={120} className="mt-1 w-full rounded-xl border border-gray-200 p-3 font-normal" />
      </label>
      <label className="block text-sm font-bold text-gray-700">
        {labels.message}
        <textarea name="message" required minLength={10} maxLength={2000} rows={5} className="mt-1 w-full rounded-xl border border-gray-200 p-3 font-normal" />
      </label>
      {state?.ok === false && (
        <p className="text-sm text-red-600" role="alert">{labels.errors[state.error ?? "failed"] ?? labels.errors.failed}</p>
      )}
      {state?.ok && <p className="text-sm text-emerald-600" role="status">{labels.sent}</p>}
      <button type="submit" disabled={pending} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-60">
        {pending ? labels.submitting : labels.submit}
      </button>
    </form>
  );
}
