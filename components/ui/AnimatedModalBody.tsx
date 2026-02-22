// components/ui/Modal.tsx
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReactNode, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string | ReactNode;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  footer?: ReactNode;
  variant?: "default" | "gradient" | "light";
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  footer,
  variant = "gradient",
}: ModalProps) => {
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const sizeClasses = {
    sm: "sm:max-w-[425px]",
    md: "sm:max-w-[500px]",
    lg: "sm:max-w-[600px]",
    xl: "sm:max-w-[800px]",
    full: "!max-w-[95vw] w-[95vw]",
  };

  // Variantes de header
  const headerVariants = {
    default: "bg-blue-600 text-white",
    gradient: "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-900 text-white",
    light: "bg-gradient-to-r from-sky-50 to-sky-100 text-blue-900 border-b-2 border-blue-600",
  };

  const descriptionVariants = {
    default: "text-sky-100",
    gradient: "text-sky-100",
    light: "text-blue-600",
  };

  const closeButtonVariants = {
    default: "[&>button]:text-white [&>button]:hover:text-sky-200 [&>button]:hover:bg-blue-700/50",
    gradient: "[&>button]:text-white [&>button]:hover:text-sky-200 [&>button]:hover:bg-white/10",
    light: "[&>button]:text-blue-600 [&>button]:hover:text-blue-800 [&>button]:hover:bg-sky-200",
  };

  // Animation plus rapide et fluide
  const modalVariants = {
    initial: {
      opacity: 0,
      y: 15,
      scale: 0.98,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.35,
        ease: "easeOut" as const,
        delay: 0.05,
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.98,
      transition: {
        duration: 0.25,
        ease: "easeIn" as const
      }
    }
  } as const;

  // Animation d'apparition rapide pour le contenu
  useEffect(() => {
    if (isOpen) {
      // Petit délai pour s'assurer que le DOM est prêt
      const timer = setTimeout(() => {
        setIsContentLoaded(true);
        setShowContent(true);
      }, 50);
      
      return () => clearTimeout(timer);
    } else {
      setIsContentLoaded(false);
      setShowContent(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <AnimatePresence mode="wait">
        {isOpen && (
          <DialogContent 
            className={cn(
              sizeClasses[size],
              "flex flex-col p-0",
              "max-h-[90vh] sm:max-h-[85vh]",
              "border-2 border-sky-200 shadow-2xl shadow-blue-900/20",
              closeButtonVariants[variant],
              "overflow-hidden" // Pour l'animation de chargement
            )}
            onInteractOutside={(e) => e.preventDefault()}
            asChild
          >
            <motion.div
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col"
            >
              {/* Header - avec animation rapide */}
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className={cn(
                  "rounded-t-lg p-4 sm:p-6 flex-shrink-0 overflow-hidden",
                  headerVariants[variant]
                )}
              >
                <DialogHeader>
                  <motion.div
                    initial={{ opacity: 0, y: -3 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: 0.15 }}
                  >
                    <DialogTitle className={cn(
                      "text-base sm:text-lg font-bold",
                      variant === "light" ? "text-blue-900" : "text-white"
                    )}>
                      {title}
                    </DialogTitle>
                  </motion.div>
                  {description && (
                    <motion.div
                      initial={{ opacity: 0, y: -2 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: 0.2 }}
                    >
                      <DialogDescription className={cn(
                        "text-sm mt-1.5",
                        descriptionVariants[variant]
                      )}>
                        {description}
                      </DialogDescription>
                    </motion.div>
                  )}
                </DialogHeader>
              </motion.div>

              {/* Ligne séparatrice avec animation */}
              {variant === "light" && showContent && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.3, delay: 0.25 }}
                  className="h-1 bg-gradient-to-r from-blue-600 via-sky-300 to-blue-600 flex-shrink-0"
                />
              )}
              
              {/* Body - avec effet de chargement progressif */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: showContent ? 1 : 0 }}
                transition={{ duration: 0.25, delay: showContent ? 0.3 : 0 }}
                className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 bg-white relative"
              >
                {/* Indicateur de chargement subtil */}
                {!isContentLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-2 border-sky-300 border-t-blue-600 rounded-full animate-spin" />
                      <span className="text-sm text-blue-600">Chargement...</span>
                    </div>
                  </div>
                )}
                
                <div className="space-y-4">
                  {children}
                </div>
              </motion.div>

              {/* Ligne séparatrice avant le footer */}
              {footer && showContent && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.3, delay: 0.35 }}
                  className="h-px bg-gradient-to-r from-transparent via-sky-300 to-transparent flex-shrink-0"
                />
              )}

              {/* Footer - avec animation rapide */}
              {footer && showContent && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.4 }}
                  className="bg-gradient-to-r from-sky-50 via-white to-sky-50 p-4 sm:p-6 pt-4 rounded-b-lg flex-shrink-0 border-t border-sky-200"
                >
                  <DialogFooter>{footer}</DialogFooter>
                </motion.div>
              )}
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
};

// Composant ModalFooter optimisé pour la vitesse
export const ModalFooterButtons = ({
  onCancel,
  onConfirm,
  cancelText = "Annuler",
  confirmText = "Confirmer",
  isLoading = false,
  confirmVariant = "default",
}: {
  onCancel?: () => void;
  onConfirm?: () => void;
  cancelText?: string;
  confirmText?: string;
  isLoading?: boolean;
  confirmVariant?: "default" | "destructive";
}) => {
  return (
    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
      {onCancel && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: 0.45 }}
        >
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="border-sky-300 text-blue-700 hover:bg-sky-50 hover:text-blue-800 hover:border-blue-600 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
          >
            {cancelText}
          </Button>
        </motion.div>
      )}
      {onConfirm && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: 0.5 }}
        >
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            variant={confirmVariant}
            className={cn(
              "shadow-lg transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]",
              confirmVariant === "default" &&
                "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-blue-600/30 hover:shadow-blue-600/50"
            )}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {confirmText}
              </span>
            ) : (
              confirmText
            )}
          </Button>
        </motion.div>
      )}
    </div>
  );
};

// Version ultra-rapide pour le contenu
export const AnimatedModalBody = ({
  children,
  stagger = false,
  staggerDelay = 0.05, // Réduit pour plus de rapidité
}: {
  children: ReactNode;
  stagger?: boolean;
  staggerDelay?: number;
}) => {
  if (stagger && Array.isArray(children)) {
    return (
      <div className="space-y-4">
        {children.map((child, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.2, // Très rapide
              delay: 0.3 + (index * staggerDelay),
              ease: "easeOut"
            }}
          >
            {child}
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

// Composant de chargement rapide pour le contenu
export const ModalLoading = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative">
        {/* Animation de chargement élégante */}
        <div className="w-12 h-12 border-3 border-sky-200 rounded-full">
          <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
        {/* Points animés */}
        <div className="flex gap-1 mt-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-blue-600 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </div>
      </div>
      <p className="mt-3 text-sm text-blue-600">Préparation du contenu...</p>
    </div>
  );
};