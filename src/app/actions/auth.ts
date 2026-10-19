"use server";
import { redirect } from "next/navigation";
import { registerUser, loginUser, createSession, destroySession, AGE_BANDS, type AgeBand } from "@/lib/auth";

export async function registerAction(_prev: { error?: string }, formData: FormData) {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const ageBand = String(formData.get("ageBand") ?? "") as AgeBand;
  if (!AGE_BANDS.includes(ageBand)) return { error: "יש לבחור קבוצת גיל." };
  const r = registerUser(username, password, ageBand);
  if (!r.ok) return { error: r.errorHe };
  createSession(r.userId);
  redirect("/onboarding");
}

export async function loginAction(_prev: { error?: string }, formData: FormData) {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const user = loginUser(username, password);
  if (!user) return { error: "שם משתמש או סיסמה לא נכונים." };
  createSession(user.id);
  redirect("/dashboard");
}

export async function logoutAction() {
  destroySession();
  redirect("/");
}
