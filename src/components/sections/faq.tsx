"use client";

import React, { useState } from "react";
import SectionWrapper from "../ui/section-wrapper";
import { SectionHeader } from "./section-header";
import { ChevronDown, HelpCircle, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { Button } from "../ui/button";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "What kind of projects do you work on?",
    answer:
      "Mostly cloud hosting and server setups (like Aerix Cloud), game security and anti-cheat tools (like Cheats Analyzer), websites with Next.js and React, plus Android apps, Flutter, Windows apps, and plenty of mods, plugins, and server configs.",
  },
  {
    question: "How does your anti-cheat work?",
    answer:
      "It uses two parts: a lightweight desktop app that scans game process memory for injected cheats, and a server plugin that watches player movement, click speeds, and combat packets to catch cheaters without lagging the server.",
  },
  {
    question: "Can you automate server hosting and billing?",
    answer:
      "Yes. For Aerix Cloud, I connected WHMCS billing webhooks with Pterodactyl's Wings daemon. When a customer orders a server, the system automatically creates the Docker container, assigns RAM and ports, and delivers login details in under 10 seconds.",
  },
  {
    question: "What tech stack do you use for web apps?",
    answer:
      "For frontend and full-stack web apps, I mostly use Next.js, React, TypeScript, and Tailwind CSS. For databases, I work with MongoDB and PostgreSQL.",
  },
  {
    question: "Can you build custom Discord bots?",
    answer:
      "Yes. I've built over 100 Discord bots for gaming servers and communities. That includes auto-moderation, support tickets, web store syncing, and live role updates based on in-game ranks.",
  },
  {
    question: "How long does a project usually take?",
    answer:
      "Smaller projects like Discord bots or plugin fixes usually take 3 to 7 days. Bigger projects like a full web application or custom hosting setup typically take 2 to 4 weeks.",
  },
  {
    question: "Do you offer ongoing maintenance?",
    answer:
      "Yes, I can help keep servers running, monitor performance, fix bugs, and handle updates after a project launches.",
  },
  {
    question: "How do I reach out to work together?",
    answer:
      "You can send me a message using the form below, or reach out on Discord (@ansh9boss) or email (ansh9boss@aerix.cloud). I usually reply within a day.",
  },
];

const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <SectionWrapper id="faq" className="max-w-5xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
      <SectionHeader
        id="faq"
        title="FAQ"
        desc="Common questions about my work and how I build things"
        className="mb-14"
      />

      <div className="space-y-4">
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <motion.div
              key={faq.question}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="rounded-2xl border border-border/80 bg-card/70 backdrop-blur-md overflow-hidden transition-colors hover:border-primary/40"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full flex items-center justify-between p-5 sm:p-6 text-left transition-colors"
                aria-expanded={isOpen}
              >
                <span className="text-sm sm:text-base font-bold text-foreground pr-4 tracking-tight">
                  {faq.question}
                </span>
                <div
                  className={`size-8 rounded-full flex items-center justify-center shrink-0 border border-border/60 transition-transform duration-300 ${
                    isOpen ? "rotate-180 bg-primary/10 text-primary border-primary/30" : "text-muted-foreground bg-secondary/30"
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 font-sans">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <p className="text-xs sm:text-sm text-muted-foreground font-mono">
          Have a question that&apos;s not listed here?{" "}
          <Link href="#contact" className="text-primary hover:underline font-semibold">
            Send me a message &rarr;
          </Link>
        </p>
      </div>
    </SectionWrapper>
  );
};

export default FaqSection;
