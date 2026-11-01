import prisma from "@/lib/prisma"

const page = async () => {
  const users = await prisma.user.findMany()

  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      {JSON.stringify(users)}
    </div>
  )
}

export default page