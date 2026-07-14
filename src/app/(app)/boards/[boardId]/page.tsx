import { notFound, redirect } from "next/navigation";

import { BoardScreen } from "@/components/board/board-screen";
import { requireUser } from "@/lib/auth/session";
import { getBoardData, getStructLevels } from "@/lib/db/queries/board";

export const dynamic = "force-dynamic";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const { boardId: boardIdParam } = await params;
  const boardId = Number(boardIdParam);
  if (!Number.isInteger(boardId) || boardId < 1) notFound();

  const user = await requireUser();
  const [data, levels] = await Promise.all([
    getBoardData(user.id, boardId),
    getStructLevels(),
  ]);

  if (!data) redirect("/boards");

  return <BoardScreen data={data} levels={levels} />;
}
