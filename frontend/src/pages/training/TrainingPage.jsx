import React, { useState } from "react";
import { Link } from "react-router";
import {
  Search,
  UserPlus,
  Cpu,
  Terminal,
  Play,
  Pause,
  RotateCw,
  Flame,
} from "lucide-react";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import { initialPersons } from "../../mocks/mockPersons";
import { initialModelStats, initialGpuLogs } from "../../mocks/mockModelStats";

export default function TrainingPage() {
  const [persons] = useState(initialPersons);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [logs, setLogs] = useState(initialGpuLogs);
  const [isTraining, setIsTraining] = useState(true);

  const roles = ["ALL", "Employee", "Family", "Visitor", "VIP", "Blacklist"];

  // Filter persons
  const filteredPersons = persons.filter((person) => {
    const matchesSearch =
      person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole =
      selectedRole === "ALL" ||
      person.role.toLowerCase() === selectedRole.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const handleToggleTraining = () => {
    if (isTraining) {
      setLogs((prev) => [
        ...prev,
        `[TRAINER] Paused by user at ${new Date().toLocaleTimeString()}... Checkpoint saved.`,
      ]);
      setIsTraining(false);
    } else {
      setLogs((prev) => [
        ...prev,
        `[TRAINER] Resumed training. Allocating GPU CUDA kernels at ${new Date().toLocaleTimeString()}...`,
      ]);
      setIsTraining(true);
    }
  };

  const handleRetrain = () => {
    setLogs((prev) => [
      ...prev,
      `[RETRAIN] Full pipeline trigger: Reloading 1,248 dataset images...`,
      `[RETRAIN] Fine-tuning YOLOv8n-face arcface backbone...`,
      `[EPOCH 43/50] Box Loss: 0.0189 | Cls Loss: 0.0142 | mAP50: 0.967`,
    ]);
  };

  return (
    <div className="flex flex-col gap-8 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1a1a1a] tracking-tight">
            AI Model & Person Database
          </h1>
          <p className="text-xs sm:text-sm text-[#6b6b6b]">
            Manage facial recognition identities and monitor YOLOv8 GPU training metrics
          </p>
        </div>

        <Link to="/add-person">
          <Button icon={UserPlus} size="md">
            Register New Person
          </Button>
        </Link>
      </div>

      {/* Model Performance & GPU Terminal Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model Metrics Card (1 Col) */}
        <div className="bg-white rounded-3xl p-6 border border-[#e8e0d5] shadow-xs flex flex-col justify-between gap-5">
          <div className="flex items-center justify-between border-b border-[#e8e0d5] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#f5c9a8] flex items-center justify-center text-[#1a1a1a]">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1a1a1a]">
                  {initialModelStats.modelName}
                </h3>
                <span className="text-[11px] text-[#6b6b6b]">
                  Backbone: ArcFace 512D
                </span>
              </div>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isTraining
                  ? "bg-[#e8f5e9] text-[#2e7d32] border-[#a5d6a7]"
                  : "bg-[#fff8e1] text-[#f57f17] border-[#ffe082]"
              }`}
            >
              {isTraining ? "TRAINING ACTIVE" : "PAUSED"}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[#6b6b6b]">
                Epoch {initialModelStats.currentEpoch} of {initialModelStats.totalEpochs}
              </span>
              <span className="text-[#1a1a1a] font-bold">
                {initialModelStats.progressPercent}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-[#f7f1e9] rounded-full overflow-hidden border border-[#e8e0d5]">
              <div
                className="h-full bg-gradient-to-r from-[#f5c9a8] to-[#e8b48a] rounded-full transition-all duration-500"
                style={{ width: `${initialModelStats.progressPercent}%` }}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-[#f7f1e9]/60 border border-[#e8e0d5]">
              <span className="text-[#6b6b6b] text-[11px] block">mAP @ 0.5 Score</span>
              <strong className="text-base text-[#2e7d32] font-black">
                {initialModelStats.mapScore}
              </strong>
            </div>

            <div className="p-3 rounded-2xl bg-[#f7f1e9]/60 border border-[#e8e0d5]">
              <span className="text-[#6b6b6b] text-[11px] block">Current Loss</span>
              <strong className="text-base text-[#1a1a1a] font-black">
                {initialModelStats.loss}
              </strong>
            </div>

            <div className="p-3 rounded-2xl bg-[#f7f1e9]/60 border border-[#e8e0d5]">
              <span className="text-[#6b6b6b] text-[11px] block">Dataset Size</span>
              <strong className="text-sm text-[#1a1a1a] font-bold">
                {initialModelStats.datasetSize}
              </strong>
            </div>

            <div className="p-3 rounded-2xl bg-[#f7f1e9]/60 border border-[#e8e0d5]">
              <span className="text-[#6b6b6b] text-[11px] block">Inference Speed</span>
              <strong className="text-sm text-[#26a69a] font-bold">
                {initialModelStats.fpsInference}
              </strong>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-[#6b6b6b] flex items-center gap-2">
            <Flame className="w-3.5 h-3.5 text-[#e65100]" />
            <span>GPU: {initialModelStats.gpuDevice} ({initialModelStats.gpuTemperature})</span>
          </div>
        </div>

        {/* GPU Terminal Console (2 Cols) */}
        <div className="lg:col-span-2 bg-[#141414] rounded-3xl p-5 border border-neutral-800 shadow-xl flex flex-col justify-between text-neutral-200">
          {/* Terminal Top Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#f5c9a8]" />
              <span className="text-xs font-mono font-bold tracking-wider text-neutral-300">
                GPU CONSOLE — NVIDIA CUDA OUTPUT
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleTraining}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors"
              >
                {isTraining ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-green-400" />
                    <span>Resume</span>
                  </>
                )}
              </button>

              <button
                onClick={handleRetrain}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5 text-[#f5c9a8]" />
                <span>Retrain</span>
              </button>
            </div>
          </div>

          {/* Console Output Body */}
          <div className="my-3 font-mono text-xs text-neutral-300 space-y-1.5 overflow-y-auto max-h-[220px] terminal-scroll pr-2">
            {logs.map((log, index) => (
              <div key={index} className="leading-relaxed">
                {log.startsWith("[EPOCH") ? (
                  <span className="text-[#f5c9a8] font-bold">{log}</span>
                ) : log.includes("Loss:") ? (
                  <span className="text-emerald-400">{log}</span>
                ) : log.startsWith("[SYSTEM") ? (
                  <span className="text-cyan-400">{log}</span>
                ) : (
                  <span className="text-neutral-400">{log}</span>
                )}
              </div>
            ))}
          </div>

          {/* Terminal Status */}
          <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-[11px] font-mono text-neutral-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>PyTorch 2.3 + CUDA 12.1 Ready</span>
            </div>
            <span>VRAM: 8.2 / 12 GB</span>
          </div>
        </div>
      </div>

      {/* Person Database Section */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-[#1a1a1a]">
              Registered Identities ({filteredPersons.length})
            </h2>
            <p className="text-xs text-[#6b6b6b]">
              Classified profiles recognized by the face recognition model
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#6b6b6b] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#e8e0d5] text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-[#e8b48a] focus:ring-2 focus:ring-[#f5c9a8]/30 transition-all"
            />
          </div>
        </div>

        {/* Filter Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {roles.map((role) => {
            const active = selectedRole === role;
            return (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap ${
                  active
                    ? "bg-[#f5c9a8] text-[#1a1a1a] border border-[#e8b48a] shadow-xs"
                    : "bg-white text-[#6b6b6b] border border-[#e8e0d5] hover:bg-[#f7f1e9]"
                }`}
              >
                {role}
              </button>
            );
          })}
        </div>

        {/* People Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredPersons.map((person) => (
            <div
              key={person.id}
              className="bg-white rounded-3xl p-5 border border-[#e8e0d5] shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4 group"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#f7f1e9] border border-[#e8e0d5] flex items-center justify-center font-bold text-sm text-[#1a1a1a] shadow-2xs group-hover:scale-105 transition-transform">
                  {person.avatar}
                </div>
                <Badge variant={person.role}>{person.role}</Badge>
              </div>

              <div>
                <h4 className="text-sm font-bold text-[#1a1a1a] group-hover:text-[#e8b48a] transition-colors">
                  {person.name}
                </h4>
                <span className="text-xs text-[#6b6b6b] block">
                  {person.department}
                </span>
                <p className="text-[11px] text-[#6b6b6b] mt-2 line-clamp-2 italic">
                  "{person.notes}"
                </p>
              </div>

              <div className="pt-3 border-t border-[#e8e0d5] flex items-center justify-between text-xs">
                <span className="text-[#6b6b6b]">
                  Dataset: <strong className="text-[#1a1a1a]">{person.imagesCount} pics</strong>
                </span>
                <span className="font-bold text-[#2e7d32]">
                  {person.accuracy}% Acc
                </span>
              </div>
            </div>
          ))}

          {filteredPersons.length === 0 && (
            <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-dashed border-[#e8e0d5]">
              <p className="text-sm font-semibold text-[#6b6b6b]">
                No identities found matching "{searchQuery}"
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedRole("ALL");
                }}
                className="mt-3"
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
