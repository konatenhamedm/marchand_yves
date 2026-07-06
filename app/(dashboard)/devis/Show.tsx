"use client";

import React, { useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { FileText, User, Calendar, Receipt, Download } from "lucide-react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    data: any;
}

const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString("fr-FR") : "—";
const fmt = (v?: number) => v ? v.toLocaleString("fr-FR") : "0";

export function Show({ isOpen, onClose, data }: Props) {
    if (!data) return null;

    const lignes = data.ligneProduits || data.lignes_produits || [];

    const getStatusText = (s: string) => {
        switch (s) {
            case "en_attente": return "En Attente";
            case "accepte": return "Accepté";
            case "refuse": return "Refusé";
            case "expire": return "Expiré";
            default: return "Inconnu";
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg">
                        <FileText className="h-5 w-5" />
                    </div>
                    Détails du Devis #{data.id}
                </div>
            }
            size="2xl"
            footer={
                <div className="flex justify-between w-full">
                    <Button variant="ghost" onClick={onClose} className="rounded-2xl px-6">
                        Fermer
                    </Button>
                </div>
            }
        >
            <div className="px-6 py-4 space-y-8">
                {/* En-tête */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Informations</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-xs font-bold text-slate-500">Date du devis</span>
                                <span className="text-xs font-black text-slate-700">{fmtDate(data.date_devis)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-xs font-bold text-slate-500">Expiration</span>
                                <span className="text-xs font-black text-slate-700">{fmtDate(data.date_expiration)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-xs font-bold text-slate-500">Statut</span>
                                <span className="text-xs font-black text-indigo-600">{getStatusText(data.statut)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-xs font-bold text-slate-500">Nom et Prénom</span>
                                <span className="text-xs font-black text-slate-700 w-32 truncate text-right">{data.client?.nom} {data.client?.prenom}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-xs font-bold text-slate-500">Téléphone</span>
                                <span className="text-xs font-black text-slate-700">{data.client?.telephone || "—"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-xs font-bold text-slate-500">Email</span>
                                <span className="text-xs font-black text-slate-700 truncate w-32 text-right">{data.client?.email || "—"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Articles */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Receipt className="w-5 h-5 text-[#0052cc]" />
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Articles ou Services</h4>
                    </div>

                    <div className="border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                        <table className="w-full text-xs">
                            <thead className="bg-[#0052cc] text-white">
                                <tr>
                                    <th className="px-4 py-3 text-left font-bold uppercase">N°</th>
                                    <th className="px-4 py-3 text-left font-bold uppercase">Désignation</th>
                                    <th className="px-4 py-3 text-center font-bold uppercase">Px Unitaire</th>
                                    <th className="px-4 py-3 text-center font-bold uppercase">Qté</th>
                                    <th className="px-4 py-3 text-right font-bold uppercase">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 bg-white">
                                {lignes.map((line: any, index: number) => {
                                    const prix = line.prix_unitaire || line.prix || 0;
                                    const qte = line.quantite || 0;
                                    const total = prix * qte;
                                    return (
                                        <tr key={index}>
                                            <td className="px-4 py-3 font-bold text-slate-500">{index + 1}</td>
                                            <td className="px-4 py-3 text-slate-700 font-bold">{line.produit?.libelle || line.libelle_produit || "Inconnu"}</td>
                                            <td className="px-4 py-3 text-center text-slate-600">{fmt(prix)}</td>
                                            <td className="px-4 py-3 text-center text-slate-600 font-bold">{qte}</td>
                                            <td className="px-4 py-3 text-right font-bold text-[#0052cc]">{fmt(total)}</td>
                                        </tr>
                                    );
                                })}
                                {lignes.length === 0 && (
                                    <tr><td colSpan={5} className="py-6 text-center text-slate-400">Aucun article enregistré dans ce devis.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between pt-6 border-t border-slate-100 gap-6">
                    <div className="flex-1 space-y-3">
                        {data.commentaire && (
                            <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-600">
                                <strong>Notes/Conditions:</strong><br/>
                                {data.commentaire}
                            </div>
                        )}
                    </div>
                    
                    <div className="w-full md:w-64 space-y-4">
                        <div className="bg-slate-900 rounded-2xl p-6 text-white text-right">
                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Montant TTC</p>
                            <p className="text-3xl font-black">{fmt(data.montant_ttc)} <span className="text-xs italic font-serif">XOF</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
