import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client";
import { requireAuth } from "@/lib/auth-utils";
import { SignoutButton } from "@/features/auth/components/signout";
import { caller } from "@/trpc/server";

const page = async () => {
  await requireAuth();

  const data = await caller.getUsers();

  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      protected server component
      <div>
      {JSON.stringify(data, null, 2)}
      </div>
      <SignoutButton />
    </div>
  )
}

export default page