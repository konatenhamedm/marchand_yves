"use client";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/axios";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; data: any; }
export function Delete({ isOpen, onClose, onSuccess, data }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await apiFetch(`/achats/${data.id}/delete`, { method: "DELETE" });
      toast.success("Achat supprimé(e) !"); onSuccess(); onClose();
    } catch (err: any) { toast.error(err.message || "Erreur"); } finally { setIsSubmitting(false); }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-red-500 p-6 text-white">
          <DialogHeader><DialogTitle className="text-xl font-bold flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg"><AlertTriangle className="h-5 w-5" /></div>
            Supprimer Achat
          </DialogTitle></DialogHeader>
        </div>
        <div className="p-6 bg-white">
          <p className="text-slate-600">Voulez-vous supprimer <span className="font-bold text-red-600">{data?.libelle ?? data?.nom ?? data?.id}</span> ?</p>
          <p className="text-sm text-slate-400 mt-2 italic">Cette action est irréversible.</p>
        </div>
        <DialogFooter className="p-6 bg-slate-50 flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="rounded-xl">Annuler</Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting} className="bg-red-500 hover:bg-red-600 text-white rounded-xl">
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Suppression...</> : "Confirmer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
