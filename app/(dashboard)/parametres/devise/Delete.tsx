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
import { Loader2, Trash2, AlertTriangle, Coins } from "lucide-react";
import { toast } from "sonner";

interface DeleteProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    data: any;
}

export function Delete({ isOpen, onClose, onSuccess, data }: DeleteProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleDelete = async () => {
        setIsSubmitting(true);

        try {
            const res = await apiFetch(`/devises/delete/${data.id}`, {
                method: "DELETE",
            });

            if (res) {
                toast.success("Devise supprimée avec succès !");
                onSuccess();
                onClose();
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Une erreur est survenue lors de la suppression");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!data) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-gradient-to-r from-red-500 to-rose-600 p-6 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                                <Trash2 className="h-6 w-6 text-white" />
                            </div>
                            Supprimer Devise
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <div className="p-6 space-y-6 bg-white">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                            <AlertTriangle className="h-8 w-8" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-slate-600">
                                Êtes-vous sûr de vouloir supprimer la devise{" "}
                                <span className="font-bold text-red-600">{data.code} ({data.symbole})</span> ?
                            </p>
                            <p className="text-sm text-slate-400 italic">
                                Cette action est irréversible et pourrait affecter les transactions utilisant cette devise.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 w-full">
                            <Coins className="h-5 w-5 text-slate-400" />
                            <div className="text-left">
                                <p className="text-xs text-slate-400">Code ISO</p>
                                <p className="font-bold text-slate-700">{data.code}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-4 bg-slate-50 flex gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="flex-1 rounded-xl border-slate-200 text-slate-600 hover:bg-white"
                    >
                        Annuler
                    </Button>
                    <Button
                        type="button"
                        disabled={isSubmitting}
                        onClick={handleDelete}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-600/20 transition-all duration-300 rounded-xl font-semibold"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Suppression...
                            </>
                        ) : (
                            "Supprimer"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
