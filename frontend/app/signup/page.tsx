"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import authService from "@/lib/authService";
import { ApiError } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, User, Mail, Lock } from "lucide-react";

interface SignupResponse {
  access_token?: string;
  refresh_token?: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
  message?: string;
}

const SignupPage = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (formData.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Call the signup service
      const response = await authService.signup({
        email: formData.email,
        password: formData.password,
        name: formData.username,
      });

      // Show success message
      setSuccess(true);

      // If tokens are returned, user is auto-logged in
      if (response.access_token) {
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } else {
        // Otherwise redirect to login after 2 seconds
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Signup failed. Please try again.");

      // Handle validation errors from backend
      if (apiError.errors) {
        setValidationErrors(
          Object.entries(apiError.errors).reduce((acc, [key, messages]) => {
            acc[key] = Array.isArray(messages) ? messages[0] : messages;
            return acc;
          }, {} as Record<string, string>)
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-tr from-indigo-600 to-pink-500 flex items-center justify-center text-white font-bold">
                C
              </div>
              <span className="text-xl font-semibold">Craon</span>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Join us today and start your journey
            </p>
          </div>

          {/* Success Alert */}
          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Account created successfully! Redirecting...
              </AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {error && !success && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white shadow-sm border border-gray-100 rounded-lg p-6 space-y-4"
          >
            {/* Username */}
            <div>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Username</span>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    name="username"
                    autoComplete="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`pl-10 ${
                      validationErrors.username ? "border-red-300" : ""
                    }`}
                    placeholder="johndoe"
                    required
                    disabled={loading || success}
                  />
                </div>
                {validationErrors.username && (
                  <p className="mt-1 text-xs text-red-600">
                    {validationErrors.username}
                  </p>
                )}
              </label>
            </div>

            {/* Email */}
            <div>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Email</span>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`pl-10 ${
                      validationErrors.email ? "border-red-300" : ""
                    }`}
                    placeholder="you@company.com"
                    required
                    disabled={loading || success}
                  />
                </div>
                {validationErrors.email && (
                  <p className="mt-1 text-xs text-red-600">
                    {validationErrors.email}
                  </p>
                )}
              </label>
            </div>

            {/* Password */}
            <div>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Password</span>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    type="password"
                    name="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`pl-10 ${
                      validationErrors.password ? "border-red-300" : ""
                    }`}
                    placeholder="••••••••"
                    required
                    disabled={loading || success}
                  />
                </div>
                {validationErrors.password && (
                  <p className="mt-1 text-xs text-red-600">
                    {validationErrors.password}
                  </p>
                )}
              </label>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Confirm Password
                </span>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    type="password"
                    name="confirmPassword"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`pl-10 ${
                      validationErrors.confirmPassword ? "border-red-300" : ""
                    }`}
                    placeholder="••••••••"
                    required
                    disabled={loading || success}
                  />
                </div>
                {validationErrors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">
                    {validationErrors.confirmPassword}
                  </p>
                )}
              </label>
            </div>

            {/* Password Requirements */}
            <div className="text-xs text-gray-500 space-y-1 bg-gray-50 p-3 rounded-md">
              <p className="font-medium text-gray-700">Password must contain:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li className={formData.password.length >= 8 ? "text-green-600" : ""}>
                  At least 8 characters
                </li>
                <li className={/[A-Z]/.test(formData.password) ? "text-green-600" : ""}>
                  One uppercase letter (recommended)
                </li>
                <li className={/[0-9]/.test(formData.password) ? "text-green-600" : ""}>
                  One number (recommended)
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors"
              disabled={loading || success}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Creating account...
                </span>
              ) : success ? (
                "Account created!"
              ) : (
                "Create account"
              )}
            </Button>

            {/* Login Link */}
            <div className="text-center pt-2">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
                  disabled={loading}
                >
                  Sign in
                </button>
              </p>
            </div>
          </form>

          {/* Terms */}
          <p className="mt-6 text-center text-xs text-gray-500">
            By creating an account, you agree to our{" "}
            <a href="#" className="text-indigo-600 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-indigo-600 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;