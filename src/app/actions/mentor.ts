"use server";
import { z } from "zod";
import { getDb, newId, now } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getMarketProvider } from "@/lib/market";
import { mentorRespond } from "@/lib/mentor/service";

const MsgSchema = z.object({
  conversationId: z.string().max(64).optional(),
  message: z.string().min(1).max(500)
});

export async function mentorAction(_prev: { reply?: string; conversationId?: string; error?: string }, formData: FormData) {
  const user = requireUser();
  const parsed = MsgSchema.safeParse({
    conversationId: formData.get("conversationId") || undefined,
    message: formData.get("message")
  });
  if (!parsed.success) return { error: "כתוב שאלה קצרה (עד 500 תווים)." };
  const db = getDb();
  // Conversation ownership: create or verify the conversation belongs to this user.
  let convId = parsed.data.conversationId;
  if (convId) {
    const own = db.prepare("SELECT id FROM ai_conversations WHERE id = ? AND user_id = ?").get(convId, user.id);
    if (!own) return { error: "שיחה לא נמצאה." };
  } else {
    convId = newId();
    db.prepare("INSERT INTO ai_conversations (id, user_id, created_at) VALUES (?,?,?)").run(convId, user.id, now());
  }
  const reply = mentorRespond(db, getMarketProvider(), user.id, parsed.data.message);
  const ins = db.prepare("INSERT INTO ai_messages (conversation_id, role, content, created_at) VALUES (?,?,?,?)");
  ins.run(convId, "user", parsed.data.message, now());
  ins.run(convId, "mentor", reply, now());
  return { reply, conversationId: convId };
}
