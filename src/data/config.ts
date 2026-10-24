const config = {
  title: "Ansh Kumar | Developer & Builder",
  description: {
    long: "Personal portfolio of Ansh Kumar (ANSH9BOSS). I build websites, Android apps, Flutter, Windows apps, cloud servers with Aerix Cloud, mods, plugins, and game tools.",
    short:
      "Personal portfolio of Ansh Kumar — developer and founder of Aerix Cloud.",
  },
  keywords: [
    "ANSH9BOSS",
    "Ansh Kumar",
    "Aerix Cloud",
    "Cheats Analyzer",
    "VayuClient",
    "Developer",
    "Full-Stack",
    "Web Developer",
    "Flutter",
    "Android Apps",
    "Windows Apps",
    "Minecraft Mods",
    "Plugins & Configs",
    "Minecraft Launcher",
    "Anti-Cheat Android",
    "TypeScript",
    "Next.js",
    "React",
    "Portfolio"
  ],
  author: "ANSH9BOSS",
  email: "ansh9boss@aerix.cloud",
  site: "https://ansh9boss2.vercel.app/",

  // for github stars button
  githubUsername: "ANSH9BOSS",
  githubRepo: "new-portfolio",

  get ogImg() {
    return this.site + "/assets/seo/og-image.png";
  },
  social: {
    github: "https://github.com/ANSH9BOSS",
    discord: "https://discord.com/users/ansh9boss",
    email: "mailto:ansh9boss@aerix.cloud",
  },
  discordUserId: process.env.NEXT_PUBLIC_DISCORD_USER_ID || "1372121943490170930",
};
export { config };
