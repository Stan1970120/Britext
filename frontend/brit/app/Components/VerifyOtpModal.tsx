"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Mail, RefreshCw, X, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface VerifyOtpModalProps {
  isOpen: boolean;
  email: string;
  onClose: () => void;
  onSuccessRedirect?: string;
}

export default function VerifyOtpModal({
  isOpen,
  email,
  onClose,
  onSuccessRedirect = "/profile",
}: VerifyOtpModalProps) {
  const { verifyOtp, resendOtp } = useAuth();
  const router = useRouter();

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(60);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  // Resend Cooldown Countdown
  useEffect(() => {
    if (!isOpen || cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, cooldown]);

  if (!isOpen) return null;

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Digits only

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take latest char
    setOtp(newOtp);
    setError(null);

    // Auto-advance focus to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtp(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullCode = otp.join("");

    if (fullCode.length < 6) {
      setError("Please enter all 6 digits.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await verifyOtp(email, fullCode);
      router.push(onSuccessRedirect);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid or expired OTP code.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;

    setResending(true);
    setError(null);
    setResendMessage(null);

    try {
      await resendOtp(email);
      setResendMessage("Verification code resent successfully!");
      setCooldown(60);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to resend code.");
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-10 max-w-md w-full shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header Icon & Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#005F7A]/10 text-[#005F7A] rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Verify Your Email</h2>
          <p className="text-sm text-slate-500 mt-2">
            We sent a 6-digit code to <br />
            <strong className="text-slate-800">{email}</strong>
          </p>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {resendMessage && (
          <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-xs font-semibold flex items-center justify-center gap-2">
            <CheckCircle2 size={16} />
            {resendMessage}
          </div>
        )}

        {/* OTP Input Fields Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between gap-2">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                type="text"
                maxLength={1}
                value={digit}
                ref={(el) => { inputRefs.current[idx] = el; }}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                className="w-12 h-14 text-center text-xl font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#005F7A] focus:ring-2 focus:ring-[#005F7A]/20 focus:bg-white outline-none transition-all"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || otp.join("").length < 6}
            className="w-full bg-[#005F7A] text-white font-bold py-4 rounded-xl shadow-lg shadow-sky-100 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100 transition-all"
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>
        </form>

        {/* Resend OTP Cooldown Section */}
        <div className="text-center mt-6">
          <p className="text-xs text-slate-500">
            Didn&apos;t receive the code?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || resending}
              className="text-[#005F7A] font-bold hover:underline disabled:opacity-40 disabled:hover:no-underline inline-flex items-center gap-1"
            >
              {resending && <RefreshCw size={12} className="animate-spin" />}
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Code"}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}