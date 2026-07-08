const config = {
  title: "ANSH9BOSS | Overall Developer",
  description: {
    long: "Explore the portfolio of ANSH9BOSS — Overall Developer and founder of Stitch Hosting. Specializing in low-level Java NMS modding, custom anti-cheat kernels (Stitch Analyzer), cross-platform desktop shells, mobile binaries, and automated Pterodactyl virtualization infrastructure.",
    short:
      "Portfolio of ANSH9BOSS — Overall Developer and founder of Stitch Hosting.",
  },
  keywords: [
    "ANSH9BOSS",
    "Stitch Hosting",
    "Stitch Analyzer",
    "overall developer",
    "game security",
    "Java NMS",
    "Pterodactyl WHMCS",
    "React Native",
    "Electron launcher",
    "portfolio"
  ],
  author: "ANSH9BOSS",
  email: "anshkumar19zx@gmail.com",
  site: "https://ansh9boss2.vercel.app/",

  // for github stars button
  githubUsername: "ANSH9BOSS",
  githubRepo: "new-portfolio",

  get ogImg() {
    return this.site + "/assets/seo/og-image.png";
  },
  social: {
    twitter: "https://discord.com/users/ansh9boss",
    linkedin: "https://github.com/ANSH9BOSS",
    instagram: "https://github.com/ANSH9BOSS",
    facebook: "https://github.com/ANSH9BOSS",
    github: "https://github.com/ANSH9BOSS",
  },
};
export { config };
