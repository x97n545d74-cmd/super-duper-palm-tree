"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/admin/actions";
import { Notice, SubmitButton } from "./ui";

export function LoginForm() {
  const [state, action] = useActionState(loginAction, null);
  return (
    <form action={action} className="mt-8 space-y-5">
      <div>
        <label htmlFor="email" className="label">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="username" required className="field" />
      </div>
      <div>
        <label htmlFor="password" className="label">
          Password
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="field" />
      </div>
      <Notice state={state} />
      <SubmitButton className="btn btn-primary h-12 w-full" pendingText="Signing in…">
        Sign in
      </SubmitButton>
    </form>
  );
}
