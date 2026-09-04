import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { User, Mail, Lock, ShieldCheck } from "lucide-react";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

export default function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("Operator");
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
        <h2 className="text-xl font-black text-[#1a1a1a]">Create Account</h2>
        <p className="text-xs text-[#6b6b6b] mt-1">
          Register as an operator for Vigil AI Smart Security
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <Input
          label="Full Name"
          type="text"
          icon={User}
          placeholder="e.g. Officer Somchai"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="Work Email"
          type="email"
          icon={Mail}
          placeholder="officer@organization.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#1a1a1a] uppercase tracking-wider">
            Operator Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full bg-white border border-[#e8e0d5] text-[#1a1a1a] text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-[#e8b48a] focus:ring-2 focus:ring-[#f5c9a8]/30"
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
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Input
          label="Confirm Password"
          type="password"
          icon={Lock}
          placeholder="Repeat password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={loading}
          icon={ShieldCheck}
          className="mt-2 w-full"
        >
          {loading ? "Registering..." : "Create Operator Profile"}
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
