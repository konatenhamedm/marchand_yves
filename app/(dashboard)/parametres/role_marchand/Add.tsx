"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Modal, ModalFooterButtons } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/axios";
import { ShieldPlus } from "lucide-react";
import { toast } from "sonner";

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; }

export function Add({ isOpen, onClose, onSuccess, size = "md" }: Props) {
    const { data: session } = useSession();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [libelle, setLibelle] = useState("");
    const [featuresList, setFeaturesList] = useState<any[]>([]);
    const [selectedFeatures, setSelectedFeatures] = useState<number[]>([]);

    useEffect(() => {
        if (isOpen) {
            apiFetch("/features/all", { provenance: false, method: "GET" })
                .then(res => setFeaturesList(Array.isArray(res.data) ? res.data : (res.data?.data ?? [])))
                .catch(err => console.error(err));
        }
    }, [isOpen]);

    const handleFeatureToggle = (id: number) => {
        setSelectedFeatures(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsSubmitting(true);
        try {
            await apiFetch("/roles/create", {
                method: "POST",
                provenance: true,
                data: {
                    libelle: libelle,
                    user_owner_id: (session?.user as any)?.id || 1,
                    features: selectedFeatures
                }
            });
            toast.success("Rôle marchand créé !");
            setLibelle(""); 
            setSelectedFeatures([]);
            onSuccess(); onClose();
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de la création");
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
                    <div className="bg-white/20 p-2 rounded-lg"><ShieldPlus className="h-5 w-5" /></div>
                    Nouveau rôle marchand
                </div>
            }
            size="lg"
            footer={
                <ModalFooterButtons
                    onCancel={onClose}
                    onConfirm={handleSubmit}
                    confirmText={isSubmitting ? "Enregistrement..." : "Enregistrer"}
                    isLoading={isSubmitting}
                />
            }
        >
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
                <div className="space-y-2">
                    <Label className="text-[#0052cc] font-semibold">Libellé du rôle *</Label>
                    <Input
                        value={libelle}
                        onChange={e => setLibelle(e.target.value)}
                        placeholder="Ex: Admin, Vendeur..."
                        required
                        className="border-[#0052cc]/30 focus:border-[#0052cc] rounded-xl"
                    />
                </div>
                
              {/*   <div className="space-y-3">
                    <Label className="text-[#0052cc] font-semibold">Permissions (Fonctionnalités)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 max-h-[300px] overflow-y-auto">
                        {featuresList.map(feat => (
                            <label key={feat.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-200">
                                <input 
                                    type="checkbox" 
                                    checked={selectedFeatures.includes(feat.id)}
                                    onChange={() => handleFeatureToggle(feat.id)}
                                    className="w-4 h-4 text-[#0052cc] rounded border-slate-300 focus:ring-[#0052cc]"
                                />
                                <span className="text-sm font-medium text-slate-700">{feat.libelle}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <p className="text-xs text-slate-400 italic">
                    Note: Le rôle sera rattaché à votre compte.
                </p> */}
            </form>
        </Modal>
    );
}
