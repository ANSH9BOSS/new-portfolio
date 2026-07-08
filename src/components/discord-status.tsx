"use client";
import React, { useEffect, useState } from "react";

export type DiscordStatusType = "online" | "idle" | "dnd" | "offline";

export interface LanyardData {
  discord_status: DiscordStatusType;
  activities: Array<{
    name: string;
    state?: string;
    details?: string;
    type: number;
  }>;
}

export const useLanyard = (userId: string) => {
  const [data, setData] = useState<LanyardData | null>(null);

  useEffect(() => {
    let ws: WebSocket;
    let heartbeatInterval: NodeJS.Timeout;

    const connect = () => {
      try {
        ws = new WebSocket("wss://api.lanyard.rest/socket");

        ws.onmessage = (event) => {
          const msg = JSON.parse(event.data);
          
          if (msg.op === 1) { // Hello
            ws.send(JSON.stringify({
              op: 2,
              d: { subscribe_to_id: userId }
            }));

            heartbeatInterval = setInterval(() => {
              ws.send(JSON.stringify({ op: 3 }));
            }, msg.d.heartbeat_interval);
          } else if (msg.op === 0) { // Event
            if (msg.t === "INIT_STATE" || msg.t === "PRESENCE_UPDATE") {
              setData(msg.d);
            }
          }
        };

        ws.onclose = () => {
          clearInterval(heartbeatInterval);
          setTimeout(connect, 5000); // Reconnect
        };
        
        ws.onerror = () => {
          ws.close();
        };
      } catch (err) {
        console.error("Lanyard WS error:", err);
      }
    };

    connect();

    return () => {
      if (ws) ws.close();
      clearInterval(heartbeatInterval);
    };
  }, [userId]);

  return data;
};

export function DiscordStatusWidget({ userId = "238627786", showActivity = true }: { userId?: string, showActivity?: boolean }) {
  const lanyard = useLanyard(userId);

  if (!lanyard) {
    // SSR or loading fallback
    return (
      <div className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-800 rounded-full px-4 py-1.5 w-fit text-sm backdrop-blur-md">
        <div className="flex h-3.5 w-3.5 rounded-full bg-zinc-700/60 animate-pulse" />
        <div className="flex flex-col gap-1">
          <div className="h-3 w-16 bg-zinc-850 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  const statusColors = {
    online: "bg-emerald-500 shadow-emerald-500/50",
    idle: "bg-amber-500 shadow-amber-500/50",
    dnd: "bg-rose-500 shadow-rose-500/50",
    offline: "bg-zinc-500 shadow-zinc-500/50",
  };

  const statusLabels = {
    online: "Online",
    idle: "Idle",
    dnd: "Do Not Disturb",
    offline: "Offline",
  };

  const currentStatus = lanyard.discord_status || "offline";
  const colorClass = statusColors[currentStatus] || statusColors.offline;
  const label = statusLabels[currentStatus] || statusLabels.offline;

  // Find active IDE, game, or custom status
  const mainActivity = lanyard.activities?.find(act => act.type !== 4);
  const customStatus = lanyard.activities?.find(act => act.type === 4);

  let statusText = "";
  if (mainActivity) {
    statusText = `${mainActivity.name}${mainActivity.details ? ` - ${mainActivity.details}` : ""}`;
  } else if (customStatus) {
    statusText = customStatus.state || "";
  } else if (currentStatus !== "offline") {
    statusText = "Active / Available";
  } else {
    statusText = "Offline";
  }

  return (
    <div className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-800 rounded-full px-4 py-1.5 w-fit text-sm backdrop-blur-md">
      <div className="relative flex h-3.5 w-3.5">
        {currentStatus !== "offline" && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${colorClass}`} />
        )}
        <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${colorClass.split(" ")[0]}`} />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-white text-xs tracking-wider uppercase font-mono">{label}</span>
        </div>
        {showActivity && statusText && (
          <span className="text-zinc-400 text-[10px] truncate max-w-[200px]" title={statusText}>
            {statusText}
          </span>
        )}
      </div>
    </div>
  );
}
