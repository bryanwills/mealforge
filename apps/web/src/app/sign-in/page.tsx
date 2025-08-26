"use client";

import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaGithub } from "react-icons/fa";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignInPage() {
  const [isEmailSignUp, setIsEmailSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleGoogleSignIn = () => {
    // TODO: Implement better-auth Google sign-in
    console.log("Google sign-in");
  };

  const handleFacebookSignIn = () => {
    // TODO: Implement better-auth Facebook sign-in
    console.log("Facebook sign-in");
  };

  const handleGitHubSignIn = () => {
    // TODO: Implement better-auth GitHub sign-in
    console.log("GitHub sign-in");
  };

  const handleEmailSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement email sign-up
    console.log("Email sign-up:", { email, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-3">Welcome to MealForge</h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Sign in to access your comprehensive recipe management and meal planning companion
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">Sign in to MealForge.app</h2>
            <p className="text-gray-600 dark:text-gray-400">Welcome back! Please sign in to continue.</p>
          </div>

          {!isEmailSignUp ? (
            <>
              <div className="space-y-3">
                <Button
                  onClick={handleGoogleSignIn}
                  className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 hover:border-gray-400 flex items-center justify-center space-x-3 py-3 px-4 rounded-lg transition-colors"
                >
                  <FcGoogle className="w-5 h-5" />
                  <span>Continue with Google</span>
                </Button>

                <Button
                  onClick={handleFacebookSignIn}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center space-x-3 py-3 px-4 rounded-lg transition-colors"
                >
                  <FaFacebook className="w-5 h-5" />
                  <span>Continue with Facebook</span>
                </Button>

                <Button
                  onClick={handleGitHubSignIn}
                  className="w-full bg-gray-800 hover:bg-gray-900 text-white flex items-center justify-center space-x-3 py-3 px-4 rounded-lg transition-colors"
                >
                  <FaGithub className="w-5 h-5" />
                  <span>Continue with GitHub</span>
                </Button>
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">or</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => setIsEmailSignUp(true)}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg transition-colors"
                >
                  Continue with Email
                </Button>
              </div>
            </>
          ) : (
            <form onSubmit={handleEmailSignUp} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="mt-1"
                  required
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  type="submit"
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg transition-colors"
                >
                  Sign Up
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEmailSignUp(false)}
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Back
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <button
                onClick={() => setIsEmailSignUp(!isEmailSignUp)}
                className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium"
              >
                {isEmailSignUp ? "Sign in with social" : "Sign up with email"}
              </button>
            </p>
          </div>
        </div>

        <div className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
          Secured by NextAuth.js
        </div>
      </div>
    </div>
  );
}
