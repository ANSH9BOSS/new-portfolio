import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import { Mail } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePreloader } from "../preloader";
import { BlurIn, BoxReveal } from "../reveal-animations";
import ScrollDownIcon from "../scroll-down-icon";
import { SiDiscord } from "react-icons/si";
import { config } from "@/data/config";

import { DiscordStatusWidget } from "../discord-status";

import SectionWrapper from "../ui/section-wrapper";

const HeroSection = () => {
  const { isLoading } = usePreloader();

  return (
    <SectionWrapper id="hero" className={cn("relative w-full h-screen")}>
      <div className="grid md:grid-cols-2">
        <div
          className={cn(
            "h-[calc(100dvh-3rem)] md:h-[calc(100dvh-4rem)] z-[2]",
            "col-span-1",
            "flex flex-col justify-start md:justify-center items-center md:items-start",
            "pt-28 sm:pb-16 md:p-20 lg:p-24 xl:p-28"
          )}
        >
          {!isLoading && (
            <div className="flex flex-col">
              <div>
                <BlurIn delay={0.7}>
                  <p
                    className={cn(
                      "md:self-start mt-4 font-medium text-md text-slate-500 dark:text-zinc-400",
                      "cursor-default sm:text-xl md:text-xl whitespace-nowrap bg-clip-text "
                    )}
                  >
                    Hi, I am
                    <br className="md:hidden" />
                  </p>
                </BlurIn>

                <BlurIn delay={1}>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <h1
                        className={cn(
                          "-ml-[6px] leading-none text-transparent text-slate-800 text-left",
                          "font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl",
                          "cursor-default text-edge-outline font-display "
                        )}
                      >
                        {config.author}
                      </h1>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="dark:bg-white dark:text-black"
                    >
                      theres something waiting for you in devtools
                    </TooltipContent>
                  </Tooltip>
                </BlurIn>
                {/* <div className="md:block hidden bg-gradient-to-r from-zinc-300/0 via-zinc-300/50 to-zinc-300/0 w-screen h-px animate-fade-right animate-glow" /> */}
                <BlurIn delay={1.2}>
                  <p
                    className={cn(
                      "md:self-start md:mt-4 font-medium text-md text-slate-500 dark:text-zinc-400",
                      "cursor-default sm:text-xl md:text-xl whitespace-nowrap bg-clip-text "
                    )}
                  >
                    Overall Developer
                  </p>
                </BlurIn>

                <BlurIn delay={1.4}>
                  <div className="mt-4 md:self-start">
                    <DiscordStatusWidget />
                  </div>
                </BlurIn>
              </div>
              <div className="mt-8 flex flex-col gap-3 w-fit">
                <BoxReveal delay={2} width="100%" >
                  <div className="md:self-start flex gap-3">
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <Link href={"#contact"}>
                          <Button
                            variant={"outline"}
                            className="block w-full overflow-hidden"
                          >
                            Hire Me
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>pls 🥹 🙏</p>
                      </TooltipContent>
                    </Tooltip>
                    <div className="flex items-center h-full gap-2">
                      <Link
                        href="https://discord.com/users/ansh9boss"
                        target="_blank"
                        className="cursor-can-hover"
                      >
                        <Button variant={"outline"}>
                          <SiDiscord size={24} />
                        </Button>
                      </Link>
                      <Link
                        href="mailto:anshkumar19zx@gmail.com"
                        target="_blank"
                        className="cursor-can-hover"
                      >
                        <Button variant={"outline"}>
                          <Mail size={24} />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </BoxReveal>
              </div>
            </div>
          )}
        </div>
        <div className="grid col-span-1"></div>
      </div>
      <div className="absolute bottom-10 left-[50%] translate-x-[-50%]">
        <ScrollDownIcon />
      </div>
    </SectionWrapper>
  );
};

export default HeroSection;
