"use client";
import React, { Suspense, useEffect, useRef, useState } from "react";
import { Application, SPEObject, SplineEvent } from "@splinetool/runtime";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
const Spline = React.lazy(() => import("@splinetool/react-spline"));
import { Skill, SkillNames, SKILLS } from "@/data/constants";
import { sleep } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { usePreloader } from "./preloader";
import { useTheme } from "@teispace/next-themes";
import { Section, getKeyboardState } from "./animated-background-config";
import { useSounds } from "./realtime/hooks/use-sounds";
import { usePerfProfile } from "@/hooks/use-perf-profile";

gsap.registerPlugin(ScrollTrigger);

/**
 * Ensures materials are cloned once per mesh so individual keycaps can be independently
 * highlighted/illuminated without style bleed across other keys.
 */
function ensureClonedMaterials(mesh: any) {
  if (!mesh || !mesh.material) return;
  if (Array.isArray(mesh.material)) {
    mesh.material = mesh.material.map((m: any) => {
      if (m && !m._isCustomStealth) {
        const cloned = m.clone();
        cloned._isCustomStealth = true;
        return cloned;
      }
      return m;
    });
  } else if (!mesh.material._isCustomStealth) {
    const cloned = mesh.material.clone();
    cloned._isCustomStealth = true;
    mesh.material = cloned;
  }
}

/**
 * Finds the corresponding Skill object for any 3D node by inspecting its name
 * and ancestor hierarchy up to the scene root.
 */
function findSkillForNode(node: any, scene: any): Skill | undefined {
  let curr = node;
  while (curr && curr !== scene) {
    const n = (curr.name || "").toLowerCase();
    const skill = Object.values(SKILLS).find((s) => s.name.toLowerCase() === n);
    if (skill) return skill;
    curr = curr.parent;
  }
  return undefined;
}

/**
 * Applies the Stealth Dark & Accent design to the Spline keyboard scene.
 * Transforms pastel/candy keycaps into an obsidian/charcoal mechanical keyboard with
 * subtle resting emissive backlighting and crisp, preserved logo legends.
 */
