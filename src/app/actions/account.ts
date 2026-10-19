"use server";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { requireUser, destroySession } from "@/lib/auth";
import { deleteAccount } from "@/lib/deletion";

export async function deleteAccountAction(formData: FormData) {
  const user = requireUser();
  const confirm = String(formData.get("confirm") ?? "");
  if (confirm !== user.username) redirect("/settings?delete=mismatch");
  const db = getDb();
  deleteAccount(db, user.id);
  destroySession();
  redirect("/?deleted=1");
}
