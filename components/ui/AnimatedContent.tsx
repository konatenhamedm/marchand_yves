// components/AnimatedContent.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

interface AnimatedContentProps {
  children: ReactNode;
}

export default function AnimatedContent({ children }: AnimatedContentProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={{
          initial: {
            opacity: 0,
            y: 20,
            scale: 0.98,
          },
          animate: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1], // Courbe de bézier personnalisée pour un effet plus doux
              delay: 0.1,
            }
          },
          exit: {
            opacity: 0,
            y: -20,
            scale: 0.98,
            transition: {
              duration: 0.4,
              ease: "easeInOut"
            }
          }
        }}
        className="w-full min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}