function applyStealthKeyboardTheme(app: Application | undefined) {
  if (!app) return;
  try {
    const scene = (app as any)._scene;
    if (!scene) return;

    try {
      app.setBackgroundColor("transparent");
    } catch {
      // ignore
    }

    scene.traverse((obj: any) => {
      const objName = (obj.name || "").toLowerCase();

      // Exclude bongo cat and UI guide overlays
      if (
        objName.includes("bongo") ||
        objName.includes("frame-1") ||
        objName.includes("frame-2") ||
        objName.includes("cat") ||
        objName.startsWith("text-")
      ) {
        return;
      }

      // Neutralize scene lights so they don't cast warm/pink tints on dark materials
      if (obj.isLight && obj.color?.set) {
        obj.color.set("#dce6ff");
        return;
      }

      if (!obj.isMesh || !obj.material) return;

      ensureClonedMaterials(obj);

      const materials: any[] = Array.isArray(obj.material) ? obj.material : [obj.material];

      materials.forEach((mat: any) => {
        if (!mat) return;
        const matName = (mat.name || "").toLowerCase();

        // 1. Textures, logos, and decals: preserve authentic colors and boost contrast
        const isIconOrDecal =
          Boolean(mat.map) ||
          matName.includes("icon") ||
          matName.includes("logo") ||
          matName.includes("label") ||
          matName.includes("text") ||
          matName.includes("svg") ||
          matName.includes("decal") ||
          matName.includes("mark") ||
          objName.includes("icon") ||
          objName.includes("logo") ||
          objName.includes("label") ||
          objName.includes("decal");

        if (isIconOrDecal) {
          if (mat.roughness !== undefined) mat.roughness = 0.35;
          if (mat.metalness !== undefined) mat.metalness = 0.1;
          if (mat.emissive?.set) {
            mat.emissiveIntensity = 0.25;
          }
          mat.needsUpdate = true;
          return;
        }

        // 2. Chassis / Casing
        const isBody =
          objName === "body" ||
          objName.includes("casing") ||
          objName.includes("chassis") ||
          matName.includes("body") ||
          matName.includes("casing");

        if (isBody) {
          if (mat.color?.set) mat.color.set("#0c0e14");
          if (mat.roughness !== undefined) mat.roughness = 0.52;
          if (mat.metalness !== undefined) mat.metalness = 0.38;
          if (mat.emissive?.set) mat.emissive.set("#000000");
          if (mat.emissiveIntensity !== undefined) mat.emissiveIntensity = 0;
          mat.needsUpdate = true;
          return;
        }

        // 3. Platform / Deskmat
        const isPlatform =
          objName === "platform" ||
          objName.includes("desk") ||
          matName.includes("platform") ||
          matName.includes("desk");

        if (isPlatform) {
          if (mat.color?.set) mat.color.set("#06070a");
          if (mat.roughness !== undefined) mat.roughness = 0.88;
          if (mat.metalness !== undefined) mat.metalness = 0.05;
          if (mat.emissive?.set) mat.emissive.set("#000000");
          if (mat.emissiveIntensity !== undefined) mat.emissiveIntensity = 0;
          mat.needsUpdate = true;
          return;
        }

        // 4. Keyboard switch plate / base
        const isKeyboardBase =
          objName === "keyboard" ||
          matName.includes("keyboard") ||
          matName.includes("plate") ||
          matName.includes("switch");

        if (isKeyboardBase) {
          if (mat.color?.set) mat.color.set("#090b10");
          if (mat.roughness !== undefined) mat.roughness = 0.58;
          if (mat.metalness !== undefined) mat.metalness = 0.28;
          mat.needsUpdate = true;
          return;
        }

        // 5. Skill Keycaps
        const matchingSkill = findSkillForNode(obj, scene);

        if (matchingSkill) {
          if (mat.color?.set) mat.color.set("#181b24");
          if (mat.roughness !== undefined) mat.roughness = 0.65;
          if (mat.metalness !== undefined) mat.metalness = 0.12;
          if (mat.emissive?.set) {
            mat.emissive.set(matchingSkill.color);
            mat.emissiveIntensity = 0.08;
          }
          mat._baseColor = "#181b24";
          mat._baseEmissive = matchingSkill.color;
          mat._baseEmissiveIntensity = 0.08;
          mat._isKeycapBody = true;
          mat._skillName = matchingSkill.name;
          mat.needsUpdate = true;
          return;
        }

        // 6. Accent Keys (spacebar, enter, esc, shift)
        const isAccentKey =
          objName.includes("space") ||
          objName.includes("enter") ||
          objName.includes("shift") ||
          objName.includes("esc") ||
          objName.includes("tab") ||
          matName.includes("accent") ||
          matName.includes("space") ||
          matName.includes("enter");

        if (isAccentKey) {
          if (mat.color?.set) mat.color.set("#1e222e");
          if (mat.roughness !== undefined) mat.roughness = 0.62;
          if (mat.metalness !== undefined) mat.metalness = 0.15;
          if (mat.emissive?.set) {
            mat.emissive.set("#3b82f6");
            mat.emissiveIntensity = 0.05;
          }
          mat._baseColor = "#1e222e";
          mat._baseEmissive = "#3b82f6";
          mat._baseEmissiveIntensity = 0.05;
          mat._isKeycapBody = true;
          mat.needsUpdate = true;
          return;
        }

        // 7. Standard alphanumeric Keycaps (keycap, keycap-desktop, keycap-mobile)
        if (mat.color?.set) mat.color.set("#14161c");
        if (mat.roughness !== undefined) mat.roughness = 0.68;
        if (mat.metalness !== undefined) mat.metalness = 0.08;
        if (mat.emissive?.set) mat.emissive.set("#000000");
        if (mat.emissiveIntensity !== undefined) mat.emissiveIntensity = 0;
        mat._baseColor = "#14161c";
        mat._baseEmissive = "#000000";
        mat._baseEmissiveIntensity = 0;
        mat._isKeycapBody = true;
        mat.needsUpdate = true;
      });
    });

    (app as any).requestRender?.();
  } catch (err) {
    console.warn("Could not apply stealth keyboard theme:", err);
  }
}

