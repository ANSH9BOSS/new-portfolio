import SlideShow from "@/components/slide-show";
import { Button } from "@/components/ui/button";
import { TypographyP } from "@/components/ui/typography";
import { ArrowUpRight, Github, ExternalLink } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";
import { config } from "@/data/config";

const BASE_PATH = "/assets/projects-screenshots";
const PLACEHOLDER_IMG = "/assets/logo-dark.svg";

const MaskIcon = ({ src, title }: { src: string; title?: string }) => (
  <span
    role="img"
    aria-label={title}
    className="block bg-current"
    style={{
      width: "1em",
      height: "1em",
      WebkitMaskImage: `url(${src})`,
      maskImage: `url(${src})`,
      WebkitMaskRepeat: "no-repeat",
      maskRepeat: "no-repeat",
      WebkitMaskPosition: "center",
      maskPosition: "center",
      WebkitMaskSize: "contain",
      maskSize: "contain",
    }}
  />
);

export type Skill = {
  title: string;
  bg: string;
  fg: string;
  icon: ReactNode;
};

const brand = (title: string, file: string): Skill => ({
  title,
  bg: "black",
  fg: "white",
  icon: <MaskIcon src={`/assets/logos/${file}`} title={title} />,
});

import { SiAndroid, SiElectron, SiDiscord, SiLinux, SiOpenjdk } from "react-icons/si";

const iconBrand = (title: string, icon: ReactNode): Skill => ({
  title,
  bg: "black",
  fg: "white",
  icon,
});

const PROJECT_SKILLS = {
  next: brand("Next.js", "nextdotjs-mono.svg"),
  react: brand("React.js", "react-mono.svg"),
  ts: brand("TypeScript", "typescript-mono.svg"),
  tailwind: brand("Tailwind", "tailwind-css-mono.svg"),
  node: brand("Node.js", "nodedotjs-mono.svg"),
  python: brand("Python", "python-mono.svg"),
  postgres: brand("PostgreSQL", "postgresql-mono.svg"),
  mongo: brand("MongoDB", "mongodb-mono.svg"),
  aiSDK: brand("Vercel AI SDK", "vercel-mono.svg"),
  anthropic: brand("Anthropic Claude", "anthropic-mono.svg"),
  mistral: brand("Mistral AI", "mistral-ai-mono.svg"),
  sockerio: brand("Socket.io", "socketdotio-mono.svg"),
  docker: brand("Docker", "docker-mono.svg"),
  aws: brand("AWS", "cloudflare-mono.svg"),
  electron: iconBrand("Electron", <SiElectron className="w-full h-full text-cyan-400" />),
  android: iconBrand("Android", <SiAndroid className="w-full h-full text-emerald-400" />),
  discord: iconBrand("Discord API", <SiDiscord className="w-full h-full text-indigo-400" />),
  java: iconBrand("Java / NMS", <SiOpenjdk className="w-full h-full text-amber-500" />),
  linux: iconBrand("Linux", <SiLinux className="w-full h-full text-amber-400" />),
};

export type Project = {
  id: string;
  category: string;
  title: string;
  src: string;
  screenshots: string[];
  skills: { frontend: Skill[]; backend: Skill[] };
  content: React.ReactNode;
  github?: string;
  live: string;
};

