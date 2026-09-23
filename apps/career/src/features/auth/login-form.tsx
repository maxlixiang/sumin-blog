"use client";

import { useActionState } from "react";

import { loginAction, type LoginState } from "@/features/auth/actions";

const INITIAL_STATE: LoginState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, INITIAL_STATE);

  return (
    <form className="login-form" action={action}>
      <div className="form-field">
        <label htmlFor="email">邮箱</label>
        <input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="form-field">
        <label htmlFor="password">密码</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      {state.message ? <p className="form-message form-message--error" role="alert">{state.message}</p> : null}
      <button className="button button--primary login-button" type="submit" disabled={pending}>
        {pending ? "正在登录…" : "登录"}
      </button>
    </form>
  );
}
