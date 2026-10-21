"use client";

import { useState, useTransition, type FormEvent } from "react";
import { linkDoctorAccountAction } from "@/app/actions/appointmentActions";

export default function LinkDoctorForm({
  doctorId,
  linkedEmail,
  labels,
}: {
  doctorId: number;
  linkedEmail: string | null;
  labels: { email: string; link: string; unlink: string; saved: string };
}) {
  const [email, setEmail] = useState(linkedEmail ?? "");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const save = (value: string) => {
    setMessage(null);
    startTransition(async () => {
      const result = await linkDoctorAccountAction(doctorId, value);
      if (result.success) {
        setEmail(value.trim());
        setMessage({ ok: true, text: labels.saved });
      } else {
        setMessage({ ok: false, text: result.error });
      }
    });
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    save(email);
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-start gap-2">
      <label className="sr-only" htmlFor={`doctor-email-${doctorId}`}>{labels.email}</label>
      <input
        id={`doctor-email-${doctorId}`}
        type="email"
        dir="ltr"
        className="field min-h-11 w-64"
        placeholder={labels.email}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit" className="btn min-h-11" disabled={pending || !email.trim()}>{labels.link}</button>
      {linkedEmail && (
        <button type="button" className="btn btn-quiet min-h-11" disabled={pending} onClick={() => save("")}>{labels.unlink}</button>
      )}
      {message && (
        <p role={message.ok ? "status" : "alert"} className={`basis-full text-sm ${message.ok ? "text-olive-800" : "text-clay-700"}`}>{message.text}</p>
      )}
    </form>
  );
}
