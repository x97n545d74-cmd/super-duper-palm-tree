"use client";

import { startTransition, type FormEvent } from "react";

/**
 * React 19 resets a <form action={...}> after every submission, which wipes
 * what the user typed when the server returns a validation error. Submitting
 * through onSubmit + startTransition runs the same server action without the
 * automatic reset. Pair with useActionState's `pending` for the button state.
 */
export function keepValues(action: (fd: FormData) => void) {
  return (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget, (e.nativeEvent as SubmitEvent).submitter);
    startTransition(() => action(fd));
  };
}
