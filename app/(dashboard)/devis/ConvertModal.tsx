"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/axios";
import { FileText, Plus, Trash2, Wallet, Coins, ShoppingCart, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useMagasin } from "@/context/MagasinContext";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    data: any;
}

export function ConvertModal({ isOpen, onClose, onSuccess, data }: Props) {
    const { magasinId } = useMagasin();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [paiements, setPaiements] = useState<any[]>([]);
    const [caisses, setCaisses] = useState<any[]>([]);
    const [modesPaiement, setModesPaiement] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen && magasinId) {
            Promise.all([
                apiFetch(`/caisses/all/magasin/${magasinId}`),
                apiFetch(`/modePaiements/all`)
            ]).then(([cs, mp]) => {
                setCaisses(Array.isArray(cs.data) ? cs.data : cs.data?.data ?? []);
                setModesPaiement(Array.isArray(mp.data) ? mp.data : mp.data?.data ?? []);
            });
        }
    }, [isOpen, magasinId]);

    const totalRegle = useMemo(() => paiements.reduce((acc, p) => acc + parseFloat(p.montant || 0), 0), [paiements]);
    const resteAPayer = Math.max(0, (data?.montant_ttc || 0) - totalRegle);

    const handleAddPaiement = () => {
        if (resteAPayer <= 0) return;

        setPaiements([...paiements, {
            montant: resteAPayer.toString(),
            mode_paiement_id: paiements.length > 0 ? paiements[0].mode_paiement_id : "",
            caisse_id: paiements.length > 0 ? paiements[0].caisse_id : "",
            date_paiement: new Date().toISOString().split('T')[0],
            description: `Règlement Devis ${data.id}`
        }]);
    };

    const updatePaiement = (idx: number, key: string, val: any) => {
        const newP = [...paiements];
        newP[idx][key] = val;
        setPaiements(newP);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const firstPayment = paiements.length > 0 ? paiements[0] : null;

            const payload = {
                caisse_id: firstPayment ? parseInt(firstPayment.caisse_id) : 0,
                mode_paiement_id: firstPayment ? parseInt(firstPayment.mode_paiement_id) : 0,
                montant_regle: totalRegle,
                paiements: paiements.map(p => ({
                    date_paiement: new Date(p.date_paiement).toISOString(),
                    montant: parseFloat(p.montant),
                    mode_paiement_id: parseInt(p.mode_paiement_id),
                    caisse_id: parseInt(p.caisse_id),
                    description: p.description
                }))
            };

            await apiFetch(`/devis/convertToVente/${data.id}`, { method: "PUT", data: payload });
            toast.success("Devis converti en vente !");
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.message || "Erreur de conversion");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!data) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <ShoppingCart className="h-5 w-5 text-green-600" />
                    <h2 className="text-xl font-bold tracking-tight">Convertir en Vente</h2>
                </div>
            }
            size="2xl"
            footer={
                <div className="flex justify-between w-full">
                    <Button variant="ghost" onClick={onClose} className="rounded-2xl px-6">Annuler</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 rounded-2xl text-white px-10 gap-2">
                        {isSubmitting ? "Validation..." : "Valider la Vente"} <CheckCircle2 className="w-4 h-4" />
                    </Button>
                </div>
            }
        >
            <div className="px-2 space-y-6 pb-6">
                <div className="bg-[#0052cc] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                                <FileText className="w-7 h-7" />
                            </div>
                            <div>
                                <h4 className="text-lg font-black tracking-tight">{data.libelle || `Devis ${data.id}`}</h4>
                                <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest">{data.client?.nom} {data.client?.prenom}</p>
                            </div>
                        </div>
                        <div className="text-center md:text-right">
                            <p className="text-[10px] text-white/60 font-black uppercase tracking-[0.2em] mb-1">Montant TTC</p>
                            <p className="text-4xl font-black">{data.montant_ttc?.toLocaleString()} <span className="text-sm font-serif italic text-white/50">XOF</span></p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between px-2">
                    <h5 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Liste des encaissements</h5>
                    <Button onClick={handleAddPaiement} disabled={resteAPayer <= 0} className="h-9 rounded-xl bg-slate-900 hover:bg-black text-[10px] font-black tracking-widest gap-2 text-white">
                        <Plus className="w-3.5 h-3.5" /> Ajouter un paiement
                    </Button>
                </div>

                <div className="space-y-3">
                    {paiements.length === 0 ? (
                        <div className="h-32 flex flex-col items-center justify-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100 text-slate-400 gap-2">
                            <Coins className="w-8 h-8 opacity-20" />
                            <p className="text-xs font-bold font-italic">Aucun paiement (Vente à crédit totale)</p>
                        </div>
                    ) : (
                        paiements.map((p, idx) => (
                            <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-end shadow-sm animate-in slide-in-from-left-2 duration-200">
                                <div className="md:col-span-3 space-y-1.5">
                                    <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Montant</Label>
                                    <Input
                                        type="number"
                                        value={p.montant}
                                        onChange={(e) => updatePaiement(idx, "montant", e.target.value)}
                                        className="h-10 rounded-xl font-black"
                                    />
                                </div>
                                <div className="md:col-span-4 space-y-1.5">
                                    <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mode</Label>
                                    <select
                                        value={p.mode_paiement_id}
                                        onChange={(e) => updatePaiement(idx, "mode_paiement_id", e.target.value)}
                                        className="w-full h-10 rounded-xl border border-slate-200 text-xs font-bold px-3 outline-none"
                                    >
                                        <option value="">Sélectionner...</option>
                                        {modesPaiement.map(m => <option key={m.id} value={m.id}>{m.libelle}</option>)}
                                    </select>
                                </div>
                                <div className="md:col-span-4 space-y-1.5">
                                    <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Caisse</Label>
                                    <select
                                        value={p.caisse_id}
                                        onChange={(e) => updatePaiement(idx, "caisse_id", e.target.value)}
                                        className="w-full h-10 rounded-xl border border-slate-200 text-xs font-bold px-3 outline-none"
                                    >
                                        <option value="">Sélectionner...</option>
                                        {caisses.map(c => <option key={c.id} value={c.id}>{c.libelle}</option>)}
                                    </select>
                                </div>
                                <div className="md:col-span-1 flex justify-center pb-0.5">
                                    <button onClick={() => setPaiements(paiements.filter((_, i) => i !== idx))} className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        Reste à payer (Dette / Crédit)
                    </span>
                    <span className={`text-xl font-black ${resteAPayer > 0 ? "text-red-500" : "text-green-600"}`}>
                        {resteAPayer.toLocaleString()} XOF
                    </span>
                </div>
            </div>
        </Modal>
    );
}
