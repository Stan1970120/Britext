"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaGoogle, FaApple } from "react-icons/fa6";
import { REST_API } from "../constant";
import { useUser, useUserType } from "../hooks";

export default function SignupPage() {
  const router = useRouter();
  const { setUser } = useUser();
  const { setUserType } = useUserType();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [sex, setSex] = useState("");
  const [email, setEmail] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [passwordNotMatch, setPasswordNotMatch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pushError, setPushError] = useState({ status: false, message: "" });

  // Validate password match
  const validatePasswords = () => {
    if (password1 && password2 && password1 === password2) {
      setPasswordNotMatch(false);
      return true;
    } else {
      setPasswordNotMatch(true);
      return false;
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswords()) return;

    setLoading(true);

    const payload = {
      firstName,
      lastName,
      email,
      password: password1,
      sex,
    };

    try {
      const res = await fetch(`${REST_API}/auth_create/create_account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.user?.user_id) {
        setUser(data.user);
        setUserType(data.user.role);
        router.replace(`/${data.user.role}s`);
      } else {
        setPushError({ status: true, message: "Error creating account" });
      }
    } catch (err) {
      console.error(err);
      setPushError({ status: true, message: "Network error" });
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

          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>

          <div className="flex gap-2">
            <input
              type="password"
              placeholder="Password"
              value={password1}
              onChange={(e) => setPassword1(e.target.value)}
              required
              className={`w-1/2 border px-3 py-2 rounded-lg outline-none ${
                passwordNotMatch ? "border-red-500" : "focus:ring-2 focus:ring-sky-500"
              }`}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              required
              className={`w-1/2 border px-3 py-2 rounded-lg outline-none ${
                passwordNotMatch ? "border-red-500" : "focus:ring-2 focus:ring-sky-500"
              }`}
            />
          </div>

          {passwordNotMatch && (
            <p className="text-red-600 text-xs">Passwords do not match</p>
          )}

          <div className="flex gap-3">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="sex"
                value="male"
                onChange={(e) => setSex(e.target.value)}
                required
              />
              Male
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="sex"
                value="female"
                onChange={(e) => setSex(e.target.value)}
                required
              />
              Female
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="sex"
                value="custom"
                onChange={(e) => setSex(e.target.value)}
                required
              />
              Custom
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-700 text-white py-2 rounded-lg hover:bg-sky-800 transition"
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">or sign up with</p>
        <div className="flex justify-center gap-4 mt-2">
          <button className="flex items-center gap-2 border px-3 py-2 rounded-lg hover:bg-gray-100">
            <FaGoogle className="text-red-500" /> Google
          </button>
          <button className="flex items-center gap-2 border px-3 py-2 rounded-lg hover:bg-gray-100">
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
