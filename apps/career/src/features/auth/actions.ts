"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

export interface LoginState {
  message?: string;
}

const loginSchema = z.object({
  email: z.email("请输入有效邮箱").trim().toLowerCase(),
  password: z.string().min(1, "请输入密码"),
});

function getLoginErrorMessage(code?: string) {
  switch (code) {
    case "email_not_confirmed":
      return "该邮箱尚未确认，请先在 Supabase 中确认用户";
    case "invalid_credentials":
      return "邮箱或密码不正确";
    case "user_banned":
      return "该用户当前无法登录";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "登录尝试过于频繁，请稍后再试";
    default:
      return "登录服务暂时不可用，请稍后重试";
  }
}

export async function loginAction(_state: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? "请检查登录信息" };
  }

  const allowedEmail = process.env.CAREER_OS_ALLOWED_EMAIL?.trim().toLowerCase();
  if (allowedEmail && parsed.data.email !== allowedEmail) {
    console.warn("[auth] Sign-in blocked because the email is not allowed");
    return { message: "请使用 Career OS 配置的登录邮箱" };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);

    if (error) {
      console.error("[auth] Supabase sign-in failed", {
        code: error.code,
        status: error.status,
      });
      return { message: getLoginErrorMessage(error.code) };
    }
  } catch (error) {
    console.error("[auth] Supabase sign-in request failed", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
    return { message: "登录服务暂时不可用，请稍后重试" };
  }

  redirect("/");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
