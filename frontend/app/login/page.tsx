"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import api, { ApiError } from "@/lib/apiClient";
import { useRouter } from "next/navigation";

interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      // Call Flask API with typed response
      const response = await api.post<LoginResponse>("/auth/login", {
        username: email, // Flask expects 'username'
        password,
      });

      // Save JWT tokens using the API client
      api.setAuthToken(response.access_token);
      
      if (response.refresh_token) {
        api.setRefreshToken(response.refresh_token);
      }

      if (remember) {
        localStorage.setItem("rememberMe", "true");
        localStorage.setItem("userEmail", email);
      }

      console.log("Login successful:", response.user);
      
      router.push("/");
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Unable to sign in. Please try again.");
      
      if (apiError.errors) {
        console.error("Validation errors:", apiError.errors);
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
            <div className="inline-flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-tr from-indigo-600 to-pink-500 flex items-center justify-center text-white font-bold">
                C
              </div>
              <span className="text-xl font-semibold">Craon</span>
            </div>
            <h2 className="mt-6 text-2xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your details to continue to your dashboard.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={onSubmit}
            className="bg-white shadow-sm border border-gray-100 rounded-lg p-6"
          >
            {error && (
              <div className="text-sm text-red-600 mb-4 p-3 bg-red-50 rounded-md border border-red-200">
                {error}
              </div>
            )}

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Email</span>
              <Input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full"
                placeholder="you@company.com"
                required
              />
            </label>

            <label className="block mt-4">
              <span className="text-sm font-medium text-gray-700">Password</span>
              <Input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full"
                placeholder="••••••••"
                required
              />
            </label>

            <div className="flex items-center justify-between mt-4">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-gray-200"
                />
                <span className="text-gray-600">Remember me</span>
              </label>

              <a href="#" className="text-sm text-indigo-600 hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 text-white px-4 py-2 font-semibold shadow hover:bg-indigo-700 disabled:opacity-60 transition-colors"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}