"use client";
import React, { useState } from "react";
import { Modal, ModalFooterButtons } from "@/components/ui/Modal";
import { apiFetch } from "@/lib/axios";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface Props { isOpen: boolean; onClose: () => void; data: any; onSuccess: () => void; multiple?: boolean; selectedIds?: number[]; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

export const Delete = ({ isOpen, onClose, data: client, onSuccess, multiple = false, selectedIds = [], size = "md" }: Props) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (multiple) {
        await Promise.all(selectedIds.map(id => apiFetch(`/clients/delete/${id}`, { method: "DELETE" })));
        toast.success("Clients supprimés !");
      } else {
        await apiFetch(`/clients/delete/${client.id}`, { method: "DELETE" });
        toast.success("Client supprimé !");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg"><AlertTriangle className="h-5 w-5" /></div>
          Supprimer le client
        </div>
      }
      variant="danger"
      size={size}
      footer={
        <ModalFooterButtons
          onCancel={onClose}
          onConfirm={handleDelete}
          confirmText={isDeleting ? "Suppression..." : "Confirmer"}
          isLoading={isDeleting}
          confirmVariant="destructive"
        />
      }
    >
      <div className="py-2">
        {multiple ? (
          <p className="text-slate-600">
            Voulez-vous supprimer les <span className="font-bold text-red-600">{selectedIds.length}</span> clients sélectionnés ?
          </p>
        ) : (
          <p className="text-slate-600">
            Voulez-vous supprimer le client <span className="font-bold text-red-600">{client?.nom}</span> ?
          </p>
        )}
        <p className="text-sm text-slate-400 mt-2 italic">Cette action est irréversible.</p>
      </div>
    </Modal>
  );
};