import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Join MealForge</h1>
          <p className="text-gray-600 mt-2">
            Create your account to start managing recipes
          </p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-none border-0 bg-white/70 backdrop-blur-sm border-orange-200",
            }
          }}
        />
      </div>
    </div>
  );
}