const CaseStudyModal = ({
  overview,
  problem,
  solution,
  challenges,
  impact,
  live,
  github,
}: {
  overview: string;
  problem: string;
  solution: string;
  challenges: string;
  impact: string;
  live?: string;
  github?: string;
}) => (
  <div className="space-y-6 text-sm">
    <div className="space-y-2">
      <h5 className="text-[11px] uppercase tracking-[0.2em] text-primary font-bold">About the project</h5>
      <p className="text-muted-foreground leading-relaxed text-base">{overview}</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-4 rounded-xl border border-border/80 bg-secondary/20">
        <h5 className="text-xs uppercase tracking-wider text-foreground font-semibold mb-1.5 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span> The problem
        </h5>
        <p className="text-xs text-muted-foreground leading-relaxed">{problem}</p>
      </div>
      <div className="p-4 rounded-xl border border-border/80 bg-secondary/20">
        <h5 className="text-xs uppercase tracking-wider text-foreground font-semibold mb-1.5 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> How it works
        </h5>
        <p className="text-xs text-muted-foreground leading-relaxed">{solution}</p>
      </div>
    </div>

    <div className="p-4 rounded-xl border border-primary/25 bg-primary/5">
      <h5 className="text-xs uppercase tracking-wider text-primary font-semibold mb-1.5 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> The tricky part
      </h5>
      <p className="text-xs text-muted-foreground leading-relaxed">{challenges}</p>
    </div>

    <div className="p-4 rounded-xl border border-border/80 bg-secondary/30">
      <h5 className="text-xs uppercase tracking-wider text-foreground font-semibold mb-1.5 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> What happened
      </h5>
      <p className="text-xs text-foreground font-medium leading-relaxed">{impact}</p>
    </div>

    <div className="flex flex-wrap items-center gap-3 pt-2">
      {live && live !== "#" && (
        <Link href={live} target="_blank" rel="noopener noreferrer">
          <Button size="sm" className="gap-2">
            Open project <ArrowUpRight className="w-4 h-4" />
          </Button>
        </Link>
      )}
      {github && (
        <Link href={github} target="_blank" rel="noopener noreferrer">
          <Button size="sm" variant="outline" className="gap-2">
            <Github className="w-4 h-4" /> View code
          </Button>
        </Link>
      )}
    </div>
  </div>
);

