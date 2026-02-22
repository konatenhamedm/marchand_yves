// components/ui/Modal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AnimatedModalBody } from "./AnimatedModalBody";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string | ReactNode;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full" | "2xl";
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
  const sizeClasses = {
    sm: "sm:max-w-[425px]",
    md: "sm:max-w-[500px]",
    lg: "sm:max-w-[600px]",
    xl: "sm:max-w-[800px]",
    "2xl": "sm:max-w-[1200px]",
    full: "!max-w-[95vw] w-[95vw]",
  };

  // Variantes de header avec couleurs Batiflow
  const headerVariants = {
    default: "bg-[#0052cc] text-white",
    gradient: "bg-gradient-to-r from-[#0052cc] via-[#1a66b3] to-[#8B5CF6] text-white",
    light: "bg-gradient-to-r from-batiflow-ice to-transparent text-batiflow-marine border-b-2 border-[#0052cc]",
  };

  const descriptionVariants = {
    default: "text-white/80",
    gradient: "text-white/90",
    light: "text-batiflow-primary",
  };

  const closeButtonVariants = {
    default: "[&>button]:text-white [&>button]:hover:text-white/80 [&>button]:hover:bg-white/20",
    gradient: "[&>button]:text-white [&>button]:hover:text-white/80 [&>button]:hover:bg-white/20",
    light: "[&>button]:text-batiflow-primary [&>button]:hover:text-batiflow-marine [&>button]:hover:bg-batiflow-sky",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={cn(
          sizeClasses[size],
          // Toujours utiliser flex col pour permettre le scroll
          "flex flex-col p-0",
          // Hauteur maximale responsive
          "max-h-[90vh] sm:max-h-[85vh]",
          // Bordure et ombre Batiflow
          "border-2 border-batiflow-sky shadow-2xl shadow-[#0052cc]/20",
          // Bouton close adapté
          closeButtonVariants[variant],
          // ✅ Z-INDEX : Passer au-dessus de la navbar (z-[110])
          "z-[120]",
          // ✅ Overlay/Backdrop au-dessus de la navbar aussi
          "data-[state=open]:z-[120]"
        )}
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* Header - FIXE en haut avec couleurs Batiflow */}
        <div className={cn(
          "rounded-t-lg p-4 sm:p-6 flex-shrink-0",
          headerVariants[variant]
        )}>
          <DialogHeader>
            <DialogTitle className={cn(
              "text-base sm:text-lg font-bold",
              variant === "light" ? "text-batiflow-marine" : "text-white"
            )}>
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className={cn(
                "text-sm mt-1.5",
                descriptionVariants[variant]
              )}>
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        </div>

        {/* Trait séparateur après le header - optionnel selon la variante */}
        {variant === "light" && (
          <div className="h-1 bg-gradient-to-r from-[#0052cc] via-[#1a66b3] to-[#8B5CF6] flex-shrink-0" />
        )}
        
        {/* Body - SCROLLABLE (c'est ici que le scroll se fait) */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 bg-white">
          <div className="space-y-4">
            <AnimatedModalBody stagger={true}>
              {children}
            </AnimatedModalBody>
          </div>
        </div>

        {/* Trait séparateur avant le footer */}
        {footer && (
          <div className="h-px bg-gradient-to-r from-transparent via-batiflow-sky to-transparent flex-shrink-0" />
        )}

        {/* Footer - FIXE en bas avec couleurs Batiflow */}
        {footer && (
          <div className="bg-gradient-to-r from-batiflow-ice via-white to-batiflow-ice p-4 sm:p-6 pt-4 rounded-b-lg flex-shrink-0 border-t border-batiflow-sky">
            <DialogFooter>{footer}</DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Composant ModalFooterButtons pré-stylisé pour les boutons
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
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="border-batiflow-sky text-batiflow-primary hover:bg-batiflow-ice hover:text-batiflow-marine hover:border-[#0052cc] transition-all"
        >
          {cancelText}
        </Button>
      )}
      {onConfirm && (
        <Button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          variant={confirmVariant}
          className={cn(
            "shadow-lg transition-all",
            confirmVariant === "default" &&
              "bg-gradient-to-r from-[#0052cc] to-[#1a66b3] hover:from-[#1a66b3] hover:to-[#8B5CF6] text-white shadow-[#0052cc]/30 hover:shadow-[#1a66b3]/50"
          )}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {confirmText}
            </span>
          ) : (
            confirmText
          )}
        </Button>
      )}
    </div>
  );
};