import React, { useState } from "react";
<<<<<<< HEAD
import { Link, useNavigate, useLocation } from "react-router";
import { Mail, Lock, LogIn, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../services/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(
    location.state?.message || ""
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!email || !password) {
      setError("Please provide both email and password.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      // Success: redirect to original page or detection dashboard
      const redirectTo = location.state?.from || "/detection";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
=======
import { Link, useNavigate } from "react-router";
import { Mail, Lock, LogIn } from "lucide-react";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@vigil-security.io");
  const [password, setPassword] = useState("••••••••••••");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/detection");
    }, 600);
>>>>>>> e56e852f926bab241dfea2144d00ca88b574d79a
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-xl font-black text-[#1a1a1a]">Welcome Back</h2>
        <p className="text-xs text-[#6b6b6b] mt-1">
          Enter credentials to access the Vigil Security Console
        </p>
      </div>

<<<<<<< HEAD
      {/* Success Notification (e.g. from signup redirect) */}
      {successMessage && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#e8f5e9] border border-[#a5d6a7] text-[#2e7d32] text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Alert Banner */}
      {error && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#ffebee] border border-[#ef9a9a] text-[#c62828] text-xs leading-relaxed animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Sign in failed: </span>
            {error}
          </div>
        </div>
      )}

=======
>>>>>>> e56e852f926bab241dfea2144d00ca88b574d79a
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Work Email"
          type="email"
          icon={Mail}
<<<<<<< HEAD
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          disabled={loading}
=======
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
>>>>>>> e56e852f926bab241dfea2144d00ca88b574d79a
        />

        <Input
          label="Password"
          type="password"
          icon={Lock}
<<<<<<< HEAD
          placeholder="Enter your security password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          disabled={loading}
=======
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
>>>>>>> e56e852f926bab241dfea2144d00ca88b574d79a
        />

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none text-[#6b6b6b]">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-[#e8e0d5] text-[#f5c9a8] focus:ring-[#f5c9a8]"
<<<<<<< HEAD
              disabled={loading}
=======
>>>>>>> e56e852f926bab241dfea2144d00ca88b574d79a
            />
            <span>Remember device</span>
          </label>

<<<<<<< HEAD
          <a
            href="#forgot-password"
            onClick={(e) => {
              e.preventDefault();
              alert("Password reset is managed by System Administrators.");
            }}
            className="font-semibold text-[#e8b48a] hover:underline"
          >
=======
          <a href="#" className="font-semibold text-[#e8b48a] hover:underline">
>>>>>>> e56e852f926bab241dfea2144d00ca88b574d79a
            Forgot password?
          </a>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={loading}
<<<<<<< HEAD
          icon={loading ? Loader2 : LogIn}
          className="mt-2 w-full font-semibold"
        >
          {loading ? "Authenticating Operator..." : "Sign In to Dashboard"}
=======
          icon={LogIn}
          className="mt-2 w-full"
        >
          {loading ? "Authenticating..." : "Sign In to Dashboard"}
>>>>>>> e56e852f926bab241dfea2144d00ca88b574d79a
        </Button>
      </form>

      <div className="text-center pt-2 text-xs text-[#6b6b6b]">
        Don't have an operator account?{" "}
        <Link
          to="/signup"
          className="font-bold text-[#1a1a1a] hover:underline"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
}
