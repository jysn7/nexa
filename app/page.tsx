import prisma from "@/lib/prisma"
import { caller } from "@/trpc/server"

const page = async () => {
  const users = await caller.getUsers()

  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      {JSON.stringify(users)}
    </div>
  )
}

export default page