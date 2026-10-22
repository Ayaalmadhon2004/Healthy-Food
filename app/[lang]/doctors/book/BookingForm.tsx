"use client";

import Link from "@/components/LocaleLink";
import { useState, useTransition, type FormEvent } from "react";
import { requestAppointmentAction } from "@/app/actions/appointmentActions";

interface Labels {
  date: string;
  note: string;
  noteHint: string;
  submit: string;
  sending: string;
  sentTitle: string;
  sentBody: string;
  viewMine: string;
}

export default function BookingForm({
  doctorId,
  minDate,
  maxDate,
  maxNote,
  labels,
}: {
  doctorId: number;
  minDate: string;
  maxDate: string;
  maxNote: number;
  labels: Labels;
}) {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await requestAppointmentAction(doctorId, String(data.get("date") ?? ""), String(data.get("note") ?? ""));
      if (result.success) setSent(true);
      else setError(result.error);
    });
  };

  if (sent) {
    return (
      <div role="status" className="surface p-6">
        <h2 className="text-xl font-medium text-ink">{labels.sentTitle}</h2>
        <p className="mt-2 text-ink-soft">{labels.sentBody}</p>
        <Link href="/dashboard/appointments" className="text-link mt-4 inline-block">{labels.viewMine}</Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="surface p-6 space-y-5">
      <div>
        <label htmlFor="date" className="label">{labels.date}</label>
        <input id="date" name="date" type="date" required min={minDate} max={maxDate} className="field" />
      </div>
      <div>
        <label htmlFor="note" className="label">{labels.note}</label>
        <textarea id="note" name="note" rows={4} maxLength={maxNote} className="field" aria-describedby="note-hint" />
        <p id="note-hint" className="mt-1 text-sm text-ink-mute">{labels.noteHint}</p>
      </div>
      {error && <p role="alert" className="text-sm text-clay-700">{error}</p>}
      <button type="submit" className="btn" disabled={pending}>{pending ? labels.sending : labels.submit}</button>
    </form>
  );
}
