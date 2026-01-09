"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useUser } from "@/app/hooks/useUser";

type Sex = "male" | "female" | "custom" | "";

const API_URL = process.env.NEXT_PUBLIC_REST_API;

export default function SignupPage() {
  const router = useRouter();
  const { signup, user } = useUser();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [sex, setSex] = useState<Sex>("");
  const [email, setEmail] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");

  const [loading, setLoading] = useState(false);
  const [passwordNotMatch, setPasswordNotMatch] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  /* Redirect AFTER success modal */
 useEffect(() => {
  if (!showSuccess || !user) return;

  const timer = setTimeout(() => {
    if (user.role === "admin") {
      router.replace("/dashboard");
    } else {
      router.replace("/checkout");
    }
  }, 2000);

  return () => clearTimeout(timer);
}, [showSuccess, user, router]);


  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password1 !== password2) {
      setPasswordNotMatch(true);
      return;
    }

    setPasswordNotMatch(false);
    setLoading(true);

    try {
      await signup({
        firstName,
        lastName,
        email,
        password: password1,
        sex,
      });
      setShowSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  /* OAuth handlers */
  const handleGoogleSignup = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  const handleAppleSignup = () => {
    window.location.href = `${API_URL}/auth/apple`;
  };

  return (
    <>
      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded-xl text-center shadow-lg">
            <h3 className="text-xl font-semibold text-green-600">
              Account Created 🎉
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              Redirecting you shortly...
            </p>
          </div>
        </div>
      )}

      <section className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
          <h2 className="text-2xl font-bold text-center mb-6 text-sky-700">
            Create Your Account
          </h2>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="flex gap-2">
              <input
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-1/2 border px-3 py-2 rounded-lg"
              />
              <input
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-1/2 border px-3 py-2 rounded-lg"
              />
            </div>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border px-3 py-2 rounded-lg"
            />

            <div className="flex gap-2">
              <input
                type="password"
                placeholder="Password"
                value={password1}
                onChange={(e) => setPassword1(e.target.value)}
                required
                className="w-1/2 border px-3 py-2 rounded-lg"
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                required
                className="w-1/2 border px-3 py-2 rounded-lg"
              />
            </div>

            {passwordNotMatch && (
              <p className="text-xs text-red-600">Passwords do not match</p>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-4 text-sm">
              {(["male", "female", "custom"] as const).map((v) => (
                <label key={v} className="flex items-center gap-1">
                  <input
                    type="radio"
                    value={v}
                    checked={sex === v}
                    onChange={(e) =>
                      setSex(e.target.value as "male" | "female" | "custom")
                    }
                    required
                  />
                  {v}
                </label>
              ))}
            </div>

            <button
              disabled={loading}
              className="w-full bg-sky-700 text-white py-2 rounded-lg"
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-sm mt-4 text-gray-600">
            or sign up with
          </p>

          <div className="flex justify-center gap-4 mt-3">
            <button
              onClick={handleGoogleSignup}
              className="flex items-center gap-2 border px-4 py-2 rounded-lg hover:bg-gray-100"
            >
              <Image
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                width={18}
                height={18}
              />
              Google
            </button>

            <button
              onClick={handleAppleSignup}
              className="flex items-center gap-2 border px-4 py-2 rounded-lg hover:bg-gray-100"
            >
              <Image
                src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
                alt="Apple"
                width={16}
                height={16}
              />
              Apple
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
