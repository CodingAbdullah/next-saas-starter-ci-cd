import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <SignUp 
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
        />
      </div>
    </div>
  );
}