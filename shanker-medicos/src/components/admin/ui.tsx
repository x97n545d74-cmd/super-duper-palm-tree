"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ children, pendingText = "Saving…", className = "btn btn-primary", pending: pendingProp, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { pendingText?: string; pending?: boolean }) {
  const status = useFormStatus();
  const pending = pendingProp ?? status.pending;
  return (
    <button type="submit" disabled={pending} aria-disabled={pending} className={`${className} disabled:opacity-60`} {...rest}>
      {pending ? pendingText : children}
    </button>
  );
}

export function Notice({ state }: { state: { ok: boolean; message?: string } | null }) {
  if (!state?.message) return null;
  return (
    <p role={state.ok ? "status" : "alert"} className={`rounded-control px-4 py-3 text-sm ${state.ok ? "bg-mint text-forest" : "bg-[#FDECEC] text-danger"}`}>
      {state.message}
    </p>
  );
}

export function Field({
  label,
  name,
  error,
  hint,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="label">
        {label}
      </label>
      {children}
      {hint && !error && <p className="hint">{hint}</p>}
      {error && (
        <p className="mt-1 text-sm text-danger" id={`${name}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}
