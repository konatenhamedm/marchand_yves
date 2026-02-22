"use client";

import React, { useState } from "react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/axios";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface DeleteProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    data: any;
}

export function Delete({ isOpen, onClose, onSuccess, data }: DeleteProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await apiFetch(`/roles/marchands/${data.id}/delete`, { method: "DELETE" });
            toast.success("Rôle marchand supprimé avec succès !");
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Une erreur est survenue");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-red-500 p-6 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <AlertTriangle className="h-5 w-5 text-white" />
                            </div>
                            Supprimer le rôle marchand
                        </DialogTitle>
                    </DialogHeader>
                </div>
                <div className="p-6 bg-white">
                    <p className="text-slate-600">
                        Êtes-vous sûr de vouloir supprimer le rôle{" "}
                        <span className="font-bold text-red-600">{data?.libelle}</span> ?
                    </p>
                    <p className="text-sm text-slate-400 mt-2 italic">
                        Cette action est irréversible et peut affecter les utilisateurs ayant ce rôle.
                    </p>
                </div>
                <DialogFooter className="p-6 bg-slate-50 flex gap-3">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}
                        className="rounded-xl border-slate-200 text-slate-600">
                        Annuler
                    </Button>
                    <Button type="button" onClick={handleSubmit} disabled={isSubmitting}
                        className="bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold">
                        {isSubmitting ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Suppression...</>
                        ) : "Confirmer la suppression"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
