import { WhatsNextView } from "@/components/whats-next/whats-next-view";
import { requireUser } from "@/lib/auth/session";
import { getUpNext } from "@/lib/db/queries/whats-next";

export const dynamic = "force-dynamic";

export const metadata = { title: "What’s next — bStruct" };

export default async function WhatsNextPage() {
  const user = await requireUser();
  const items = await getUpNext(user.id);

  return <WhatsNextView items={items} />;
}
