"use client";

import type { CSSProperties } from "react";
import React, { useState } from "react";
import SectionWrapper from "../ui/section-wrapper";
import { SectionHeader } from "./section-header";
import { SKILLS, Skill } from "@/data/constants";
import { usePerfProfile } from "@/hooks/use-perf-profile";
import { cn } from "@/lib/utils";
import { Keyboard, Layers, Terminal, Sparkles } from "lucide-react";

const CATEGORIES = {
  Systems: ["linux", "docker", "nginx", "aws", "gcp"],
  Backend: ["nodejs", "express", "postgres", "mongodb", "firebase"],
  Frontend: ["nextjs", "react", "ts", "js", "tailwind", "html", "css", "vue"],
  Tooling: ["git", "github", "npm", "vim", "vercel", "prettier", "wordpress"],
};

const SkillsSection = () => {
  const { disable3D, ready } = usePerfProfile();
  const showFallbackGrid = ready && disable3D;
  const [activeTab, setActiveTab] = useState<string>("all");

  const allSkills = Object.values(SKILLS);
  const filteredSkills =
    activeTab === "all"
      ? allSkills
      : allSkills.filter((s) =>
          CATEGORIES[activeTab as keyof typeof CATEGORIES]?.includes(s.name)
        );

  return (
    <SectionWrapper id="skills" className="w-full relative z-10 py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          id="skills"
          title="What I use"
          desc="The tools, languages, and technologies I work with regularly"
          className="mb-8"
        />

        {/* 3D Keyboard Interactive Helper Banner (Only if 3D is active) */}
        {!showFallbackGrid && (
          <div className="mb-12 pointer-events-auto max-w-xl mx-auto text-center p-3 sm:p-4 rounded-2xl border border-primary/20 bg-secondary/30 backdrop-blur-md">
            <p className="text-xs sm:text-sm text-foreground flex items-center justify-center gap-2 font-mono">
              <Keyboard className="w-4 h-4 text-primary animate-pulse" />
              <span>Interactive keyboard — press keys or type to hear the switches</span>
            </p>
          </div>
        )}

        {/* 3D Scrub buffer space on desktop to let ScrollTrigger scrub the keyboard */}
        {!showFallbackGrid && (
          <div className="w-full h-[30vh] md:h-[45vh] pointer-events-none" aria-hidden="true" />
        )}

        {/* Categorized Filter Tabs */}
        <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2 mb-10">
          {["all", "Systems", "Backend", "Frontend", "Tooling"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-mono transition-all duration-200 capitalize",
                activeTab === tab
                  ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                  : "bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary/70 border border-border/40"
              )}
            >
              {tab === "all" ? "All" : tab}
            </button>
          ))}
        </div>

        {/* Responsive Skill Cards Grid */}
        <ul className="pointer-events-auto mx-auto grid w-full max-w-6xl grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
          {filteredSkills.map((skill) => (
            <li
              key={skill.name}
              style={{ "--skill": skill.color } as CSSProperties}
              className={cn(
                "group relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl p-4 sm:p-5 text-center",
                "border border-border/70 bg-card/70 backdrop-blur-md",
                "transition-all duration-300",
                "hover:-translate-y-1 hover:border-[var(--skill)] hover:bg-card/90",
                "hover:shadow-[0_10px_35px_-12px_var(--skill)]"
              )}
            >
              <span
                aria-hidden
                style={{ background: skill.color }}
                className="pointer-events-none absolute -top-8 h-20 w-20 rounded-full opacity-20 blur-2xl transition-opacity duration-300 group-hover:opacity-75"
              />

              <div className="relative size-10 md:size-12 flex items-center justify-center p-1.5 rounded-xl bg-secondary/40 border border-border/40 group-hover:scale-110 transition-transform duration-300">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={skill.icon}
                  alt={skill.label}
                  width={40}
                  height={40}
                  loading="lazy"
                  className="size-7 md:size-8 object-contain drop-shadow-sm"
                />
              </div>

              <div className="space-y-1 w-full">
                <span className="block text-xs md:text-sm font-bold text-foreground tracking-tight">
                  {skill.label}
                </span>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground line-clamp-2 font-mono leading-tight px-1">
                  {skill.shortDescription}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </SectionWrapper>
  );
};

export default SkillsSection;
