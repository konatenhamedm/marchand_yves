"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/axios";
import { Loader2, Edit3 } from "lucide-react";
import { toast } from "sonner";

interface EditeProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    data: any;
}

export function Edite({ isOpen, onClose, onSuccess, data }: EditeProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [libelle, setLibelle] = useState("");

    useEffect(() => {
        if (data) setLibelle(data.libelle || "");
    }, [data]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await apiFetch(`/roles/marchands/${data.id}/update`, {
                method: "PUT",
                data: { libelle },
            });
            toast.success("Rôle marchand modifié avec succès !");
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
                <div className="bg-[#0052CC] p-6 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <Edit3 className="h-5 w-5 text-white" />
                            </div>
                            Modifier le rôle marchand
                        </DialogTitle>
                    </DialogHeader>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white">
                    <div className="space-y-2">
                        <Label htmlFor="libelle" className="text-slate-700 font-medium">Libellé</Label>
                        <Input
                            id="libelle"
                            value={libelle}
                            onChange={(e) => setLibelle(e.target.value)}
                            placeholder="Ex: Superviseur Magasin"
                            required
                            className="border-slate-200 focus:border-[#0052CC] focus:ring-[#0052CC]/20 rounded-xl"
                        />
                    </div>
                    <DialogFooter className="pt-4 border-t border-slate-100 flex gap-3">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}
                            className="rounded-xl border-slate-200 text-slate-600">
                            Annuler
                        </Button>
                        <Button type="submit" disabled={isSubmitting}
                            className="bg-[#0052CC] hover:bg-[#0041A8] text-white rounded-xl font-semibold px-6">
                            {isSubmitting ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Modification...</>
                            ) : "Enregistrer"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
