"use client";

import { useState, useTransition } from "react";
import { updateAppointmentStatusAction } from "@/app/actions/appointmentActions";
import { nextStatuses, type AppointmentStatus } from "@/lib/appointments";

export default function AppointmentStatusSelect({
  appointmentId,
  status,
  options,
  labels,
  ariaLabel,
  errorText,
}: {
  appointmentId: number;
  status: AppointmentStatus;
  // Statuses the doctor may move to from the current one (the current one is always shown).
  options: AppointmentStatus[];
  labels: Record<AppointmentStatus, string>;
  ariaLabel: string;
  errorText: string;
}) {
  const [value, setValue] = useState<AppointmentStatus>(status);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();
  const [allowed, setAllowed] = useState<AppointmentStatus[]>(options);

  const change = (next: AppointmentStatus) => {
    const previous = value;
    const previousAllowed = allowed;
    setValue(next);
    setFailed(false);
    startTransition(async () => {
      const result = await updateAppointmentStatusAction(appointmentId, next);
      if (result.success) {
        setAllowed(nextStatuses(next));
      } else {
        setValue(previous);
        setAllowed(previousAllowed);
        setFailed(true);
      }
    });
  };

  const choices = [value, ...allowed.filter((s) => s !== value)];

  return (
    <div>
      <select
        className="field min-h-11 py-1 text-sm"
        aria-label={ariaLabel}
        value={value}
        disabled={pending || allowed.length === 0}
        onChange={(e) => change(e.target.value as AppointmentStatus)}
      >
        {choices.map((s) => (
          <option key={s} value={s}>{labels[s]}</option>
        ))}
      </select>
      {failed && <p role="alert" className="mt-1 text-sm text-clay-700">{errorText}</p>}
    </div>
  );
}
