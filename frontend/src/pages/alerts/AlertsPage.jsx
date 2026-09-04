import React, { useState } from "react";
import {
  Bell,
  CheckCircle,
  CheckCheck,
  MapPin,
  Clock,
} from "lucide-react";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import { initialAlerts } from "../../mocks/mockAlerts";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [filterMode, setFilterMode] = useState("ALL"); // 'ALL' or 'UNREAD'

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  const filteredAlerts = alerts.filter((alert) => {
    if (filterMode === "UNREAD") return !alert.isRead;
    return true;
  });

  const toggleReadStatus = (id) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isRead: !a.isRead } : a))
    );
  };

  const markAllAsRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-[#1a1a1a] tracking-tight">
              Security Alerts
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#c62828] text-white">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#6b6b6b]">
            Intrusion logs, blacklist alerts, and edge IoT system telemetry events
          </p>
        </div>

        {/* Filter Controls & Mark Read Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center p-1 rounded-xl bg-white border border-[#e8e0d5] text-xs font-semibold">
            <button
              onClick={() => setFilterMode("ALL")}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                filterMode === "ALL"
                  ? "bg-[#f5c9a8] text-[#1a1a1a] shadow-xs"
                  : "text-[#6b6b6b] hover:text-[#1a1a1a]"
              }`}
            >
              All ({alerts.length})
            </button>
            <button
              onClick={() => setFilterMode("UNREAD")}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                filterMode === "UNREAD"
                  ? "bg-[#f5c9a8] text-[#1a1a1a] shadow-xs"
                  : "text-[#6b6b6b] hover:text-[#1a1a1a]"
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={markAllAsRead}
              icon={CheckCheck}
            >
              <span className="hidden sm:inline">Mark all read</span>
            </Button>
          )}
        </div>
      </div>

      {/* Alerts List */}
      <div className="flex flex-col gap-3">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            onClick={() => toggleReadStatus(alert.id)}
            className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 select-none ${
              !alert.isRead
                ? "bg-white border-[#e8b48a] shadow-sm hover:shadow-md"
                : "bg-white/60 border-[#e8e0d5] opacity-80 hover:opacity-100 hover:bg-white"
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Snapshot / Avatar */}
              {alert.thumbnail ? (
                <img
                  src={alert.thumbnail}
                  alt={alert.title}
                  className="w-14 h-14 rounded-2xl object-cover border border-[#e8e0d5] shrink-0 shadow-2xs"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-[#f7f1e9] border border-[#e8e0d5] flex items-center justify-center text-[#6b6b6b] shrink-0">
                  <Bell className="w-6 h-6 text-[#e8b48a]" />
                </div>
              )}

              {/* Text Info */}
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={alert.severity}>{alert.severity}</Badge>
                  <h3 className="text-sm font-bold text-[#1a1a1a]">
                    {alert.title}
                  </h3>
                  {!alert.isRead && (
                    <span className="w-2 h-2 rounded-full bg-[#c62828] animate-pulse" />
                  )}
                </div>

                <p className="text-xs text-[#6b6b6b] leading-relaxed">
                  {alert.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-[#6b6b6b]">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#26a69a]" />
                    {alert.location}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#6b6b6b]" />
                    {alert.timestamp} ({alert.timeRaw})
                  </span>
                </div>
              </div>
            </div>

            {/* Right Action / Status */}
            <div className="self-end sm:self-center flex sm:flex-col items-end gap-1 shrink-0">
              <span className="text-[11px] text-[#6b6b6b] font-medium hidden sm:inline">
                {alert.isRead ? "Click to mark unread" : "Click to mark read"}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                  alert.isRead
                    ? "bg-[#f7f1e9] text-[#6b6b6b] border-[#e8e0d5]"
                    : "bg-[#e8f5e9] text-[#2e7d32] border-[#a5d6a7]"
                }`}
              >
                {alert.isRead ? "Acknowledged" : "New Action Req."}
              </span>
            </div>
          </div>
        ))}

        {filteredAlerts.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-[#e8e0d5]">
            <CheckCircle className="w-10 h-10 text-[#2e7d32] mx-auto mb-2" />
            <p className="text-sm font-bold text-[#1a1a1a]">
              All caught up! No alerts in this view.
            </p>
            <span className="text-xs text-[#6b6b6b]">
              Your IoT security perimeter is fully secure.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
