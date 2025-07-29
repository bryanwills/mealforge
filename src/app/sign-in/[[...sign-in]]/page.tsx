import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-3">Welcome to MealForge</h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Sign in to access your comprehensive recipe management and meal planning companion
          </p>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-orange-200 dark:border-gray-700 rounded-xl",
              headerTitle: "text-2xl font-bold text-gray-800 dark:text-white",
              headerSubtitle: "text-gray-600 dark:text-gray-300",
              header: "text-center",
              socialButtonsBlockButton: "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 h-12 text-base font-medium",
              socialButtonsBlockButtonArrow: "text-gray-700 dark:text-gray-200",
              formButtonPrimary: "bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white font-medium h-12 text-base transition-colors duration-200",
              formFieldLabel: "text-gray-700 dark:text-gray-200 font-medium text-base",
              formFieldInput: "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 h-12 text-base",
              formFieldInputShowPasswordIcon: "text-gray-500 dark:text-gray-400",
              formFieldInputShowPasswordButton: "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200",
              footerActionLink: "text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium",
              dividerLine: "bg-gray-200 dark:bg-gray-600",
              dividerText: "text-gray-500 dark:text-gray-400 font-medium",
              formFieldLabelRow: "text-gray-700 dark:text-gray-200",
              formResendCodeLink: "text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300",
              formFieldAction: "text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300",
              footer: "text-gray-600 dark:text-gray-300",
              footerAction: "text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300",
              identityPreviewText: "text-gray-700 dark:text-gray-200",
              identityPreviewEditButton: "text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300",
            },
            variables: {
              colorPrimary: "#f97316",
              colorText: "#374151",
              colorTextSecondary: "#6b7280",
              colorBackground: "#ffffff",
              colorInputBackground: "#ffffff",
              colorInputText: "#111827",
              borderRadius: "0.75rem",
            },
            layout: {
              socialButtonsPlacement: "bottom",
              showOptionalFields: false,
              privacyPageUrl: "https://mealforge.app/privacy",
              termsPageUrl: "https://mealforge.app/terms",
            },
          }}
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          redirectUrl="/"
        />
      </div>
    </div>
  );
}