"use client";
import React, { useEffect, useState } from "react";
import { config } from "@/data/config";
import Link from "next/link";
import { SiDiscord, SiSpotify } from "react-icons/si";
import { Gamepad2, Sparkles, Monitor, Smartphone, Globe } from "lucide-react";

export type DiscordStatusType = "online" | "idle" | "dnd" | "offline";

export interface LanyardData {
  discord_status: DiscordStatusType;
  activities?: Array<{
    name: string;
    state?: string;
    details?: string;
    type: number;
    emoji?: {
      name?: string;
      id?: string;
    };
    assets?: {
      large_image?: string;
      large_text?: string;
      small_image?: string;
      small_text?: string;
    };
    timestamps?: {
      start?: number;
      end?: number;
    };
  }>;
  discord_user?: {
    id: string;
    username: string;
    avatar: string;
    display_name?: string;
    global_name?: string;
    avatar_decoration_data?: {
      asset: string;
      sku_id: string;
    } | null;
    primary_guild?: {
      tag?: string;
      badge?: string;
      identity_guild_id?: string;
    } | null;
  };
  active_on_discord_web?: boolean;
  active_on_discord_desktop?: boolean;
  active_on_discord_mobile?: boolean;
  listening_to_spotify?: boolean;
  spotify?: {
    track_id: string;
    song: string;
    artist: string;
    album: string;
    album_art_url: string;
    timestamps?: {
      start: number;
      end: number;
    };
  } | null;
}

export const useLanyard = (userId: string) => {
  const [data, setData] = useState<LanyardData | null>(null);
  const [isMonitored, setIsMonitored] = useState<boolean>(true);

  useEffect(() => {
    if (!userId || !/^\d{17,20}$/.test(userId)) {
      setIsMonitored(false);
      return;
    }

    let isMounted = true;
    let ws: WebSocket | null = null;
    let heartbeatInterval: NodeJS.Timeout | null = null;

    // Fast initial REST fetch
    fetch(`https://api.lanyard.rest/v1/users/${userId}`)
      .then((res) => res.json())
      .then((json) => {
        if (!isMounted) return;
        if (json.success && json.data) {
          setData(json.data);
          setIsMonitored(true);
        } else {
          setIsMonitored(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsMonitored(false);
      });

    // Real-time WebSocket connection
    const connectWs = () => {
      try {
        ws = new WebSocket("wss://api.lanyard.rest/socket");

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);

            if (msg.op === 1) {
              // Hello -> Initialize subscription
              ws?.send(
                JSON.stringify({
                  op: 2,
                  d: { subscribe_to_id: userId },
                })
              );

              if (heartbeatInterval) clearInterval(heartbeatInterval);
              heartbeatInterval = setInterval(() => {
                if (ws?.readyState === WebSocket.OPEN) {
                  ws.send(JSON.stringify({ op: 3 }));
                }
              }, msg.d.heartbeat_interval);
            } else if (msg.op === 0) {
              if (msg.t === "INIT_STATE" || msg.t === "PRESENCE_UPDATE") {
                if (msg.d) {
                  setData(msg.d);
                  setIsMonitored(true);
                }
              }
            }
          } catch {
            // Ignore parse errors
          }
        };

        ws.onclose = () => {
          if (heartbeatInterval) clearInterval(heartbeatInterval);
        };

        ws.onerror = () => {
          ws?.close();
        };
      } catch {
        // Fallback gracefully
      }
    };

    connectWs();

    return () => {
      isMounted = false;
      if (ws) ws.close();
      if (heartbeatInterval) clearInterval(heartbeatInterval);
    };
  }, [userId]);

  return { data, isMonitored };
};

