import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  showRadialGradient?: boolean;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <main>
      <div
        className={cn(
          "relative flex flex-col h-[100vh] items-center justify-center bg-slate-950 text-slate-100 transition-bg",
          className
        )}
        {...props}
      >
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div
            // The noise/grain texture
            className="absolute inset-0 z-0 opacity-[0.02] [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 600 600' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          ></div>

          {/* The Aurora Beams */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1,
              ease: "easeOut",
            }}
            className="absolute inset-[-10px] opacity-50"
          >
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1.0, rotate: 0 }}
              animate={{
                scale: [1.0, 1.2, 1.0],
                rotate: [0, 5, 0],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
              }}
            >
              <div
                className="absolute h-[100%] w-[100%] [mask-image:radial-gradient(100%_100%_at_center,white,transparent)]"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(var(--cyan-500-rgb), 0.8) 0%, transparent 100%)",
                  filter: "blur(40px)",
                }}
              ></div>
            </motion.div>
          </motion.div>
        </div>
        {children}
      </div>
    </main>
  );
};