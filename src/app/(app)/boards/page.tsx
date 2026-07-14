import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { getOrCreateDefaultBoard } from "@/lib/db/queries/board";

export const dynamic = "force-dynamic";

export default async function BoardsIndexPage() {
  const user = await requireUser();
  const board = await getOrCreateDefaultBoard(user.id);
  redirect(`/boards/${board.id}`);
}