export function DiscordProfileCard({
  userId = (config as { discordUserId?: string }).discordUserId || "1372121943490170930",
}: {
  userId?: string;
}) {
  const { data: lanyard, isMonitored } = useLanyard(userId);
  const [spotifyProgress, setSpotifyProgress] = useState<number>(0);
  const [currentTimeFormatted, setCurrentTimeFormatted] = useState<string>("0:00");
  const [totalTimeFormatted, setTotalTimeFormatted] = useState<string>("0:00");

  const currentStatus: DiscordStatusType = isMonitored && lanyard
    ? lanyard.discord_status
    : "online";

  const isListeningSpotify = Boolean(lanyard?.listening_to_spotify && lanyard?.spotify);
  const gameOrApp = lanyard?.activities?.find((act) => act.type !== 4 && act.name !== "Spotify");
  const customStatus = lanyard?.activities?.find((act) => act.type === 4);

  // Live timer for Spotify progress
  useEffect(() => {
    if (!isListeningSpotify || !lanyard?.spotify?.timestamps) return;

    const { start, end } = lanyard.spotify.timestamps;
    const formatTime = (ms: number) => {
      const s = Math.floor(ms / 1000);
      const m = Math.floor(s / 60);
      const remS = s % 60;
      return `${m}:${remS < 10 ? "0" : ""}${remS}`;
    };

    const updateTimes = () => {
      const now = Date.now();
      const currentMs = Math.max(0, Math.min(end - start, now - start));
      const totalMs = Math.max(1, end - start);
      setSpotifyProgress(Math.min(100, (currentMs / totalMs) * 100));
      setCurrentTimeFormatted(formatTime(currentMs));
      setTotalTimeFormatted(formatTime(totalMs));
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, [isListeningSpotify, lanyard?.spotify]);

  const displayName =
    lanyard?.discord_user?.display_name ||
    lanyard?.discord_user?.global_name ||
    "Ansh";

  const username = lanyard?.discord_user?.username || "ansh9boss";
  const clanTag = lanyard?.discord_user?.primary_guild?.tag || "STRM";

  const avatarUrl = lanyard?.discord_user?.avatar
    ? `https://cdn.discordapp.com/avatars/${lanyard.discord_user.id}/${lanyard.discord_user.avatar}.png?size=256`
    : "/assets/discord-avatar.png";

  const decorationUrl = lanyard?.discord_user?.avatar_decoration_data?.asset
    ? `https://cdn.discordapp.com/avatar-decoration-presets/${lanyard.discord_user.avatar_decoration_data.asset}.png?size=256&passthrough=true`
    : "/assets/discord-decoration.png";

  return (
    <div className="w-full max-w-[360px] sm:max-w-[390px] rounded-[22px] bg-[#111214] border border-[#2b2d31]/90 shadow-2xl overflow-hidden font-sans text-white select-none transition-all duration-300 hover:border-[#5865F2]/40 hover:shadow-[0_12px_40px_rgba(88,101,242,0.18)]">
      {/* Banner */}
      <div className="h-24 sm:h-28 relative overflow-hidden bg-gradient-to-tr from-[#1e1f22] via-[#2b2d31] to-[#3a3c42]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#5865F2]/30 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <Link
            href="https://discord.com/users/ansh9boss"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/45 hover:bg-black/70 backdrop-blur-md text-[#dbdee1] hover:text-white border border-white/10 text-[11px] font-medium transition-all"
            title="Open Discord Profile"
          >
            <SiDiscord className="w-3.5 h-3.5 text-[#5865F2]" />
            <span>Profile</span>
          </Link>
        </div>
      </div>

      {/* Avatar Row */}
      <div className="-mt-11 sm:-mt-12 ml-4 flex items-end justify-between pr-4 relative z-10">
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0">
          {/* Base avatar image */}
          <div className="relative w-full h-full rounded-full border-[5px] border-[#111214] bg-[#2b2d31] overflow-hidden shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/assets/discord-avatar.png";
              }}
            />
          </div>

          {/* Discord animated avatar decoration */}
          {decorationUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={decorationUrl}
              alt="Avatar Decoration"
              className="absolute -top-[12%] -left-[12%] w-[124%] h-[124%] max-w-none pointer-events-none select-none z-10 drop-shadow-md"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          )}

          {/* Status Indicator Icon */}
          <div className="absolute bottom-0 right-0 z-20">
            {currentStatus === "online" && (
              <span
                className="block w-5 h-5 rounded-full bg-[#23a55a] border-[3px] border-[#111214]"
                title="Online"
              />
            )}
            {currentStatus === "idle" && (
              <span
                className="block w-5 h-5 rounded-full bg-[#f0b232] border-[3px] border-[#111214] relative overflow-hidden"
                title="Idle"
              >
                <span className="block w-2.5 h-2.5 rounded-full bg-[#111214] absolute -top-0.5 -left-0.5" />
              </span>
            )}
            {currentStatus === "dnd" && (
              <span
                className="w-5 h-5 rounded-full bg-[#f23f43] border-[3px] border-[#111214] flex items-center justify-center"
                title="Do Not Disturb"
              >
                <span className="w-2.5 h-[2.5px] bg-white rounded-full" />
              </span>
            )}
            {currentStatus === "offline" && (
              <span
                className="w-5 h-5 rounded-full bg-[#80848e] border-[3px] border-[#111214] flex items-center justify-center"
                title="Offline"
              >
                <span className="w-2 h-2 rounded-full bg-[#111214]" />
              </span>
            )}
          </div>
        </div>

        {/* Client presence badges (Desktop/Web/Mobile) */}
        <div className="flex items-center gap-1.5 pb-1 text-[#949ba4]">
          {lanyard?.active_on_discord_desktop && (
            <span
              className="p-1 rounded-md bg-[#2b2d31]/80 border border-[#35363c]"
              title="Active on Desktop"
            >
              <Monitor className="w-3.5 h-3.5 text-[#dbdee1]" />
            </span>
          )}
          {lanyard?.active_on_discord_web && (
            <span
              className="p-1 rounded-md bg-[#2b2d31]/80 border border-[#35363c]"
              title="Active on Web"
            >
              <Globe className="w-3.5 h-3.5 text-[#dbdee1]" />
            </span>
          )}
          {lanyard?.active_on_discord_mobile && (
            <span
              className="p-1 rounded-md bg-[#2b2d31]/80 border border-[#35363c]"
              title="Active on Mobile"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#dbdee1]" />
            </span>
          )}
        </div>
      </div>

      {/* Profile Details Container */}
      <div className="p-4 pt-2.5 space-y-3">
        {/* Username Header */}
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-lg text-white tracking-tight leading-tight">
              {displayName}
            </h3>
            {clanTag && (
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#2b2d31] text-[#dbdee1] border border-[#35363c] text-[10px] font-semibold tracking-wide"
                title="Discord Clan"
              >
                <Sparkles className="w-2.5 h-2.5 text-[#5865F2]" />
                {clanTag}
              </span>
            )}
          </div>
          <p className="text-xs text-[#949ba4] font-mono mt-0.5">@{username}</p>
        </div>

        {/* Custom Status */}
        {customStatus?.state && (
          <div className="py-1.5 px-3 rounded-xl bg-[#232428] border border-[#2b2d31] text-xs text-[#dbdee1] flex items-center gap-2">
            {customStatus.emoji?.name && <span>{customStatus.emoji.name}</span>}
            <span className="truncate">{customStatus.state}</span>
          </div>
        )}

        <div className="h-px bg-[#2b2d31]" />

        {/* About Me */}
        <div className="space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#949ba4]">
            About Me
          </div>
          <div className="text-xs text-[#dbdee1] leading-relaxed space-y-0.5">
            <p>
              Founder @ <span className="text-white font-semibold">Aerix Cloud</span>
            </p>
            <p>
              Creator @{" "}
              <span className="text-white font-semibold">Cheats Analyzer</span> &{" "}
              <span className="text-white font-semibold">VayuClient</span>
            </p>
            <p className="text-[#949ba4] text-[11px]">
              Websites, Android, Flutter, Windows & Mods
            </p>
          </div>
        </div>

        {/* Tags / Badges */}
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#2b2d31]/80 text-[#dbdee1] text-[10px] font-medium border border-[#35363c]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Founder
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#2b2d31]/80 text-[#dbdee1] text-[10px] font-medium border border-[#35363c]">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> Cloud & VPS
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#2b2d31]/80 text-[#dbdee1] text-[10px] font-medium border border-[#35363c]">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> Anti-Cheat
          </span>
        </div>

        {/* Real-time Activity: Spotify */}
        {isListeningSpotify && lanyard?.spotify && (
          <div className="p-3 rounded-xl bg-[#090a0c] border border-[#1f2023] space-y-2">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-[#1db954]">
              <span className="flex items-center gap-1.5">
                <SiSpotify className="w-3.5 h-3.5 text-[#1db954]" /> Listening to Spotify
              </span>
              <span className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 h-2 bg-[#1db954] animate-pulse" />
                <span className="w-0.5 h-3 bg-[#1db954] animate-pulse delay-75" />
                <span className="w-0.5 h-1.5 bg-[#1db954] animate-pulse delay-150" />
              </span>
            </div>
            <div className="flex items-center gap-3">
              {lanyard.spotify.album_art_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={lanyard.spotify.album_art_url}
                  alt={lanyard.spotify.album}
                  className="w-12 h-12 rounded-lg object-cover shrink-0 shadow-md"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate hover:underline">
                  {lanyard.spotify.song}
                </p>
                <p className="text-[11px] text-[#b5bac1] truncate">
                  by {lanyard.spotify.artist}
                </p>
                <p className="text-[10px] text-[#949ba4] truncate">
                  on {lanyard.spotify.album}
                </p>
              </div>
            </div>
            {lanyard.spotify.timestamps && (
              <div className="space-y-1 pt-0.5">
                <div className="w-full bg-[#2b2d31] h-1 rounded-full overflow-hidden">
                  <div
                    className="bg-[#1db954] h-full rounded-full transition-all duration-1000"
                    style={{ width: `${spotifyProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-[#949ba4] font-mono">
                  <span>{currentTimeFormatted}</span>
                  <span>{totalTimeFormatted}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Real-time Activity: Game or App */}
        {!isListeningSpotify && gameOrApp && (
          <div className="p-3 rounded-xl bg-[#090a0c] border border-[#1f2023] space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-[#b5bac1]">
              <Gamepad2 className="w-3.5 h-3.5 text-[#5865F2]" /> Playing a game
            </div>
            <p className="text-xs font-semibold text-white truncate">{gameOrApp.name}</p>
            {gameOrApp.details && (
              <p className="text-[11px] text-[#b5bac1] truncate">{gameOrApp.details}</p>
            )}
            {gameOrApp.state && (
              <p className="text-[10px] text-[#949ba4] truncate">{gameOrApp.state}</p>
            )}
          </div>
        )}

        {/* Direct Action Button */}
        <Link
          href="https://discord.com/users/ansh9boss"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full mt-1 bg-[#5865F2] hover:bg-[#4752c4] active:bg-[#3c45a5] text-white font-medium text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-indigo-500/25"
        >
          <SiDiscord className="w-4 h-4" /> Message @{username}
        </Link>
      </div>
    </div>
  );
}

export function DiscordStatusPill({
  userId = (config as { discordUserId?: string }).discordUserId || "1372121943490170930",
  showActivity = true,
}: {
  userId?: string;
  showActivity?: boolean;
}) {
  const { data: lanyard, isMonitored } = useLanyard(userId);

  const statusColors: Record<DiscordStatusType, string> = {
    online: "bg-emerald-500 shadow-emerald-500/50",
    idle: "bg-amber-500 shadow-amber-500/50",
    dnd: "bg-rose-500 shadow-rose-500/50",
    offline: "bg-zinc-500 shadow-zinc-500/50",
  };

  const statusLabels: Record<DiscordStatusType, string> = {
    online: "Online",
    idle: "Away",
    dnd: "Do Not Disturb",
    offline: "Offline",
  };

  const currentStatus: DiscordStatusType = isMonitored && lanyard
    ? lanyard.discord_status
    : "online";

  const colorClass = statusColors[currentStatus] || statusColors.online;
  const label = isMonitored && lanyard ? statusLabels[currentStatus] : "Available";

  const isListeningSpotify = lanyard?.listening_to_spotify && lanyard?.spotify;
  const gameOrApp = lanyard?.activities?.find((act) => act.type !== 4 && act.name !== "Spotify");
  const customStatus = lanyard?.activities?.find((act) => act.type === 4);

  let statusText = "@ansh9boss";
  if (isMonitored && lanyard) {
    if (currentStatus === "offline") {
      statusText = "Offline";
    } else if (isListeningSpotify && lanyard?.spotify) {
      statusText = `🎵 ${lanyard.spotify.song} — ${lanyard.spotify.artist}`;
    } else if (gameOrApp) {
      statusText = `${gameOrApp.name}${gameOrApp.details ? ` (${gameOrApp.details})` : ""}`;
    } else if (customStatus?.state) {
      statusText = `${customStatus.emoji?.name ? `${customStatus.emoji.name} ` : ""}${customStatus.state}`;
    } else {
      statusText = "Active on Discord";
    }
  } else {
    statusText = "Discord • @ansh9boss";
  }

  return (
    <Link
      href="https://discord.com/users/ansh9boss"
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-border/80 bg-secondary/40 hover:bg-secondary/70 hover:border-primary/40 backdrop-blur-md transition-all duration-200 text-xs shadow-sm"
      title="Chat on Discord (@ansh9boss)"
    >
      <div className="relative flex h-2.5 w-2.5">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${colorClass}`}
        />
        <span
          className={`relative inline-flex rounded-full h-2.5 w-2.5 ${colorClass.split(" ")[0]}`}
        />
      </div>

      <div className="flex items-center gap-1.5 font-mono">
        <SiDiscord className="w-3.5 h-3.5 text-[#5865F2]" />
        <span className="font-semibold text-foreground tracking-tight">
          {label}
        </span>
        {showActivity && statusText && (
          <>
            <span className="text-muted-foreground/60">•</span>
            <span
              className="text-muted-foreground group-hover:text-foreground text-[11px] truncate max-w-[140px] sm:max-w-[180px] transition-colors"
            >
              {statusText}
            </span>
          </>
        )}
      </div>
    </Link>
  );
}

export function DiscordStatusWidget({
  userId = (config as { discordUserId?: string }).discordUserId || "1372121943490170930",
  showActivity = true,
  variant = "card",
}: {
  userId?: string;
  showActivity?: boolean;
  variant?: "card" | "pill";
}) {
  if (variant === "pill") {
    return <DiscordStatusPill userId={userId} showActivity={showActivity} />;
  }
  return <DiscordProfileCard userId={userId} />;
}
