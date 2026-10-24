"use client";

import React from "react";
import SectionWrapper from "../ui/section-wrapper";
import { SectionHeader } from "./section-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Server, ShieldCheck, Cpu, Globe, ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

const PILLARS = [
  {
    icon: <Server className="w-6 h-6 text-sky-400" />,
    title: "Cloud & Server Hosting",
    role: "Founder, Aerix Cloud",
    description:
      "I run Aerix Cloud, providing game servers and VPS hosting. I set up automated provisioning so when someone buys a server, it spins up in a Docker container and is ready in under 10 seconds.",
    tags: ["Docker", "WHMCS APIs", "Pterodactyl", "Linux", "Nginx"],
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
    title: "Game Security & Anti-Cheat",
    role: "Creator, Cheats Analyzer",
    description:
      "I built Cheats Analyzer, a cross-platform anti-cheat tool that runs on desktop and Android to inspect running memory for injected cheats, paired with a custom server plugin to catch combat hacks in real time.",
    tags: ["Android", "Java NMS", "Netty", "Electron", "Memory Scanning"],
  },
  {
    icon: <Cpu className="w-6 h-6 text-indigo-400" />,
    title: "AI Tools & Scripts",
    role: "Creator, Skript Builder AI",
    description:
      "I built an AI tool that helps server owners generate and debug Minecraft scripts without spending hours fixing confusing syntax errors.",
    tags: ["Vercel AI SDK", "Python", "AST Parsing", "Next.js"],
  },
  {
    icon: <Globe className="w-6 h-6 text-amber-400" />,
    title: "Websites, Apps, Mods & Plugins",
    role: "Full-Stack & Systems Developer",
    description:
      "I build websites, Android apps, Flutter and Windows apps, alongside VayuClient (Minecraft launcher), 100+ Discord bots, and lots of custom game mods, plugins, and server configs.",
    tags: ["Websites", "Android", "Flutter", "Windows Apps", "Mods & Plugins", "Discord.js"],
  },
];

const AboutSection = () => {
  return (
    <SectionWrapper id="about" className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
      <SectionHeader
        id="about"
        title="About me"
        desc="A bit about what I do and what I enjoy working on"
        className="mb-14"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PILLARS.map((pillar, index) => (
          <motion.div
            key={pillar.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="h-full bg-card/80 border-border/80 hover:border-primary/30 transition-all duration-300 hover:shadow-lg backdrop-blur-sm flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="p-3 rounded-xl bg-secondary/50 border border-border/60">
                    {pillar.icon}
                  </div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground px-2.5 py-1 rounded-full bg-secondary/30 border border-border/40">
                    {pillar.role}
                  </span>
                </div>
                <CardTitle className="text-xl font-bold tracking-tight text-foreground mt-4">
                  {pillar.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4 pt-1">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {pillar.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {pillar.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-secondary/60 text-foreground/80 border border-border/40"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Callout Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-12 p-6 sm:p-8 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-secondary/20 to-transparent flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
      >
        <div className="space-y-1 max-w-2xl">
          <h4 className="text-base sm:text-lg font-bold text-foreground">
            Have a project in mind?
          </h4>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Whether you need a custom web app, server automation, or game tools, feel free to reach out.
          </p>
        </div>
        <Link href="#contact" className="shrink-0">
          <button className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-sm">
            Send me a message <ArrowUpRight className="w-4 h-4" />
          </button>
        </Link>
      </motion.div>
    </SectionWrapper>
  );
};

export default AboutSection;
