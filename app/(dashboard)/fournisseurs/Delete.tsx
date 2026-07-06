"use client";
import React, { useState } from "react";
import { Modal, ModalFooterButtons } from "@/components/ui/Modal";
import { apiFetch } from "@/lib/axios";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; data: any; multiple?: boolean; selectedIds?: number[]; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

export function Delete({ isOpen, onClose, onSuccess, data, multiple = false, selectedIds = [], size = "md" }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (multiple) {
        await Promise.all(selectedIds.map(id => apiFetch(`/fournisseurs/${id}/delete`, { method: "DELETE" })));
        toast.success("Fournisseurs supprimés !");
      } else {
        await apiFetch(`/fournisseurs/${data.id}/delete`, { method: "DELETE" });
        toast.success("Fournisseur supprimé !");
      }
      onSuccess(); onClose();
    } catch (err: any) { toast.error(err.message || "Erreur lors de la suppression"); } finally { setIsSubmitting(false); }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg"><AlertTriangle className="h-5 w-5" /></div>
          Supprimer le fournisseur
        </div>
      }
      variant="danger"
      size={size}
      footer={
        <ModalFooterButtons
          onCancel={onClose}
          onConfirm={handleSubmit}
          confirmText={isSubmitting ? "Suppression..." : "Confirmer"}
          isLoading={isSubmitting}
          confirmVariant="destructive"
        />
      }
    >
      <div className="py-2">
        {multiple ? (
          <p className="text-slate-600">
            Voulez-vous supprimer les <span className="font-bold text-red-600">{selectedIds.length}</span> fournisseurs sélectionnés ?
          </p>
        ) : (
          <p className="text-slate-600">
            Voulez-vous supprimer le fournisseur <span className="font-bold text-red-600">{data?.nom}</span> ?
          </p>
        )}
        <p className="text-sm text-slate-400 mt-2 italic">Cette action est irréversible.</p>
      </div>
    </Modal>
  );
}
