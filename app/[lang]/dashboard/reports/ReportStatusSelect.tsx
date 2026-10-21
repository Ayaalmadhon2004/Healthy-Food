"use client";

import { useState, useTransition } from "react";
import { updateReportStatusAction } from "@/app/actions/reportActions";
import type { ReportStatus } from "@/lib/reportStatus";

export default function ReportStatusSelect({
  reportId,
  status,
  labels,
  ariaLabel,
  errorText,
}: {
  reportId: number;
  status: ReportStatus;
  labels: Record<ReportStatus, string>;
  ariaLabel: string;
  errorText: string;
}) {
  const [value, setValue] = useState<ReportStatus>(status);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();

  const change = (next: ReportStatus) => {
    const previous = value;
    setValue(next);
    setFailed(false);
    startTransition(async () => {
      const result = await updateReportStatusAction(reportId, next);
      if (!result.success) {
        setValue(previous);
        setFailed(true);
      }
    });
  };

  return (
    <div>
      <select
        className="field min-h-11 py-1 text-sm"
        aria-label={ariaLabel}
        value={value}
        disabled={pending}
        onChange={(e) => change(e.target.value as ReportStatus)}
      >
        {(Object.keys(labels) as ReportStatus[]).map((s) => (
          <option key={s} value={s}>{labels[s]}</option>
        ))}
      </select>
      {failed && <p role="alert" className="mt-1 text-sm text-clay-700">{errorText}</p>}
    </div>
  );
}
