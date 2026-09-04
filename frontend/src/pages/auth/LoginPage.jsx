import React, { useState } from "react";
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
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-xl font-black text-[#1a1a1a]">Welcome Back</h2>
        <p className="text-xs text-[#6b6b6b] mt-1">
          Enter credentials to access the Vigil Security Console
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Work Email"
          type="email"
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Password"
          type="password"
          icon={Lock}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none text-[#6b6b6b]">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-[#e8e0d5] text-[#f5c9a8] focus:ring-[#f5c9a8]"
            />
            <span>Remember device</span>
          </label>

          <a href="#" className="font-semibold text-[#e8b48a] hover:underline">
            Forgot password?
          </a>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={loading}
          icon={LogIn}
          className="mt-2 w-full"
        >
          {loading ? "Authenticating..." : "Sign In to Dashboard"}
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
