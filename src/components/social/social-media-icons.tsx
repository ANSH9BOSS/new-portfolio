"use client";

import { useInView } from "motion/react";
import React, { useRef } from "react";
import { Button } from "../ui/button";
import { SiDiscord, SiGithub } from "react-icons/si";
import { Mail } from "lucide-react";
import Link from "next/link";

const BUTTONS = [
  {
    name: "GitHub",
    href: "https://github.com/ANSH9BOSS",
    icon: <SiGithub size={20} className="text-foreground" />,
  },
  {
    name: "Discord",
    href: "https://discord.com/users/ansh9boss",
    icon: <SiDiscord size={20} className="text-foreground" />,
  },
  {
    name: "Email",
    href: "mailto:ansh9boss@aerix.cloud",
    icon: <Mail size={20} className="text-foreground" />,
  },
];

const SocialMediaButtons = () => {
  const ref = useRef<HTMLDivElement>(null);
  const show = useInView(ref, { once: true });
  return (
    <div ref={ref} className="z-10 flex items-center gap-1">
      {show &&
        BUTTONS.map((button) => (
          <Link
            href={button.href}
            key={button.name}
            target="_blank"
            rel="noreferrer"
            aria-label={button.name}
          >
            <Button variant={"ghost"} size="icon" className="h-9 w-9">
              {button.icon}
            </Button>
          </Link>
        ))}
    </div>
  );
};

export default SocialMediaButtons;
