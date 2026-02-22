"use client";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/axios";
import { Loader2, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; }
export function Add({ isOpen, onClose, onSuccess }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({ libelle: "", valeur: "" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setIsSubmitting(true);
        try {
            await apiFetch("/taxes/create", { method: "POST", data: { libelle: form.libelle, valeur: parseFloat(form.valeur) } });
            toast.success("Taxe créée !"); setForm({ libelle: "", valeur: "" }); onSuccess(); onClose();
        } catch (err: any) { toast.error(err.message || "Erreur"); } finally { setIsSubmitting(false); }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-gradient-to-r from-[#0052cc] to-[#1a66b3] p-6 text-white">
                    <DialogHeader><DialogTitle className="text-xl font-bold flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg"><DollarSign className="h-5 w-5" /></div>
                        Nouvelle taxe
                    </DialogTitle></DialogHeader>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white">
                    <div className="space-y-2">
                        <Label className="text-[#0052cc] font-semibold">Libellé</Label>
                        <Input value={form.libelle} onChange={e => setForm(p => ({ ...p, libelle: e.target.value }))} placeholder="TVA" required className="border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[#0052cc] font-semibold">Taux (%)</Label>
                        <Input type="number" min="0" max="100" step="0.01" value={form.valeur} onChange={e => setForm(p => ({ ...p, valeur: e.target.value }))} placeholder="18" required className="border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl" />
                    </div>
                    <DialogFooter className="pt-4 border-t border-slate-100 flex gap-3">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="rounded-xl">Annuler</Button>
                        <Button type="submit" disabled={isSubmitting} className="bg-[#0052cc] hover:bg-[#0041A8] text-white rounded-xl px-6">
                            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enregistrement...</> : "Enregistrer"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
