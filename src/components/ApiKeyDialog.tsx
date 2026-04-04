"use client";

import { useState } from "react";
import { ExternalLink, Loader2, Check, Zap, ChevronRight, Video } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogDescription
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { useVibeFeedback } from "@/hooks/use-vibe-feedback";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (key: string) => void;
}

export const ApiKeyDialog = ({ open, onOpenChange, onSave }: ApiKeyDialogProps) => {
  const [key, setKey] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { feedback } = useVibeFeedback();
  const { toast } = useToast();

  const handleVerify = async () => {
    if (!key.trim()) return;

    setIsVerifying(true);
    feedback('click');

    try {
      if (key.length < 30) throw new Error("Key looks too short for a Google AI key.");

      feedback('success');
      setIsSuccess(true);
      setTimeout(() => {
        onSave(key);
        setIsSuccess(false);
        setKey("");
      }, 800);
    } catch (e: any) {
      feedback('error');
      toast({ 
        title: "Key Error", 
        description: e.message, 
        variant: "destructive" 
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-bento border-white/10 w-[min(94vw,440px)] p-0 rounded-[40px] overflow-hidden">
        <div className="bg-primary/5 p-8 border-b border-white/5 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 border border-primary/20">
            <Zap className="text-primary w-8 h-8" />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight text-white uppercase">Setup AI (30 seconds)</DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium text-xs mt-2">
            Get your free Google AI API key to unlock immersive sync.
          </DialogDescription>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-3">
             <div className="glass p-4 rounded-[24px] space-y-4 bg-black/60 border-2 border-white/20">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <Video size={14} className="text-primary" />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">Quick guide (30 sec)</span>
                   </div>
                   <a 
                    href="https://youtu.be/7_HFmLrfZHg" 
                    target="_blank" 
                    className="text-[9px] font-black text-primary uppercase underline underline-offset-4"
                   >
                     Watch Video
                   </a>
                </div>
                <div className="space-y-3">
                  {[
                    "Go to Google AI Studio",
                    "Sign in with Google",
                    "Click 'Get API Key'",
                    "Create & Copy API Key"
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[9px] font-black text-primary">
                        {i + 1}
                      </div>
                      <span className="text-[10px] font-bold text-white/80 uppercase">{step}</span>
                    </div>
                  ))}
                </div>
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank"
                  className="w-full h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center gap-2 hover:bg-white/20 transition-all group"
                >
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Open Google AI Studio</span>
                  <ExternalLink size={12} className="text-primary group-hover:translate-x-1 transition-transform" />
                </a>
             </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Paste API Key here..."
                className="w-full h-14 bg-black/80 border-2 border-primary/40 rounded-2xl px-6 text-sm font-mono text-primary placeholder:text-white/20 focus:outline-none focus:border-primary transition-all shadow-inner"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleVerify}
              disabled={isVerifying || !key || isSuccess}
              className={cn(
                "w-full h-14 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3",
                isSuccess ? "bg-green-500 text-white" : "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
              )}
            >
              {isVerifying ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : isSuccess ? (
                <Check className="w-4 h-4" />
              ) : "Save & Continue"}
              {!isVerifying && !isSuccess && <ChevronRight size={14} />}
            </motion.button>
          </div>
        </div>

        <div className="p-4 bg-black/40 text-center border-t border-white/5">
          <p className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-[0.4em]">
            Stored locally on your device
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
