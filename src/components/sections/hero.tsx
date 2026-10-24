import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import { Mail, ArrowRight, Terminal, Shield, Server } from "lucide-react";
import { usePreloader } from "../preloader";
import { BlurIn, BoxReveal } from "../reveal-animations";
import ScrollDownIcon from "../scroll-down-icon";
import { SiDiscord, SiGithub } from "react-icons/si";
import { config } from "@/data/config";
import { DiscordStatusWidget } from "../discord-status";
import SectionWrapper from "../ui/section-wrapper";

const HeroSection = () => {
  const { isLoading } = usePreloader();

  return (
    <SectionWrapper id="hero" className={cn("relative w-full min-h-screen")}>
      <div className="grid md:grid-cols-2 w-full">
        <div
          className={cn(
            "min-h-[calc(100dvh-3rem)] md:min-h-[calc(100dvh-4rem)] z-[2]",
            "col-span-1",
            "flex flex-col justify-center items-start",
            "pt-24 pb-16 px-6 sm:px-10 md:p-16 lg:p-20 xl:p-24"
          )}
        >
          {!isLoading && (
            <div className="flex flex-col max-w-xl">
              <div>
                <BlurIn delay={0.4}>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-mono mb-4">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Available for work
                  </div>
                </BlurIn>

                <BlurIn delay={0.6}>
                  <p className="font-medium text-sm sm:text-base text-slate-500 dark:text-zinc-400 font-mono tracking-wide">
                    Ansh Kumar
                  </p>
                </BlurIn>

                <BlurIn delay={0.8}>
                  <h1
                    className={cn(
                      "-ml-[4px] leading-tight text-transparent text-slate-900 dark:text-white text-left",
                      "font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl",
                      "tracking-tight font-display mb-2"
                    )}
                  >
                    {config.author}
                  </h1>
                </BlurIn>

                <BlurIn delay={1.0}>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 bg-clip-text text-transparent">
                    Developer & Builder
                  </h2>
                </BlurIn>

                <BlurIn delay={1.2}>
                  <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-zinc-400 leading-relaxed font-sans">
                    Hey, I&apos;m Ansh. I run <strong className="text-foreground font-semibold">Aerix Cloud</strong> and built <strong className="text-foreground font-semibold">Cheats Analyzer</strong>. I build websites, Android apps, Flutter, Windows apps, and manage cloud servers — plus plenty of mods, plugins, and configs.
                  </p>
                </BlurIn>

                <BlurIn delay={1.3}>
                  <div className="mt-5 flex flex-wrap gap-2 text-xs font-mono">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary/40 text-muted-foreground border border-border/60">
                      <Server className="w-3.5 h-3.5 text-sky-400" /> 140+ servers
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary/40 text-muted-foreground border border-border/60">
                      <Shield className="w-3.5 h-3.5 text-emerald-400" /> Cloud & VPS
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary/40 text-muted-foreground border border-border/60">
                      <Terminal className="w-3.5 h-3.5 text-indigo-400" /> 500k+ players
                    </span>
                  </div>
                </BlurIn>

                <BlurIn delay={1.4}>
                  <div className="mt-5">
                    <DiscordStatusWidget />
                  </div>
                </BlurIn>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <BoxReveal delay={1.6} width="fit-content">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link href="#projects">
                      <Button className="font-semibold shadow-md gap-2">
                        Things I&apos;ve built <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>

                    <Link href="#contact">
                      <Button variant="outline" className="font-semibold">
                        Contact me
                      </Button>
                    </Link>



                    <div className="flex items-center gap-1 pl-1">
                      <Link
                        href="https://github.com/ANSH9BOSS"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="GitHub Profile"
                      >
                        <Button variant="ghost" size="icon" className="w-9 h-9">
                          <SiGithub size={18} />
                        </Button>
                      </Link>
                      <Link
                        href="https://discord.com/users/ansh9boss"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Discord Profile"
                      >
                        <Button variant="ghost" size="icon" className="w-9 h-9">
                          <SiDiscord size={18} />
                        </Button>
                      </Link>
                      <Link
                        href="mailto:ansh9boss@aerix.cloud"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Email Address"
                      >
                        <Button variant="ghost" size="icon" className="w-9 h-9">
                          <Mail size={18} />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </BoxReveal>
              </div>
            </div>
          )}
        </div>
        <div className="hidden md:grid col-span-1 pointer-events-none"></div>
      </div>
      <div className="absolute bottom-6 left-[50%] translate-x-[-50%] z-20">
        <ScrollDownIcon />
      </div>
    </SectionWrapper>
  );
};

export default HeroSection;
