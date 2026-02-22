"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
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
            const res = await apiFetch(`/roles/admin/${data.id}/delete`, { method: "DELETE" });

            if (res) {
                toast.success("Rôle supprimé avec succès !");
                onSuccess();
                onClose();
            }
        } catch (error: any) {
            console.error(error);
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
                        <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                                <AlertTriangle className="h-6 w-6 text-white" />
                            </div>
                            Supprimer Rôle
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <div className="p-6 bg-white">
                    <p className="text-slate-600">
                        Êtes-vous sûr de vouloir supprimer le rôle admin{" "}
                        <span className="font-bold text-red-600">{data.libelle}</span> ?
                    </p>
                    <p className="text-sm text-slate-500 mt-2 italic">
                        Cette action est irréversible.
                    </p>
                </div>

                <DialogFooter className="p-6 bg-slate-50 flex gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-100"
                    >
                        Annuler
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-red-500/30 transition-all duration-300 rounded-xl font-semibold"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Suppression...
                            </>
                        ) : (
                            "Confirmer la suppression"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
