"use client";

import { Info, Heart, Code2, ShieldCheck, Sparkles, Zap, Flame, Terminal, Activity, ChevronRight } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { useVibeFeedback } from "@/hooks/use-vibe-feedback";

const Section = ({ title, children, icon: Icon }: { title: string, children: React.ReactNode, icon?: any }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      {Icon && <Icon size={16} className="text-primary" />}
      <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">{title}</h3>
    </div>
    <div className="text-[14px] text-muted-foreground leading-relaxed font-medium space-y-4 px-1">
      {children}
    </div>
  </div>
);

export const AboutDialog = () => {
  const { feedback } = useVibeFeedback();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => feedback('toggle')}
          className="p-4 rounded-[20px] flex items-center justify-between w-full hover:bg-white/5 transition-all group border border-white/5 bg-white/[0.02]"
          title="About PulsyVibe"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Info className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-black text-foreground group-hover:text-primary transition-colors">About PulsyVibe</span>
              <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tight">Story, Privacy & Tech</span>
            </div>
          </div>
          <ChevronRight size={14} className="text-muted-foreground/40 group-hover:text-primary transition-colors" />
        </motion.button>
      </DialogTrigger>
      
      <DialogContent className="glass-bento border-white/10 w-[min(94vw,500px)] p-0 rounded-[40px] overflow-hidden max-h-[85vh] flex flex-col z-[200]">
        {/* FIXED HEADER */}
        <div className="bg-primary/5 p-8 sm:p-10 border-b border-white/5 text-center flex flex-col items-center shrink-0">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20 rotate-3 shadow-2xl">
            <Sparkles className="text-primary w-8 h-8" />
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase leading-tight max-w-[300px] sm:max-w-none">
            <span aria-hidden="true">✨</span> Built by a student who just wanted music to work better
          </DialogTitle>
        </div>

        {/* SCROLLABLE CONTENT */}
        <ScrollArea className="flex-1">
          <div className="p-8 sm:p-10 space-y-12 pb-10">
            <Section title="About this app" icon={Heart}>
              <p>
                I built this because finding the right music was always annoying. 
                You search on one app, switch to another to play it, then end up listening to the same songs again and again. It felt slow, repetitive, and honestly frustrating.
              </p>
              <p>
                So this app does one simple thing: It finds, builds, and plays the right vibe instantly — in one place.
              </p>
            </Section>

            <Section title="What it does" icon={Zap}>
              <p>
                You just type a mood, vibe, or anything. The app understands what you mean, generates a playlist using AI, and finds real playable songs instantly.
              </p>
              <p className="font-bold text-white/90">
                No switching apps. No extra steps.
              </p>
            </Section>

            <Section title="How it works" icon={Code2}>
              <div className="grid grid-cols-1 gap-3">
                {[
                  "AI suggests relevant songs",
                  "A search system finds playable videos",
                  "Duplicates are removed",
                  "Broken songs are automatically replaced"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">{item}</span>
                  </div>
                ))}
              </div>
              <p className="mt-2 opacity-60 italic text-xs">Everything happens live.</p>
            </Section>

            <Section title="Privacy" icon={ShieldCheck}>
              <p>
                No login required. No personal data collected. Your preferences and history stay strictly on your device. Nothing is stored on any server.
              </p>
            </Section>

            <Section title="What makes it different" icon={Flame}>
              <ul className="space-y-3 list-none">
                <li>• No repeated playlists</li>
                <li>• Fast and smooth experience</li>
                <li>• Learns your taste locally</li>
                <li>• Everything in one place</li>
              </ul>
            </Section>

            <Section title="Under the hood" icon={Terminal}>
              <p>
                Powered by a high-resilience AI synthesis engine for generation, a multi-query discovery crawler for streaming, and a local taste learning engine that evolves as you listen.
              </p>
            </Section>

            <Section title="What it took to build this" icon={Activity}>
              <p>
                This wasn’t smooth at all. Things kept breaking. Features worked one moment and randomly stopped the next. Sometimes I’d fix one issue and accidentally create two more.
              </p>
              <p>
                The AI wouldn’t always behave. The crawler kept giving the same songs again and again. Playlists would stop midway. UI looked perfect on one screen and broken on another.
              </p>
              <p className="text-white/90 font-bold">
                There were moments where I felt like dropping the whole project. But I didn’t.
              </p>
              <p>
                I kept fixing things one by one — making it more stable, faster, and cleaner each time. This app is the result of that process.
              </p>
              <p className="italic text-primary">
                If it feels smooth now, that’s because of all the times it didn’t.
              </p>
            </Section>
            
            {/* SAFE AREA PADDING */}
            <div className="h-20" />
          </div>
        </ScrollArea>

        {/* FIXED FOOTER */}
        <div className="p-4 bg-black/40 text-center border-t border-white/5 shrink-0">
          <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.4em]">
            PulsyVibe • Handcrafted for the vibe
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