/**
 * Animates a glowing RGB illumination on the active keycap using GSAP.
 */
function highlightKeycap(
  app: Application | undefined,
  skillName: string | null | undefined,
  active: boolean
) {
  if (!app || !skillName) return;
  try {
    const scene = (app as any)._scene;
    if (!scene) return;

    const skill = SKILLS[skillName as SkillNames];
    const skillColor = skill?.color || "#60a5fa";

    scene.traverse((node: any) => {
      if (!node.isMesh || !node.material) return;
      const matched = findSkillForNode(node, scene);
      if (matched?.name !== skillName && node.name?.toLowerCase() !== skillName.toLowerCase()) {
        return;
      }

      const materials: any[] = Array.isArray(node.material) ? node.material : [node.material];
      materials.forEach((mat: any) => {
        if (!mat || !mat.emissive?.set || mat.map) return;

        if (active) {
          mat.emissive.set(skillColor);
          if (mat.color?.set) mat.color.set("#222736");
          gsap.to(mat, {
            emissiveIntensity: 0.85,
            duration: 0.22,
            overwrite: "auto",
            ease: "power2.out",
            onUpdate: () => {
              (app as any).requestRender?.();
            },
          });
        } else {
          gsap.to(mat, {
            emissiveIntensity: mat._baseEmissiveIntensity ?? 0.08,
            duration: 0.45,
            overwrite: "auto",
            ease: "power2.out",
            onUpdate: () => {
              (app as any).requestRender?.();
            },
            onComplete: () => {
              if (mat._baseEmissive && mat.emissive?.set) {
                mat.emissive.set(mat._baseEmissive);
              }
              if (mat._baseColor && mat.color?.set) {
                mat.color.set(mat._baseColor);
              }
              (app as any).requestRender?.();
            },
          });
        }
      });
    });

    (app as any).requestRender?.();
  } catch {
    // silent fallback
  }
}

