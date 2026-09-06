import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { User, Mail, Lock, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../services/api";

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup, login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("Operator");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Form client-side validation
    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your work email.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);
    try {
      // 1. Call Backend Signup API via Axios
      await signup({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });

      // 2. Automatically log the new user in
      try {
        await login(email.trim(), password);
        navigate("/detection", { replace: true });
      } catch {
        // If auto-login has any hiccup, redirect to login page with success notification
        navigate("/login", {
          state: {
            message: "Account created successfully! Please sign in with your credentials.",
          },
        });
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-xl font-black text-[#1a1a1a]">Create Account</h2>
        <p className="text-xs text-[#6b6b6b] mt-1">
          Register as an operator for Vigil AI Smart Security
        </p>
      </div>

      {/* Error Alert Banner */}
      {error && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#ffebee] border border-[#ef9a9a] text-[#c62828] text-xs leading-relaxed animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Registration failed: </span>
            {error}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <Input
          label="Full Name"
          type="text"
          icon={User}
          placeholder="e.g. Officer Somchai"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
        />

        <Input
          label="Work Email"
          type="email"
          icon={Mail}
          placeholder="officer@organization.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          disabled={loading}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#1a1a1a] uppercase tracking-wider">
            Operator Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={loading}
            className="w-full bg-white border border-[#e8e0d5] text-[#1a1a1a] text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-[#e8b48a] focus:ring-2 focus:ring-[#f5c9a8]/30 transition-all disabled:opacity-60"
          >
            <option value="Operator">Security Operator (Live Monitoring)</option>
            <option value="Engineer">AI & IoT Field Engineer</option>
            <option value="Admin">System Administrator</option>
          </select>
        </div>

        <Input
          label="Password"
          type="password"
          icon={Lock}
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          disabled={loading}
        />

        <Input
          label="Confirm Password"
          type="password"
          icon={Lock}
          placeholder="Repeat password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          disabled={loading}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={loading}
          icon={loading ? Loader2 : ShieldCheck}
          className="mt-2 w-full font-semibold"
        >
          {loading ? "Creating Operator Profile..." : "Create Operator Profile"}
        </Button>
      </form>

      <div className="text-center pt-1 text-xs text-[#6b6b6b]">
        Already have credentials?{" "}
        <Link
          to="/login"
          className="font-bold text-[#1a1a1a] hover:underline"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
