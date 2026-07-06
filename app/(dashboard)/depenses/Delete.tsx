"use client";

import React, { useState } from "react";
import { Modal, ModalFooterButtons } from "@/components/ui/Modal";
import { apiFetch } from "@/lib/axios";
import { AlertCircle, Trash2, Wallet } from "lucide-react";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  data: any;
  multiple?: boolean;
  selectedIds?: number[];
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

export function Delete({ isOpen, onClose, onSuccess, data, multiple = false, selectedIds = [], size = "md" }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (multiple) {
        await Promise.all(selectedIds.map(id => apiFetch(`/depenses/${id}/delete`, { method: "DELETE" })));
        toast.success("Dépenses retirées du registre !");
      } else {
        await apiFetch(`/depenses/${data.id}/delete`, { method: "DELETE" });
        toast.success("Dépense retirée du registre !");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la suppression");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className="bg-red-500/20 p-2 rounded-xl backdrop-blur-md border border-red-500/20 text-red-500">
            <Trash2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Supprimer la Dépense</h2>
            <p className="text-[10px] text-white/70 font-medium uppercase tracking-widest">Action Irréversible</p>
          </div>
        </div>
      }
      variant="danger"
      size={size}
      footer={
        <ModalFooterButtons
          onCancel={onClose}
          onConfirm={handleSubmit}
          confirmText={isSubmitting ? "Suppression..." : "Confirmer la suppression"}
          isLoading={isSubmitting}
          confirmVariant="destructive"
        />
      }
    >
      <div className="py-6 space-y-6">
        <div className="bg-red-50 rounded-3xl p-6 border border-red-100 flex gap-4 items-start">
          <AlertCircle className="w-8 h-8 text-red-500 shrink-0 mt-1" />
          <div className="space-y-2">
            {multiple ? (
              <>
                <p className="text-red-900 font-bold text-sm uppercase tracking-tight">Voulez-vous supprimer ces {selectedIds.length} écritures comptables ?</p>
                <p className="text-red-700/70 text-xs leading-relaxed font-medium">
                  Cette action supprimera définitivement les dépenses sélectionnées. Les mouvements de caisse associés seront annulés.
                </p>
              </>
            ) : (
              <>
                <p className="text-red-900 font-bold text-sm uppercase tracking-tight">Voulez-vous supprimer cette écriture comptable ?</p>
                <p className="text-red-700/70 text-xs leading-relaxed font-medium">
                  Cette action supprimera définitivement la dépense de <span className="font-black underline">{data?.montant?.toLocaleString()} XOF</span> rattachée à <span className="font-black italic">"{data?.charge?.libelle || "Dépense Diverse"}"</span>. Les mouvements de caisse associés seront annulés.
                </p>
              </>
            )}
          </div>
        </div>

        {!multiple && (
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex justify-between items-center px-6">
            <div className="flex items-center gap-3 text-slate-400">
              <Wallet className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">ID de transaction</span>
            </div>
            <span className="text-xs font-black text-slate-700">#{data?.id}</span>
          </div>
        )}
      </div>
    </Modal>
  );
}