const KeyboardScene = ({ maxDpr }: { maxDpr: number }) => {
  const { isLoading, bypassLoading } = usePreloader();
  const { theme } = useTheme();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const splineContainer = useRef<HTMLDivElement>(null);
  const [splineApp, setSplineApp] = useState<Application>();
  const selectedSkillRef = useRef<Skill | null>(null);

  const { playPressSound, playReleaseSound } = useSounds();

  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [activeSection, setActiveSection] = useState<Section>("hero");

  // Animation controllers refs
  const bongoAnimationRef = useRef<{ start: () => void; stop: () => void }>(null);
  const keycapAnimationsRef = useRef<{ start: () => void; stop: () => void }>(null);

  const [keyboardRevealed, setKeyboardRevealed] = useState(false);

  // --- Event Handlers ---

  const handleMouseHover = (e: SplineEvent) => {
    if (!splineApp || selectedSkillRef.current?.name === e.target.name) return;

    if (e.target.name === "body" || e.target.name === "platform") {
      if (selectedSkillRef.current) {
        playReleaseSound();
        highlightKeycap(splineApp, selectedSkillRef.current.name, false);
      }
      setSelectedSkill(null);
      selectedSkillRef.current = null;
      if (splineApp.getVariable("heading") !== undefined) {
        splineApp.setVariable("heading", "");
        splineApp.setVariable("desc", "");
      }
    } else {
      if (!selectedSkillRef.current || selectedSkillRef.current.name !== e.target.name) {
        const skill = SKILLS[e.target.name as SkillNames];
        if (skill) {
          if (selectedSkillRef.current) {
            playReleaseSound();
            highlightKeycap(splineApp, selectedSkillRef.current.name, false);
          }
          playPressSound();
          highlightKeycap(splineApp, skill.name, true);
          setSelectedSkill(skill);
          selectedSkillRef.current = skill;
        }
      }
    }
  };

  const handleSplineInteractions = () => {
    if (!splineApp) return;

    const isInputFocused = () => {
      const activeElement = document.activeElement;
      return (
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          (activeElement as HTMLElement).isContentEditable)
      );
    };

    splineApp.addEventListener("keyUp", () => {
      if (!splineApp || isInputFocused()) return;
      playReleaseSound();
      if (selectedSkillRef.current) {
        highlightKeycap(splineApp, selectedSkillRef.current.name, false);
      }
      if (splineApp.getVariable("heading") !== undefined) {
        splineApp.setVariable("heading", "");
        splineApp.setVariable("desc", "");
      }
    });
    splineApp.addEventListener("keyDown", (e) => {
      if (!splineApp || isInputFocused()) return;
      const skill = SKILLS[e.target.name as SkillNames];
      if (skill) {
        if (selectedSkillRef.current && selectedSkillRef.current.name !== skill.name) {
          highlightKeycap(splineApp, selectedSkillRef.current.name, false);
        }
        playPressSound();
        highlightKeycap(splineApp, skill.name, true);
        setSelectedSkill(skill);
        selectedSkillRef.current = skill;
        if (splineApp.getVariable("heading") !== undefined) {
          splineApp.setVariable("heading", skill.label);
          splineApp.setVariable("desc", skill.shortDescription);
        }
      }
    });
    splineApp.addEventListener("mouseHover", handleMouseHover);
  };

  // --- Animation Setup Helpers ---

  const createSectionTimeline = (
    triggerId: string,
    targetSection: Section,
    prevSection: Section,
    start: string = "top 50%",
    end: string = "bottom bottom"
  ) => {
    if (!splineApp) return;
    const kbd = splineApp.findObjectByName("keyboard");
    if (!kbd) return;

    return gsap.timeline({
      scrollTrigger: {
        trigger: triggerId,
        start,
        end,
        scrub: true,
        onEnter: () => {
          setActiveSection(targetSection);
          const state = getKeyboardState({ section: targetSection, isMobile });
          gsap.to(kbd.scale, { ...state.scale, duration: 1 });
          gsap.to(kbd.position, { ...state.position, duration: 1 });
          gsap.to(kbd.rotation, { ...state.rotation, duration: 1 });
        },
        onLeaveBack: () => {
          setActiveSection(prevSection);
          const state = getKeyboardState({ section: prevSection, isMobile, });
          gsap.to(kbd.scale, { ...state.scale, duration: 1 });
          gsap.to(kbd.position, { ...state.position, duration: 1 });
          gsap.to(kbd.rotation, { ...state.rotation, duration: 1 });
        },
      },
    });
  };

  const setupScrollAnimations = (): gsap.core.Timeline[] => {
    if (!splineApp || !splineContainer.current) return [];
    const kbd = splineApp.findObjectByName("keyboard");
    if (!kbd) return [];

    // Initial state
    const heroState = getKeyboardState({ section: "hero", isMobile });
    gsap.set(kbd.scale, heroState.scale);
    gsap.set(kbd.position, heroState.position);

    // Section transitions
    return [
      createSectionTimeline("#skills", "skills", "hero"),
      createSectionTimeline("#projects", "projects", "skills", "top 70%"),
      createSectionTimeline("#contact", "contact", "projects", "top 30%"),
    ].filter(Boolean) as gsap.core.Timeline[];
  };

  const getBongoAnimation = () => {
    const framesParent = splineApp?.findObjectByName("bongo-cat");
    const frame1 = splineApp?.findObjectByName("frame-1");
    const frame2 = splineApp?.findObjectByName("frame-2");

    if (!frame1 || !frame2 || !framesParent) {
      return { start: () => { }, stop: () => { } };
    }

    let interval: NodeJS.Timeout;
    const start = () => {
      let i = 0;
      framesParent.visible = true;
      interval = setInterval(() => {
        if (i % 2) {
          frame1.visible = false;
          frame2.visible = true;
        } else {
          frame1.visible = true;
          frame2.visible = false;
        }
        i++;
      }, 100);
    };
    const stop = () => {
      clearInterval(interval);
      framesParent.visible = false;
      frame1.visible = false;
      frame2.visible = false;
    };
    return { start, stop };
  };

  const getKeycapsAnimation = () => {
    if (!splineApp) return { start: () => { }, stop: () => { } };

    // Track the infinite "float" tweens separately from the finite "settle"
    // tweens so start()/stop() each kill exactly what the other created — and
    // never a tween a newer call has since started (a stale kill landing late is
    // how the yoyo got stuck running on fast scrub).
    let floatTweens: gsap.core.Tween[] = [];
    let settleTweens: gsap.core.Tween[] = [];
    const killFloat = () => { floatTweens.forEach((t) => t.kill()); floatTweens = []; };
    const killSettle = () => { settleTweens.forEach((t) => t.kill()); settleTweens = []; };

    const start = () => {
      killSettle();
      killFloat();
      Object.values(SKILLS)
        .sort(() => Math.random() - 0.5)
        .forEach((skill, idx) => {
          const keycap = splineApp.findObjectByName(skill.name);
          if (!keycap) return;
          floatTweens.push(
            gsap.to(keycap.position, {
              y: Math.random() * 200 + 200,
              duration: Math.random() * 2 + 2,
              delay: idx * 0.6,
              repeat: -1,
              yoyo: true,
              yoyoEase: "none",
              ease: "elastic.out(1,0.3)",
            })
          );
        });
    };

    const stop = () => {
      killFloat();
      killSettle();
      // Finite — GSAP disposes them on completion, so no cleanup timer needed.
      Object.values(SKILLS).forEach((skill) => {
        const keycap = splineApp.findObjectByName(skill.name);
        if (!keycap) return;
        settleTweens.push(
          gsap.to(keycap.position, {
            y: 0,
            duration: 4,
            ease: "elastic.out(1,0.7)",
          })
        );
      });
    };

    return { start, stop };
  };

  const updateKeyboardTransform = async () => {
    if (!splineApp) return;
    const kbd = splineApp.findObjectByName("keyboard");
    if (!kbd) return;

    kbd.visible = false;
    await sleep(400);
    kbd.visible = true;
    setKeyboardRevealed(true);

    const currentState = getKeyboardState({ section: activeSection, isMobile });
    gsap.fromTo(
      kbd.scale,
      { x: 0.01, y: 0.01, z: 0.01 },
      {
        ...currentState.scale,
        duration: 1.5,
        ease: "elastic.out(1, 0.6)",
      }
    );

    const allObjects = splineApp.getAllObjects();
    const keycaps = allObjects.filter((obj) => obj.name === "keycap");

    await sleep(900);

    if (isMobile) {
      const mobileKeyCaps = allObjects.filter((obj) => obj.name === "keycap-mobile");
      mobileKeyCaps.forEach((keycap) => { keycap.visible = true; });
    } else {
      const desktopKeyCaps = allObjects.filter((obj) => obj.name === "keycap-desktop");
      desktopKeyCaps.forEach(async (keycap, idx) => {
        await sleep(idx * 70);
        keycap.visible = true;
      });
    }

    keycaps.forEach(async (keycap, idx) => {
      keycap.visible = false;
      await sleep(idx * 70);
      keycap.visible = true;
      gsap.fromTo(
        keycap.position,
        { y: 200 },
        { y: 50, duration: 0.5, delay: 0.1, ease: "bounce.out" }
      );
    });

    // Ensure newly revealed keycaps carry stealth materials
    setTimeout(() => {
      if (splineApp) applyStealthKeyboardTheme(splineApp);
    }, 1100);
  };

  // --- Effects ---

  // Initialize GSAP and Spline interactions
  useEffect(() => {
    if (!splineApp) return;
    handleSplineInteractions();
    const timelines = setupScrollAnimations();
    bongoAnimationRef.current = getBongoAnimation();
    keycapAnimationsRef.current = getKeycapsAnimation();
    return () => {
      bongoAnimationRef.current?.stop()
      keycapAnimationsRef.current?.stop()
      // Kill the section ScrollTriggers so they don't orphan when the scene
      // unmounts (e.g. toggling reduced motion) and fire on the disposed app.
      timelines.forEach((tl) => {
        tl.scrollTrigger?.kill();
        tl.kill();
      });
    }

  }, [splineApp, isMobile]);

  // Handle keyboard text visibility based on theme and section
  useEffect(() => {
    if (!splineApp) return;
    const textDesktopDark = splineApp.findObjectByName("text-desktop-dark");
    const textDesktopLight = splineApp.findObjectByName("text-desktop");
    const textMobileDark = splineApp.findObjectByName("text-mobile-dark");
    const textMobileLight = splineApp.findObjectByName("text-mobile");

    if (!textDesktopDark || !textDesktopLight || !textMobileDark || !textMobileLight) return;

    const setVisibility = (
      dDark: boolean,
      dLight: boolean,
      mDark: boolean,
      mLight: boolean
    ) => {
      textDesktopDark.visible = dDark;
      textDesktopLight.visible = dLight;
      textMobileDark.visible = mDark;
      textMobileLight.visible = mLight;
    };

    if (activeSection !== "skills") {
      setVisibility(false, false, false, false);
    } else if (theme === "dark") {
      isMobile
        ? setVisibility(false, false, false, true)
        : setVisibility(false, true, false, false);
    } else {
      isMobile
        ? setVisibility(false, false, true, false)
        : setVisibility(true, false, false, false);
    }
  }, [theme, splineApp, isMobile, activeSection]);

  useEffect(() => {
    if (!selectedSkill || !splineApp) return;
    if (splineApp.getVariable("heading") !== undefined) {
      splineApp.setVariable("heading", selectedSkill.label);
      splineApp.setVariable("desc", selectedSkill.shortDescription);
    }
  }, [selectedSkill, splineApp]);

  // Handle rotation and teardown animations based on active section
  useEffect(() => {
    if (!splineApp) return;

    // Marks this run superseded so the delayed (await sleep) start/stop calls
    // below don't fire after activeSection has moved on — otherwise fast
    // scrolling overlaps runs and a stale keycap start() can land last, leaving
    // the float (yoyo) running forever.
    let cancelled = false;

    let rotateKeyboard: gsap.core.Tween | undefined;
    let teardownKeyboard: gsap.core.Tween | undefined;

    const kbd = splineApp.findObjectByName("keyboard");

    if (kbd) {
      rotateKeyboard = gsap.to(kbd.rotation, {
        y: Math.PI * 2 + kbd.rotation.y,
        duration: 10,
        repeat: -1,
        yoyo: true,
        yoyoEase: true,
        ease: "back.inOut",
        delay: 2.5,
        paused: true, // Start paused
      });

      teardownKeyboard = gsap.fromTo(
        kbd.rotation,
        { y: 0, x: -Math.PI, z: 0 },
        {
          y: -Math.PI / 2,
          duration: 5,
          repeat: -1,
          yoyo: true,
          yoyoEase: true,
          delay: 2.5,
          immediateRender: false,
          paused: true,
        }
      );
    }

    const manageAnimations = async () => {
      // Reset text if not in skills
      if (activeSection !== "skills") {
        if (splineApp.getVariable("heading") !== undefined) {
          splineApp.setVariable("heading", "");
          splineApp.setVariable("desc", "");
        }
      }

      // Handle Rotate/Teardown Tweens
      if (activeSection === "hero") {
        rotateKeyboard?.restart();
        teardownKeyboard?.pause();
      } else if (activeSection === "contact") {
        rotateKeyboard?.pause();
      } else {
        rotateKeyboard?.pause();
        teardownKeyboard?.pause();
      }

      // Handle Bongo Cat
      if (activeSection === "projects") {
        await sleep(300);
        if (cancelled) return;
        bongoAnimationRef.current?.start();
      } else {
        await sleep(200);
        if (cancelled) return;
        bongoAnimationRef.current?.stop();
      }

      // Handle Contact Section Animations
      if (activeSection === "contact") {
        await sleep(600);
        if (cancelled) return;
        teardownKeyboard?.restart();
        keycapAnimationsRef.current?.start();
      } else {
        await sleep(600);
        if (cancelled) return;
        teardownKeyboard?.pause();
        keycapAnimationsRef.current?.stop();
      }
    };

    manageAnimations();

    return () => {
      cancelled = true;
      rotateKeyboard?.kill();
      teardownKeyboard?.kill();
    };
  }, [activeSection, splineApp]);

  // Reveal keyboard on load/route change
  useEffect(() => {
    // Rebuild the URL from the current pathname so the hash is always *replaced*
    // rather than appended. Using router.push("/" + hash) stacked fragments on
    // refresh (e.g. "/#skills#skills#skills") because the existing hash in the
    // address bar was never stripped first. replaceState also avoids polluting
    // browser history with an entry per scrolled-through section.
    const hash = activeSection === "hero" ? "" : `#${activeSection}`;
    const url = window.location.pathname + window.location.search + hash;
    window.history.replaceState(window.history.state, "", url);

    if (!splineApp || isLoading || keyboardRevealed) return;
    updateKeyboardTransform();
  }, [splineApp, isLoading, activeSection]);

  // Cap the renderer's pixel ratio once the scene is ready, and clean up the
  // resize listener on unmount / DPR change (previously added in onLoad and
  // never removed).
  useEffect(() => {
    if (!splineApp) return;
    return capSplinePixelRatio(splineApp, maxDpr);
  }, [splineApp, maxDpr]);

  // Pause the entire WebGL render loop (and the keyboard's infinite tweens /
  // bongo-cat interval, which are only visible through it) while the tab is
  // hidden. Spline keeps rendering at full tilt in a background tab otherwise —
  // a pointless, continuous GPU/battery drain.
  useEffect(() => {
    if (!splineApp) return;
    const onVisibility = () => {
      if (document.hidden) splineApp.stop();
      else splineApp.play();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [splineApp]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Spline
        className="w-full h-full fixed"
        ref={splineContainer}
        onLoad={(app: Application) => {
          setSplineApp(app);
          applyStealthKeyboardTheme(app);
          setTimeout(() => applyStealthKeyboardTheme(app), 300);
          setTimeout(() => applyStealthKeyboardTheme(app), 1000);
          bypassLoading();
        }}
        scene="/assets/skills-keyboard.spline"
      />
    </Suspense>
  );
};

/**
 * Gate the heavy WebGL scene behind device/preference detection.
 *
 * The gate lives here in the parent (not inside KeyboardScene) on purpose: when
 * 3D is disabled — e.g. the user toggles reduced motion — KeyboardScene fully
 * UNMOUNTS, tearing down its Spline app, GSAP tweens, ScrollTriggers and reveal
 * state. Re-enabling remounts it from a clean slate. (Gating with an internal
 * early-return instead kept the component mounted, so it came back with stale
 * `keyboardRevealed` state and never re-initialised the keycaps.)
 *
 * Waiting for `ready` also avoids a flash-mount that would fetch the heavy
 * runtime chunk + scene before detection has run; the Preloader bypasses its
 * splash when 3D is disabled.
 */
const AnimatedBackground = () => {
  const { disable3D, maxDpr, ready } = usePerfProfile();
  if (!ready || disable3D) return null;
  return <KeyboardScene maxDpr={maxDpr} />;
};

/**
 * Cap the Spline/Three.js renderer's pixel ratio. The scene is published with
 * pixelRatio=0 ("device"), so on a 2–3x screen it renders 4–9x the pixels of a
 * 1x canvas — a huge GPU cost. We clamp it and reapply on resize, since Spline
 * re-reads devicePixelRatio when the canvas resizes. Returns a disposer that
 * removes the resize listener (so it isn't leaked across reloads/unmounts).
 */
function capSplinePixelRatio(app: Application, maxDpr: number) {
  const apply = () => {
    try {
      const renderer = (app as unknown as { _renderer?: { setPixelRatio?: (n: number) => void } })
        ._renderer;
      if (renderer?.setPixelRatio) {
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxDpr));
      }
    } catch {
      /* internal API moved — fail silent, scene still renders */
    }
  };
  apply();
  window.addEventListener("resize", apply, { passive: true });
  return () => window.removeEventListener("resize", apply);
}

export default AnimatedBackground;
