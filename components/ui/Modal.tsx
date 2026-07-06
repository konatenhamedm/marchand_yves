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
  variant?: "default" | "gradient" | "light" | "danger";
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

  // Couleur unique pour tous les headers — #0052CC (bleu Moomen)
  const headerVariants = {
    default: "bg-[#0052CC] text-white",
    gradient: "bg-[#0052CC] text-white",
    light: "bg-[#0052CC] text-white",
    danger: "bg-red-500 text-white",
  };

  const descriptionVariants = {
    default: "text-white/75",
    gradient: "text-white/75",
    light: "text-white/75",
    danger: "text-white/75",
  };

  const closeButtonVariants = {
    default: "[&>button]:text-white [&>button]:hover:text-white/80 [&>button]:hover:bg-white/20",
    gradient: "[&>button]:text-white [&>button]:hover:text-white/80 [&>button]:hover:bg-white/20",
    light: "[&>button]:text-white [&>button]:hover:text-white/80 [&>button]:hover:bg-white/20",
    danger: "[&>button]:text-white [&>button]:hover:text-white/80 [&>button]:hover:bg-white/20",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          sizeClasses[size],
          "flex flex-col p-0",
          "max-h-[90vh] sm:max-h-[85vh]",
          "border border-slate-200 shadow-2xl shadow-[#0052CC]/15",
          closeButtonVariants[variant],
          "z-[120]",
          "data-[state=open]:z-[120]"
        )}
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* Header — couleur unique #0052CC */}
        <div className={cn(
          "rounded-t-lg px-5 py-4 flex-shrink-0",
          headerVariants[variant]
        )}>
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg font-bold text-white">
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className={cn(
                "text-sm mt-1",
                descriptionVariants[variant]
              )}>
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        </div>



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
          <div className="h-px bg-slate-100 flex-shrink-0" />
        )}

        {/* Footer */}
        {footer && (
          <div className="bg-slate-50 px-5 py-4 rounded-b-lg flex-shrink-0 border-t border-slate-100">
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