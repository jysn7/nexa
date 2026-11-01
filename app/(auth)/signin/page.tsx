import { SignInForm } from '@/features/auth/components/signin-form'
import { requireUnauth } from "@/lib/auth-utils"

const page = async () => {
  await requireUnauth();
  
  return (
    <div className="flex justify-center items-center">
        <SignInForm />
    </div>
  )
}

export default page