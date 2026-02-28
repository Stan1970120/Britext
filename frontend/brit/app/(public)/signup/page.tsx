"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useUser } from "@/app/hooks/useUser";
import { Eye, EyeOff, Facebook } from "lucide-react"; 

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

  const [showPassword, setShowPassword] = useState(false); 
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

  /**
   * ✅ OAuth Handlers
   * These redirect the user to your Backend Passport.js/OAuth routes
   */
  const handleGoogleSignup = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  const handleFacebookSignup = () => {
    window.location.href = `${API_URL}/auth/facebook`;
  };

  return (
    <>
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl text-center shadow-lg border border-gray-100">
            <h3 className="text-xl font-semibold text-green-600">
              Account Created 🎉
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              Redirecting you shortly...
            </p>
          </div>
        </div>
      )}

      <section className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md border border-gray-100">
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
                className="w-1/2 border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
              />
              <input
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-1/2 border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
            />

            <div className="space-y-3">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password1}
                  onChange={(e) => setPassword1(e.target.value)}
                  required
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-sky-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                required
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            {passwordNotMatch && (
              <p className="text-xs text-red-600 font-medium italic">Passwords do not match</p>
            )}
            {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}

            <div className="flex gap-4 text-sm py-2">
              {(["male", "female", "custom"] as const).map((v) => (
                <label key={v} className="flex items-center gap-1 cursor-pointer group">
                  <input
                    type="radio"
                    value={v}
                    checked={sex === v}
                    onChange={(e) =>
                      setSex(e.target.value as "male" | "female" | "custom")
                    }
                    required
                    className="accent-sky-700"
                  />
                  <span className="capitalize text-gray-600 group-hover:text-sky-700 transition">
                    {v}
                  </span>
                </label>
              ))}
            </div>

            <button
              disabled={loading}
              className="w-full bg-sky-700 hover:bg-sky-800 text-white font-semibold py-2.5 rounded-lg transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500 uppercase tracking-wider text-xs">or sign up with</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-3">
            {/* Google Button */}
            <button
              onClick={handleGoogleSignup}
              className="flex flex-1 items-center justify-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Image
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                width={18}
                height={18}
              />
              <span className="text-sm font-medium text-gray-700">Google</span>
            </button>

            {/* Facebook Button (Replaced Apple) */}
            <button
              onClick={handleFacebookSignup}
              className="flex flex-1 items-center justify-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Image
                src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg"
                alt="Facebook"
                width={18}
                height={18}
              />
              <span className="text-sm font-medium text-gray-700">Facebook</span>
            </button>
          </div>
        </div>
      </section>
    </>
  );
}