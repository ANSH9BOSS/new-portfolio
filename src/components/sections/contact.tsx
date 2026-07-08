"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { config } from "@/data/config";
import { SectionHeader } from "./section-header";
import SectionWrapper from "../ui/section-wrapper";
import { SiDiscord } from "react-icons/si";
import { Mail, ArrowRight } from "lucide-react";
import Link from "next/link";

const ContactSection = () => {
  return (
    <SectionWrapper id="contact" className="min-h-screen max-w-7xl mx-auto flex flex-col justify-center">
      <SectionHeader id='contact' className="relative mb-10" title={
        <>
          LET&apos;S WORK <br />
          TOGETHER
        </>} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 z-[9999] mx-4 max-w-4xl w-full align-center self-center mt-10">
        {/* Discord Card */}
        <Link href="https://discord.com/users/ansh9boss" target="_blank" className="group">
          <Card className="bg-white/5 dark:bg-zinc-900/50 hover:bg-zinc-900/80 border-zinc-800 backdrop-blur-md rounded-2xl p-8 h-full flex flex-col justify-between transition-all duration-300 transform group-hover:-translate-y-1">
            <div className="flex flex-col gap-4">
              <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-xl w-fit">
                <SiDiscord size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-white group-hover:text-indigo-400 transition-colors">Discord</h3>
                <p className="text-zinc-400 mt-2">
                  DM for immediate projects, business inquiries, or custom systems discussions.
                </p>
              </div>
            </div>
            <div className="mt-8 flex items-center justify-between text-zinc-300 font-mono text-sm">
              <span>@ansh9boss</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </div>
          </Card>
        </Link>

        {/* Email Card */}
        <Link href={`mailto:${config.email}`} target="_blank" className="group">
          <Card className="bg-white/5 dark:bg-zinc-900/50 hover:bg-zinc-900/80 border-zinc-800 backdrop-blur-md rounded-2xl p-8 h-full flex flex-col justify-between transition-all duration-300 transform group-hover:-translate-y-1">
            <div className="flex flex-col gap-4">
              <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit">
                <Mail size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">Email</h3>
                <p className="text-zinc-400 mt-2">
                  Send a direct email. I typically respond to all formal inquiries within 24 hours.
                </p>
              </div>
            </div>
            <div className="mt-8 flex items-center justify-between text-zinc-300 font-mono text-sm">
              <span>{config.email}</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </div>
          </Card>
        </Link>
      </div>
    </SectionWrapper>
  );
};
export default ContactSection;
