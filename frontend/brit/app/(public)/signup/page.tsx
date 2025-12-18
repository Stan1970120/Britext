"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FaGoogle, FaApple } from "react-icons/fa6";
import { useUser } from "@/app/hooks/useUser";

interface SignupError {
  status: boolean;
  message: string;
}

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useUser();

  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [sex, setSex] = useState<"male" | "female" | "custom" | "">("");
  const [email, setEmail] = useState<string>("");
  const [password1, setPassword1] = useState<string>("");
  const [password2, setPassword2] = useState<string>("");

  const [passwordNotMatch, setPasswordNotMatch] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [pushError, setPushError] = useState<SignupError>({
    status: false,
    message: "",
  });

  const validatePasswords = (): boolean => {
    const valid = password1.length > 0 && password1 === password2;
    setPasswordNotMatch(!valid);
    return valid;
  };

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPushError({ status: false, message: "" });

    if (!validatePasswords()) return;

    setLoading(true);

    try {
      await signup({
        firstName,
        lastName,
        email,
        password: password1,
      });

      // Successful signup → redirect
      router.replace("/dashboard");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Signup failed";
      setPushError({ status: true, message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-sky-700">
          Create Your Account
        </h2>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-1/2 border px-3 py-2 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-1/2 border px-3 py-2 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
          />

          <div className="flex gap-2">
            <input
              type="password"
              placeholder="Password"
              value={password1}
              onChange={(e) => setPassword1(e.target.value)}
              required
              className={`w-1/2 border px-3 py-2 rounded-lg outline-none ${
                passwordNotMatch
                  ? "border-red-500"
                  : "focus:ring-2 focus:ring-sky-500"
              }`}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              required
              className={`w-1/2 border px-3 py-2 rounded-lg outline-none ${
                passwordNotMatch
                  ? "border-red-500"
                  : "focus:ring-2 focus:ring-sky-500"
              }`}
            />
          </div>

          {passwordNotMatch && (
            <p className="text-red-600 text-xs">Passwords do not match</p>
          )}

          {pushError.status && (
            <p className="text-red-600 text-sm">{pushError.message}</p>
          )}

          <div className="flex gap-4 text-sm">
            {(["male", "female", "custom"] as const).map((value) => (
              <label key={value} className="flex items-center gap-1">
                <input
                  type="radio"
                  name="sex"
                  value={value}
                  checked={sex === value}
                  onChange={(e) =>
                    setSex(e.target.value as typeof sex)
                  }
                  required
                />
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </label>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-700 text-white py-2 rounded-lg hover:bg-sky-800 transition disabled:opacity-60"
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          or sign up with
        </p>

        <div className="flex justify-center gap-4 mt-2">
          <button
            type="button"
            className="flex items-center gap-2 border px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            <FaGoogle className="text-red-500" /> Google
          </button>
          <button
            type="button"
            className="flex items-center gap-2 border px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            <FaApple className="text-gray-800" /> Apple
          </button>
        </div>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <button
            onClick={() => router.push("/signin")}
            className="text-sky-700 hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </section>
  );
}
