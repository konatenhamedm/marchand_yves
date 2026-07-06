"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/axios";
import {
    ShoppingCart, User, Plus, Trash2, Search, Calculator, Wallet, CheckCircle2,
    Barcode, Receipt, CreditCard, ScanLine, AlertCircle, X, ChevronRight, CornerDownLeft, Plug
} from "lucide-react";
import { toast } from "sonner";
import { useMagasin } from "@/context/MagasinContext";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useSession } from "next-auth/react";
import Select from "react-select";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (data?: any) => void;
}

export function AddBarcode({ isOpen, onClose, onSuccess }: Props) {
    const { data: session } = useSession() as any;
    const { magasinId } = useMagasin();
    const barcodeInputRef = useRef<HTMLInputElement>(null);
    const lastKeyTimeRef = useRef<number>(0);
    const keyVelocityCountRef = useRef<number>(0);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [isScannerConnected, setIsScannerConnected] = useState(false);
    const [barcodeMode, setBarcodeMode] = useState(true);

    const getInitialDateTime = () => {
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        return new Date(now.getTime() - offset).toISOString().slice(0, 16);
    };

    const [form, setForm] = useState({
        date_vente: getInitialDateTime(),
        client_id: "",
        user_vendeur_id: session?.user?.id || "",
        magasin_id: magasinId,
        is_credit: false,
        date_limit_credit: "",
        commentaire: "",
        commentaire_recu: "",
        lignes_vente_produits: [] as any[],
        lignes_taxe_ventes: [] as number[],
        montant_remise: 0,
        paiements: [] as any[],
        // Default direct payment
        caisse_id: "",
        mode_paiement_id: "",
        montant_regle: "",
    });

    const [clients, setClients] = useState<any[]>([]);
    const [taxes, setTaxes] = useState<any[]>([]);
    const [caisses, setCaisses] = useState<any[]>([]);
    const [modesPaiement, setModesPaiement] = useState<any[]>([]);
    const [articles, setArticles] = useState<any[]>([]);

    const [barcodeQuery, setBarcodeQuery] = useState("");
    
    // Suppression du prompt bloquant : on passe au mode "Supermarché" (ajout direct)
    const qtyInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && magasinId) {
            const fetchAll = async () => {
                const [c, t, cs, mp, a] = await Promise.all([
                    apiFetch(`/clients/all/magasin/${magasinId}`),
                    apiFetch(`/taxes/all/magasin/${magasinId}`),
                    apiFetch(`/caisses/all/magasin/${magasinId}`),
                    apiFetch(`/modePaiements/all`),
                    apiFetch(`/articles/all/magasin/${magasinId}`) // To display names if needed
                ]);
                setClients(Array.isArray(c.data) ? c.data : c.data?.data ?? []);
                setTaxes(Array.isArray(t.data) ? t.data : t.data?.data ?? []);
                const cList = Array.isArray(cs.data) ? cs.data : cs.data?.data ?? [];
                setCaisses(cList);
                const mList = Array.isArray(mp.data) ? mp.data : mp.data?.data ?? [];
                setModesPaiement(mList);
                setArticles(Array.isArray(a.data) ? a.data : a.data?.data ?? []);
                
                // Pre-select cash
                setForm(f => ({
                    ...f,
                    caisse_id: cList.length > 0 ? String(cList[0].id) : "",
                    mode_paiement_id: mList.find((m:any) => m.libelle.toLowerCase().includes("esp"))?.id || mList[0]?.id || ""
                }));
            };
            fetchAll();
            setForm(f => ({ ...f, date_vente: getInitialDateTime(), lignes_vente_produits: [] }));
            setBarcodeQuery("");
            
            setTimeout(() => {
                barcodeInputRef.current?.focus();
            }, 300);
        }
    }, [isOpen, magasinId]);

    // Écouteur global pour rattraper la douchette si on a cliqué à côté (perte de focus)
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if (!isOpen || isScanning) return;
            
            const target = e.target as HTMLElement;
            // Si on n'est pas déjà dans un champ de saisie...
            if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA" && target.tagName !== "SELECT") {
                // ...et qu'on tape un caractère visible, on force le focus dans le code barre !
                if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                    barcodeInputRef.current?.focus();
                }
            }
        };

        window.addEventListener("keydown", handleGlobalKeyDown);
        return () => window.removeEventListener("keydown", handleGlobalKeyDown);
    }, [isOpen, isScanning]);

    // Financials
    const totals = useMemo(() => {
        const totalHT = form.lignes_vente_produits.reduce((acc, l) => acc + (l.quantite * l.prix), 0);
        const totalHTAvecRemise = Math.max(0, totalHT - form.montant_remise);

        let totalTaxe = 0;
        form.lignes_taxe_ventes.forEach(taxId => {
            const tax = taxes.find(t => t.id === taxId);
            if (tax) totalTaxe += (tax.valeur / 100) * totalHTAvecRemise;
        });

        const totalTTC = totalHTAvecRemise + totalTaxe;
        const totalRegle = parseFloat(form.montant_regle || "0");
        const resteAPayer = Math.max(0, totalTTC - totalRegle);

        return { totalHT, totalHTAvecRemise, totalTaxe, totalTTC, totalRegle, resteAPayer };
    }, [form.lignes_vente_produits, form.montant_remise, form.lignes_taxe_ventes, form.montant_regle, taxes]);

    // Auto-update amount paid to match TTC (like standard POS) unless manually changed
    useEffect(() => {
        if (!form.is_credit) {
            setForm(f => ({ ...f, montant_regle: totals.totalTTC.toString() }));
        } else {
            setForm(f => ({ ...f, montant_regle: "0" }));
        }
    }, [totals.totalTTC, form.is_credit]);


    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const now = Date.now();
        // Une douchette USB tape typiquement un caractère toutes les 5 à 15 millisecondes
        if (now - lastKeyTimeRef.current < 40) {
            keyVelocityCountRef.current += 1;
        } else {
            keyVelocityCountRef.current = 1;
        }
        lastKeyTimeRef.current = now;

        // Si 6 caractères arrivent à la vitesse de l'éclair, c'est obligatoirement une douchette !
        if (keyVelocityCountRef.current >= 6 && !isScannerConnected) {
            setIsScannerConnected(true);
        }
    };

    // Traducteur de clavier pour douchette QWERTY tapant sur un OS MAC AZERTY
    // Convertit: §ç"§ç§('à&"çç => 6936965401399
    const sanitizeBarcode = (raw: string) => {
        const azertyMap: Record<string, string> = {
            '&': '1', 'é': '2', '"': '3', "'": '4', '(': '5',
            '§': '6', '-': '6', 'è': '7', '!': '8', '_': '8', 'ç': '9', 'à': '0',
            // Majuscules accidentelles si caps lock actif
            'A': 'Q', 'Q': 'A', 'Z': 'W', 'W': 'Z', 'M': ',', '?': 'M'
        };
        let res = "";
        for(let char of raw) {
            res += azertyMap[char] !== undefined ? azertyMap[char] : char;
        }
        // Nettoyer : garder uniquement chiffres et lettres (A-Z, 0-9)
        return res.replace(/[^A-Z0-9]/gi, '');
    };

    const addArticleToCart = (article: any) => {
        setForm(f => {
            const lignes = f.lignes_vente_produits.map((l: any) => ({ ...l }));
            const existingIdx = lignes.findIndex((l: any) => String(l.produit_id) === String(article.id));
            if (existingIdx >= 0) {
                lignes[existingIdx].quantite += 1;
                const moved = lignes.splice(existingIdx, 1)[0];
                lignes.push(moved);
            } else {
                lignes.push({ produit_id: article.id, quantite: 1, prix: article.prix_vente, montant_remise: 0, detail: article });
            }
            return { ...f, lignes_vente_produits: lignes };
        });
        toast.success(`${article.libelle} ajouté !`, { duration: 1000 });
    };

    const handleScanSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const codeRaw = (barcodeInputRef.current?.value || barcodeQuery).trim();
        const code = sanitizeBarcode(codeRaw);
        if (!code) return;

        // Vider et refocus immédiatement — ne jamais bloquer la douchette
        setBarcodeQuery("");
        if (barcodeInputRef.current) barcodeInputRef.current.value = "";
        barcodeInputRef.current?.focus();

        // 1. Recherche locale instantanée (0ms réseau)
        const local = articles.find((a: any) =>
            a.code_barre === code || a.reference === code || String(a.id) === code
        );
        if (local) {
            addArticleToCart(local);
            return;
        }

        // 2. Fallback API uniquement si non trouvé localement
        setIsScanning(true);
        try {
            const res = await apiFetch(`/articleProduitsServices/scan/${code}/magasin/${magasinId}`);
            if (res.status === false || !res.data) {
                toast.error(res.message || "Article non trouvé");
            } else {
                addArticleToCart(res.data);
            }
        } catch {
            toast.error("Aucun produit trouvé avec ce code-barres");
        } finally {
            setIsScanning(false);
            barcodeInputRef.current?.focus();
        }
    };

    const removeLigne = (idx: number) => {
        setForm(f => ({ ...f, lignes_vente_produits: f.lignes_vente_produits.filter((_, i) => i !== idx) }));
    };

    const handleFinalSubmit = async () => {
        if (form.lignes_vente_produits.length === 0) return toast.error("Le panier est vide.");
        if (form.is_credit && !form.client_id) return toast.error("Client requis pour crédit.");

        setIsSubmitting(true);
        try {
            const paies = [];
            if (totals.totalRegle > 0) {
                 paies.push({
                     caisse_id: form.caisse_id,
                     mode_paiement_id: form.mode_paiement_id,
                     montant: totals.totalRegle,
                     date_paiement: form.date_vente.split("T")[0],
                     description: "Versement initial (Caisse Rapide)"
                 });
            }

            const payload = {
                ...form,
                montant_ht: totals.totalHT,
                montant_ttc: totals.totalTTC,
                montant_regle: totals.totalRegle,
                montant_credit: totals.resteAPayer,
                magasin_id: magasinId,
                paiements: paies
            };

            const response = await apiFetch("/ventes/create", { method: "POST", data: payload });
            toast.success("Vente enregistrée avec succès !");
            const createdData = response.data?.vente || response.data || payload; 
            onSuccess(createdData);
            onClose();
        } catch (err: any) {
             toast.error("Erreur lors de la création de la vente");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="2xl"
            title={
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl text-white shadow-lg">
                        <Barcode className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white tracking-tight uppercase flex items-center gap-4">
                            Caisse Rapide : Code Barre
                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${isScannerConnected ? 'bg-green-500/20 text-green-300 border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-white/10 text-white/40 border border-white/5'}`}>
                                <Plug className="w-3 h-3" />
                                {isScannerConnected ? "Douchette Prête" : "En attente douchette..."}
                            </div>
                        </h2>
                        <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-widest mt-1">
                            {magasinId ? "Scannez les articles à facturer" : "..."}
                        </p>
                    </div>
                </div>
            }
            footer={
                <div className="flex justify-between items-center w-full px-4 border-t border-slate-100 bg-slate-50 rounded-b-3xl">
                    <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold uppercase tracking-wide px-6">Annuler</Button>
                    <div className="text-center">
                        <p className="text-[10px] font-black uppercase text-slate-400">Total à encaisser</p>
                        <p className="text-xl font-black text-indigo-600">{totals.totalTTC.toLocaleString()} XOF</p>
                    </div>
                    <Button onClick={handleFinalSubmit} disabled={isSubmitting || form.lignes_vente_produits.length === 0} className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-wide px-10 h-14 shadow-xl shadow-green-100/50">
                        {isSubmitting ? "Validation..." : "Encaisser & Imprimer"}
                    </Button>
                </div>
            }
        >
            <div className="flex flex-col lg:flex-row h-[calc(100vh-200px)] overflow-hidden bg-slate-100 rounded-[2rem] border border-slate-200 m-2">
                
                {/* L - SCAN && LIST */}
                <div className="flex-1 flex flex-col border-r border-slate-200 bg-white overflow-hidden relative">
                    
                    {/* Scan Input Header */}
                    <div className="p-6 bg-slate-50 border-b border-slate-200">
                           <form onSubmit={handleScanSubmit} className="relative group">
                              <Barcode className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-500 w-8 h-8 opacity-50 group-focus-within:opacity-100 transition-all" />
                              <input 
                                  ref={barcodeInputRef}
                                  type="text"
                                  autoFocus
                                  value={barcodeQuery}
                                  onChange={(e) => setBarcodeQuery(sanitizeBarcode(e.target.value))}
                                  onKeyDown={handleKeyDown}
                                  placeholder="Scannez ou saisissez le code-barres de l'article..."
                                  className="w-full text-2xl h-20 pl-20 pr-6 rounded-2xl bg-white border-2 border-indigo-100 text-slate-800 font-black shadow-inner focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all placeholder:text-slate-300"
                                  disabled={isScanning}
                              />
                               {isScanning && <div className="absolute right-6 top-1/2 -translate-y-1/2 text-indigo-500 font-bold animate-pulse text-xs">Recherche...</div>}
                           </form>
                    </div>

                    {/* Lignes Items */}
                    <div className="flex-1 overflow-y-auto bg-white p-6">
                        {form.lignes_vente_produits.length === 0 ? (
                           <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-4 opacity-50">
                               <ScanLine className="w-24 h-24" />
                               <p className="font-bold text-lg">En attente du premier article...</p>
                               <Button variant="outline" onClick={() => barcodeInputRef.current?.focus()}>Forcer le Focus Scanneur</Button>
                           </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b-2 border-slate-100">
                                        <th className="pb-3">Article Scanné</th>
                                        <th className="pb-3 text-center">Qté</th>
                                        <th className="pb-3 text-right">PU (XOF)</th>
                                        <th className="pb-3 text-right">Total (XOF)</th>
                                        <th className="pb-3"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...form.lignes_vente_produits].reverse().map((item, idx) => {
                                        const trueIdx = form.lignes_vente_produits.length - 1 - idx;
                                        return (
                                            <tr key={trueIdx} className={`border-b border-slate-50 transition-colors ${idx === 0 ? "bg-indigo-50/50" : ""}`}>
                                                <td className="py-4">
                                                    <p className="font-black text-slate-800 text-base">{item.detail?.libelle}</p>
                                                </td>
                                                <td className="py-4 text-center">
                                                    <input 
                                                        id={`qty-input-${item.produit_id}`}
                                                        type="number" 
                                                        min="0.1"
                                                        step="any"
                                                        value={item.quantite}
                                                        onChange={(e) => {
                                                            const newQte = parseFloat(e.target.value) || 0;
                                                            setForm(f => {
                                                                const nl = [...f.lignes_vente_produits];
                                                                nl[trueIdx].quantite = newQte;
                                                                return { ...f, lignes_vente_produits: nl };
                                                            });
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                barcodeInputRef.current?.focus();
                                                            }
                                                        }}
                                                        className="w-16 h-8 text-center font-bold text-indigo-600 border border-indigo-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                                    />
                                                </td>
                                                <td className="py-4 text-right font-medium text-slate-500">{item.prix.toLocaleString()}</td>
                                                <td className="py-4 text-right font-black text-indigo-600 text-lg">{(item.prix * item.quantite).toLocaleString()}</td>
                                                <td className="py-4 text-right pl-4">
                                                    <Button variant="ghost" onClick={() => removeLigne(trueIdx)} className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl">
                                                        <Trash2 className="w-5 h-5" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* R - CHECKOUT FORM */}
                <div className="w-full lg:w-[400px] xl:w-[450px] bg-slate-50 flex flex-col p-6 overflow-y-auto space-y-6">
                    <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest flex items-center gap-2 border-b border-slate-200 pb-2">
                        <Wallet className="w-4 h-4 text-indigo-400" /> Options d'Encaissement
                    </h3>
                    
                    <div className="space-y-4">
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Client Associé</Label>
                            <Select
                                instanceId="barcode-client-select"
                                options={clients.map(c => ({ value: c.id, label: `${c.nom} ${c.prenom}` }))}
                                value={form.client_id ? { value: form.client_id, label: clients.find(c => String(c.id) === String(form.client_id)) ? `${clients.find(c => String(c.id) === String(form.client_id))?.nom} ${clients.find(c => String(c.id) === String(form.client_id))?.prenom}` : "" } : null}
                                onChange={(sel: any) => setForm({ ...form, client_id: sel?.value || "" })}
                                placeholder="Passant Anonyme"
                                isClearable
                                className="text-sm font-bold shadow-sm"
                                styles={{ control: (base: any, state: any) => ({ ...base, minHeight: '44px', borderRadius: '0.75rem', borderColor: state.isFocused ? '#94a3b8' : '#e2e8f0', boxShadow: 'none' }), menuPortal: base => ({...base, zIndex:9999}) }}
                                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-orange-50 rounded-2xl border border-orange-100">
                             <div>
                                <h4 className="font-black text-orange-900 text-sm">Mettre à crédit ?</h4>
                                <p className="text-[10px] text-orange-600/70 font-bold uppercase tracking-widest">Paiement ultérieur</p>
                             </div>
                             <Checkbox checked={form.is_credit} onCheckedChange={(c) => setForm({ ...form, is_credit: !!c })} className="w-6 h-6 border-2 border-orange-400" />
                        </div>
                        
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4">Finalisation</Label>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-slate-100 p-3 rounded-xl border border-slate-200">
                                    <span className="font-bold text-slate-500 text-xs uppercase uppercase">Remise Globale</span>
                                    <input type="number" min="0" value={form.montant_remise || ""} placeholder="0" onChange={e => setForm({...form, montant_remise: parseFloat(e.target.value)||0})} className="w-24 text-right bg-transparent outline-none font-black text-indigo-600"/>
                                </div>
                                
                                {!form.is_credit && (
                                   <>
                                      <div className="flex gap-4">
                                        <div className="flex-1 space-y-1">
                                            <Label className="text-[9px] font-black text-slate-400 uppercase">Caisse <span className="text-red-500">*</span></Label>
                                            <Select
                                                instanceId="barcode-caisse-select"
                                                options={caisses.map(c => ({ value: c.id, label: c.libelle }))}
                                                value={form.caisse_id ? { value: form.caisse_id, label: caisses.find(c => String(c.id) === String(form.caisse_id))?.libelle } : null}
                                                onChange={(sel: any) => setForm({ ...form, caisse_id: sel?.value || "" })}
                                                placeholder="Sélectionner..."
                                                isClearable
                                                styles={{ control: (base) => ({ ...base, minHeight: '2.5rem', borderRadius: '0.75rem', borderColor: '#e2e8f0', backgroundColor: '#f8fafc', fontSize: '0.75rem', fontWeight: 700 }) }}
                                            />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <Label className="text-[9px] font-black text-slate-400 uppercase">Paiement <span className="text-red-500">*</span></Label>
                                            <Select
                                                instanceId="barcode-paiement-select"
                                                options={modesPaiement.map(m => ({ value: m.id, label: m.libelle }))}
                                                value={form.mode_paiement_id ? { value: form.mode_paiement_id, label: modesPaiement.find(m => String(m.id) === String(form.mode_paiement_id))?.libelle } : null}
                                                onChange={(sel: any) => setForm({ ...form, mode_paiement_id: sel?.value || "" })}
                                                placeholder="Sélectionner..."
                                                isClearable
                                                styles={{ control: (base) => ({ ...base, minHeight: '2.5rem', borderRadius: '0.75rem', borderColor: '#e2e8f0', backgroundColor: '#f8fafc', fontSize: '0.75rem', fontWeight: 700 }) }}
                                            />
                                        </div>
                                      </div>
                                      <div className="pt-2 border-t border-slate-100">
                                         <Label className="text-[9px] font-black text-green-600 uppercase">Montant Reçu (Monnaie à Rendre)</Label>
                                         <Input type="number" value={form.montant_regle} onChange={e => setForm({...form, montant_regle: e.target.value})} className="h-14 mt-1 text-2xl font-black text-right text-green-700 bg-green-50 border-green-200 rounded-xl"/>
                                         {totals.resteAPayer < 0 && (
                                              <p className="text-right text-xs pt-1 font-bold text-amber-500">Monnaie : {Math.abs(totals.resteAPayer).toLocaleString()} XOF</p>
                                         )}
                                      </div>
                                   </>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </Modal>
    );
}
