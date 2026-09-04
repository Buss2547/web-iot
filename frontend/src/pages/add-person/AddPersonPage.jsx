import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router";
import {
  UserPlus,
  UploadCloud,
  Camera,
  Trash2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { Input, Textarea } from "../../components/common/Input";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";

export default function AddPersonPage() {
  const navigate = useNavigate();

  // Form State
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("Employee");
  const [department, setDepartment] = useState("");
  const [notes, setNotes] = useState("");
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Webcam Modal State
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [webcamError, setWebcamError] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const roles = ["Employee", "Family", "Visitor", "VIP", "Blacklist"];
  const minRecommendedImages = 15;

  // Handle Drag & Drop / File Input
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newImageUrls = files.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      name: file.name,
      url: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImageUrls]);
  };

  const removeImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  // Open Webcam
  const startWebcam = async () => {
    setIsWebcamOpen(true);
    setWebcamError("");
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);
      } else {
        setWebcamError("Camera API not supported in this browser. Simulated mode ready.");
      }
    } catch (err) {
      console.warn("Webcam access error:", err);
      setWebcamError("Could not access physical webcam. Using simulated snapshot instead.");
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setIsWebcamOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && cameraActive) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg");
      setImages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          name: `webcam_snap_${Date.now()}.jpg`,
          url: dataUrl,
        },
      ]);
    } else {
      // Fallback simulated capture
      const fallbackUrl =
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80";
      setImages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          name: `simulated_capture_${Date.now()}.jpg`,
          url: fallbackUrl,
        },
      ]);
    }
  };

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!fullName.trim()) newErrors.fullName = "Full name is required";
    if (images.length === 0)
      newErrors.images = "Please upload at least 1 image for facial embeddings";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      navigate("/training");
    }, 1000);
  };

  const progress = Math.min(
    100,
    Math.round((images.length / minRecommendedImages) * 100)
  );

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 py-2">
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <Link
            to="/training"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Database
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1a1a1a] tracking-tight">
            Register New Identity
          </h1>
          <p className="text-xs sm:text-sm text-[#6b6b6b]">
            Enrolls face dataset into the YOLOv8 and ArcFace vector embedding index
          </p>
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {/* Section 1: Personal Details */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8e0d5] shadow-xs flex flex-col gap-6">
          <div className="flex items-center gap-2 pb-3 border-b border-[#e8e0d5]">
            <div className="w-8 h-8 rounded-xl bg-[#f5c9a8] flex items-center justify-center text-[#1a1a1a]">
              <UserPlus className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-[#1a1a1a]">
              1. Identity Information
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Full Name *"
              placeholder="e.g. Somsak Jaidee"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setErrors((prev) => ({ ...prev, fullName: null }));
              }}
              error={errors.fullName}
            />

            <Input
              label="Department / Affiliation"
              placeholder="e.g. Engineering, Executive Board, Contractor"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>

          {/* Role / Category Tags */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-[#1a1a1a] uppercase tracking-wider">
              Category / Access Level *
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {roles.map((r) => {
                const active = role === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                      active
                        ? "bg-[#f5c9a8] text-[#1a1a1a] border border-[#e8b48a] shadow-xs scale-105"
                        : "bg-[#f7f1e9] text-[#6b6b6b] border border-[#e8e0d5] hover:bg-white"
                    }`}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>

          <Textarea
            label="Security Clearance Notes"
            placeholder="e.g. Granted entrance during office hours, notify supervisor when entering Server Room..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </div>

        {/* Section 2: Face Dataset Upload & Webcam */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8e0d5] shadow-xs flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e8e0d5]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#e0f2f1] flex items-center justify-center text-[#26a69a]">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1a1a1a]">
                  2. Face Dataset Images ({images.length})
                </h3>
                <span className="text-xs text-[#6b6b6b]">
                  Minimum recommended: 15 photos for 98%+ recognition accuracy
                </span>
              </div>
            </div>

            {/* Progress Bar Badge */}
            <div className="flex items-center gap-3">
              <div className="w-32 h-2.5 bg-[#f7f1e9] rounded-full overflow-hidden border border-[#e8e0d5]">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    progress >= 100 ? "bg-[#2e7d32]" : "bg-[#f5c9a8]"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-bold text-[#1a1a1a]">
                {images.length}/15
              </span>
            </div>
          </div>

          {/* Action Tools: Dropzone + Live Webcam Button */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dropzone */}
            <label className="relative border-2 border-dashed border-[#e8e0d5] hover:border-[#e8b48a] rounded-3xl p-6 flex flex-col items-center justify-center gap-3 bg-[#f7f1e9]/40 hover:bg-[#f7f1e9] transition-all cursor-pointer group">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="sr-only"
              />
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#e8e0d5] flex items-center justify-center text-[#6b6b6b] group-hover:text-[#e8b48a] group-hover:scale-105 transition-all shadow-xs">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="text-center">
                <span className="text-xs font-bold text-[#1a1a1a] block">
                  Click or Drag & Drop face photos
                </span>
                <span className="text-[11px] text-[#6b6b6b]">
                  Supports JPG, PNG, WEBP (Batch upload)
                </span>
              </div>
            </label>

            {/* Live Camera Button */}
            <div className="border border-[#e8e0d5] rounded-3xl p-6 flex flex-col items-center justify-center gap-3 bg-white hover:bg-[#f7f1e9]/40 transition-all text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#f5c9a8]/30 border border-[#e8b48a]/50 flex items-center justify-center text-[#1a1a1a] shadow-xs">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#1a1a1a] block">
                  Live Webcam Capture
                </span>
                <span className="text-[11px] text-[#6b6b6b]">
                  Take snapshots directly via your connected webcam
                </span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={startWebcam}
                icon={Camera}
              >
                Open Camera
              </Button>
            </div>
          </div>

          {errors.images && (
            <div className="text-xs text-[#c62828] font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.images}</span>
            </div>
          )}

          {/* Uploaded Images Thumbnails Grid */}
          {images.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-[#1a1a1a]">
                Uploaded Photos Preview ({images.length})
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-3">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="group relative aspect-square rounded-2xl overflow-hidden border border-[#e8e0d5] bg-neutral-100 shadow-2xs"
                  >
                    <img
                      src={img.url}
                      alt={img.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(img.id)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                    >
                      <Trash2 className="w-5 h-5 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate("/training")}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isSubmitting}
            icon={Sparkles}
          >
            {isSubmitting ? "Enrolling..." : "Save & Start Training"}
          </Button>
        </div>
      </form>

      {/* Live Webcam Modal */}
      <Modal
        isOpen={isWebcamOpen}
        onClose={stopWebcam}
        title="Live Webcam Capture Simulator"
      >
        <div className="flex flex-col gap-4">
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-4/3 flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${
                cameraActive ? "block" : "hidden"
              }`}
            />

            {!cameraActive && (
              <div className="p-6 text-center text-white flex flex-col items-center gap-3">
                <Camera className="w-12 h-12 text-[#f5c9a8]" />
                <span className="text-xs font-mono text-neutral-300">
                  {webcamError || "Camera starting..."}
                </span>
                <span className="text-[11px] text-neutral-400">
                  You can still press "Capture Photo" to add test sample images!
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <span className="text-xs text-[#6b6b6b]">
              Current session: <strong>{images.length}</strong> photos in dataset
            </span>

            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={stopWebcam}>
                Done
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={capturePhoto}
                icon={Camera}
              >
                Capture Photo
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
