import { SignUpForm } from '@/features/auth/components/signup-form'
import { requireUnauth } from '@/lib/auth-utils'

const page = async () => {
  await requireUnauth();

  return (
    <div className="flex justify-center items-center">
        <SignUpForm />
    </div>
  )
}

export default page