const projects: Project[] = [
  {
    id: "vayuclient",
    category: "Minecraft Launcher",
    title: "VayuClient",
    src: PLACEHOLDER_IMG,
    screenshots: [],
    skills: {
      frontend: [PROJECT_SKILLS.react, PROJECT_SKILLS.ts, PROJECT_SKILLS.tailwind],
      backend: [PROJECT_SKILLS.electron, PROJECT_SKILLS.node, PROJECT_SKILLS.java],
    },
    content: (
      <CaseStudyModal
        overview="A high-performance modern Minecraft launcher designed for instant startup, seamless version management, and custom modpack deployment. Built with a sleek dark glassmorphism interface, OptiFine & Fabric integration, and lightning-fast asset caching."
        problem="Standard Minecraft launchers are bloated, sluggish on initial launch, and make switching modpacks, PvP client settings, and version profiles clunky for competitive players."
        solution="Engineered a lightweight desktop client that caches assets locally, enables one-click profile launches (from 1.8.9 competitive PvP to latest 1.20+ Fabric), and manages custom modpack installs."
        challenges="Managing JVM memory arguments dynamically across varying OS hardware, downloading parallel SHA-verified assets without throttling, and handling Microsoft/Xbox OAuth sessions seamlessly."
        impact="Currently in active development as a high-speed daily driver launcher for competitive Minecraft and modded server communities."
        github={config.social.github}
        live="#"
      />
    ),
    github: config.social.github,
    live: "#",
  },
  {
    id: "cheats-analyzer",
    category: "Game Security & Anti-Cheat",
    title: "Cheats Analyzer",
    src: PLACEHOLDER_IMG,
    screenshots: [],
    skills: {
      frontend: [PROJECT_SKILLS.react, PROJECT_SKILLS.ts, PROJECT_SKILLS.tailwind],
      backend: [PROJECT_SKILLS.android, PROJECT_SKILLS.electron, PROJECT_SKILLS.java, PROJECT_SKILLS.node],
    },
    content: (
      <CaseStudyModal
        overview="Cross-platform game security and screenshare inspection suite running across Windows desktop and Android devices. Audits running memory, loaded modules, strings, and game files to catch hidden ghost clients and autoclickers."
        problem="Competitive Minecraft networks face covert cheaters using injected ghost clients, obfuscated DLLs, and Android mobile macros that bypass traditional server anti-cheats and hide during screenshares."
        solution="Built a dual-platform detection suite: a native scanner auditing process memory signatures, JVM bytecode, and system traces on Windows desktop and Android, paired with real-time server-side packet handlers."
        challenges="Detecting self-destructing ghost clients that unhook and erase their footprints from memory, while maintaining zero false positives for legitimate players."
        impact="Used by server staff and tournament moderators to verify players during competitive events, slashing manual screenshare times from 20 minutes to under 2 minutes."
        github={config.social.github}
        live="#"
      />
    ),
    github: config.social.github,
    live: "#",
  },
  {
    id: "aerix-cloud",
    category: "Cloud Virtualization & Hosting",
    title: "Aerix Cloud",
    src: PLACEHOLDER_IMG,
    screenshots: [],
    skills: {
      frontend: [PROJECT_SKILLS.next, PROJECT_SKILLS.react, PROJECT_SKILLS.ts, PROJECT_SKILLS.tailwind],
      backend: [PROJECT_SKILLS.docker, PROJECT_SKILLS.linux, PROJECT_SKILLS.node],
    },
    content: (
      <CaseStudyModal
        overview="Founder and developer of Aerix Cloud, providing game servers, containerized nodes, and high-performance VPS hosting with automated, zero-delay provisioning."
        problem="Manual VPS and game server provisioning is slow, error-prone, and frustrating for server owners who need instant deployments upon checkout."
        solution="Integrated WHMCS billing webhooks with Pterodactyl Wings daemon and Docker container orchestrators. Orders trigger automated node allocation, port mapping, and server startup in under 10 seconds."
        challenges="Dynamic resource isolation, CPU quota enforcement, and DDoS mitigation across high-density container nodes to prevent noisy neighbor performance drops."
        impact="Successfully managing 140+ active container slots with 99.9% platform uptime, automated billing, and instant server deployments."
        live="https://aerix.cloud"
        github="#"
      />
    ),
    github: "#",
    live: "https://aerix.cloud",
  },
  {
    id: "autotierlist",
    category: "Gaming & Discord Automation",
    title: "AutoTierList",
    src: PLACEHOLDER_IMG,
    screenshots: [],
    skills: {
      frontend: [PROJECT_SKILLS.react, PROJECT_SKILLS.ts, PROJECT_SKILLS.tailwind],
      backend: [PROJECT_SKILLS.discord, PROJECT_SKILLS.sockerio, PROJECT_SKILLS.node, PROJECT_SKILLS.mongo],
    },
    content: (
      <CaseStudyModal
        overview="Automated competitive ranking and leaderboard ecosystem for gaming communities. Parses in-game match results, calculates Elo ratings, and synchronizes ranks with Discord roles in real time."
        problem="Tournament organizers and competitive leagues wasted hours manually reviewing screenshot submissions and assigning Discord tier roles."
        solution="Created an end-to-end event pipeline with WebSockets and Discord bot workers: match completions instantly update the public leaderboard and push role changes to Discord guilds."
        challenges="Handling high-concurrency match submissions during peak tournament hours while respecting Discord API rate limits using background job queues."
        impact="Automated tiering workflows for gaming communities, processing thousands of competitive match results without manual staff intervention."
        github={config.social.github}
        live="#"
      />
    ),
    github: config.social.github,
    live: "#",
  },
  {
    id: "skript-builder-ai",
    category: "AI & Developer Tools",
    title: "Skript Builder AI",
    src: PLACEHOLDER_IMG,
    screenshots: [],
    skills: {
      frontend: [PROJECT_SKILLS.next, PROJECT_SKILLS.react, PROJECT_SKILLS.ts, PROJECT_SKILLS.tailwind],
      backend: [PROJECT_SKILLS.aiSDK, PROJECT_SKILLS.python, PROJECT_SKILLS.node],
    },
    content: (
      <CaseStudyModal
        overview="An AI-powered scripting assistant specifically tuned for Minecraft server developers and Paper/Spigot administrators. Generates syntax-checked .sk scripts, fixes parser errors, and suggests event optimizations."
        problem="Minecraft Skript has rigid indentation and natural language syntax rules that general-purpose LLMs frequently hallucinate or break."
        solution="Trained an AI assistant with custom AST parsers and Skript documentation schemas to generate production-ready, lag-free script files."
        challenges="Filtering out deprecated syntax and validating event priorities to prevent TPS lag spikes on live production servers."
        impact="Enabled server owners and builders to prototype custom server mechanics and minigames in minutes rather than days."
        github={config.social.github}
        live="#"
      />
    ),
    github: config.social.github,
    live: "#",
  },
];

export default projects;
