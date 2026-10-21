"use client";

import { useState, useTransition } from "react";
import { cancelMyAppointmentAction } from "@/app/actions/appointmentActions";

export default function CancelButton({ appointmentId, label, errorText }: { appointmentId: number; label: string; errorText: string }) {
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <button
        type="button"
        className="text-link text-sm min-h-11"
        disabled={pending}
        onClick={() => {
          setFailed(false);
          startTransition(async () => {
            const result = await cancelMyAppointmentAction(appointmentId);
            if (!result.success) setFailed(true);
          });
        }}
      >
        {label}
      </button>
      {failed && <p role="alert" className="text-sm text-clay-700">{errorText}</p>}
    </div>
  );
}
