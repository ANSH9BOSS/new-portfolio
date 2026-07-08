"use client";
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { config } from "@/data/config";
import { SectionHeader } from "./section-header";
import SectionWrapper from "../ui/section-wrapper";
import { SiDiscord } from "react-icons/si";
import { Mail, ArrowRight, Copy, Check } from "lucide-react";
import ContactForm from "@/components/ContactForm";
import { DiscordStatusWidget } from "../discord-status";
import Link from "next/link";

const ContactSection = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyDiscord = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText("ansh9boss");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SectionWrapper id="contact" className="min-h-screen max-w-7xl mx-auto flex flex-col justify-center py-20">
      <SectionHeader id='contact' className="relative mb-6" title={<>LET&apos;S WORK TOGETHER</>} />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 z-[9999] mx-auto w-full max-w-6xl px-4 mt-6 items-stretch">
        {/* Left Column: Direct Links (5 Columns) */}
        <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
          {/* Discord Card */}
          <Link href="https://discord.com/users/238627786" target="_blank" className="group block flex-1">
            <Card className="bg-zinc-50/90 dark:bg-zinc-900/50 hover:bg-zinc-100/90 dark:hover:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700/80 backdrop-blur-md rounded-2xl p-8 h-full flex flex-col justify-between transition-all duration-300 transform group-hover:-translate-y-1 group-hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="p-4 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl w-fit">
                    <SiDiscord size={32} />
                  </div>
                  <button 
                    onClick={handleCopyDiscord}
                    className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg transition-colors border border-zinc-250 dark:border-zinc-800"
                    title="Copy Discord Tag"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-600 dark:text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div>
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Discord DM</h3>
                    <DiscordStatusWidget showActivity={false} />
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 mt-2">
                    DM for immediate projects, business inquiries, or custom systems discussions.
                  </p>
                </div>
              </div>
              <div className="mt-8 flex items-center justify-between text-zinc-700 dark:text-zinc-300 font-mono text-sm">
                <span>{copied ? "Copied tag!" : "@ansh9boss"}</span>
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                  <span className="text-xs font-sans group-hover:underline">Chat Now</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Card>
          </Link>

          {/* Email Card */}
          <Link href={`mailto:${config.email}?subject=Project%20Inquiry%20-%20ANSH9BOSS`} target="_blank" className="group block flex-1">
            <Card className="bg-zinc-50/90 dark:bg-zinc-900/50 hover:bg-zinc-100/90 dark:hover:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700/80 backdrop-blur-md rounded-2xl p-8 h-full flex flex-col justify-between transition-all duration-300 transform group-hover:-translate-y-1 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]">
              <div className="flex flex-col gap-4">
                <div className="p-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl w-fit">
                  <Mail size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Direct Email</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 mt-2">
                    Send a direct email. I typically respond to all formal inquiries within 24 hours.
                  </p>
                </div>
              </div>
              <div className="mt-8 flex items-center justify-between text-zinc-700 dark:text-zinc-300 font-mono text-sm">
                <span>{config.email}</span>
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <span className="text-xs font-sans group-hover:underline">Send Mail</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Right Column: Custom Contact Form (7 Columns) */}
        <Card className="lg:col-span-7 bg-zinc-50/90 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 backdrop-blur-md rounded-2xl p-8 flex flex-col gap-6">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Send a Message</h3>
            <p className="text-zinc-600 dark:text-zinc-400 mt-2">
              Fill out the form below, and it will be sent directly to my personal inbox.
            </p>
          </div>
          <ContactForm />
        </Card>
      </div>
    </SectionWrapper>
  );
};
export default ContactSection;
