"use client";

import React, { useEffect, useState } from "react";
import { ClientOnly } from "@/components/ui/client-only";
import {
    ShoppingBag, Store, Calendar, User, Wallet, Plus, Clock,
    CheckCircle2, AlertCircle, Search, Package, ArrowRight,
    Trash2, Filter, Receipt, CreditCard, FileText
} from "lucide-react";
import { apiFetch } from "@/lib/axios";
import { Pagination } from "@/components/ui/pagination";
import { usePaginationData } from "@/hooks/usePaginationData";
import { TableHeaderCustom } from "@/components/ui/TableHeaderCustom";
import {
    PageHeader, SearchBar, DataTable,
    TableSkeletonRows, EmptyState, TD, PrimaryButton,
} from "@/components/ui/page-components";
import { useMagasin } from "@/context/MagasinContext";
import { Show } from "./Show";
import { Delete } from "./Delete";
import { Add } from "./Add";
import { Paiement } from "./Paiement";
import { FactureAchatModal } from "./FactureAchatModal";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePermissions } from "@/hooks/usePermissions";
import { useCurrency } from "@/hooks/useCurrency";

const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString("fr-FR") : "—";

export default function AchatsPage() {
    const { canCreate, canEdit, canDelete } = usePermissions("gestionAchatArticles");
    const { formatAmount } = useCurrency();
    const { magasinId, magasin, isLoading: magasinLoading } = useMagasin();
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    
    const { 
        data, 
        currentPage, 
        setCurrentPage, 
        totalItems, 
        itemsPerPage, 
        handleApiResponse,
        getFilteredData,
        getPaginatedItems,
        isBackendPaginated,
    } = usePaginationData(10);

    // Filters state
    const [filterType, setFilterType] = useState<"all" | "non-soldes">("all");
    const [filters, setFilters] = useState({
        date_debut: "",
        date_fin: "",
    });

    const [selecteditem, setSelecteditem] = useState<any | null>(null);
    const [modalType, setModalType] = useState<"view" | "delete" | "add" | "paiement" | "facture" | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const refreshData = () => {
        if (!magasinId) return;
        setIsLoading(true);

        let endpoint = `/achatProduits/all/magasin/${magasinId}`;
        if (filterType === "non-soldes") endpoint = `/achatProduits/non-soldes/magasin/${magasinId}`;

        const params = new URLSearchParams();
        params.append("per_page", itemsPerPage.toString());
        params.append("page", currentPage.toString());
        if (filters.date_debut) params.append("date_debut", filters.date_debut);
        if (filters.date_fin) params.append("date_fin", filters.date_fin);

        const url = params.toString() ? `${endpoint}?${params.toString()}` : endpoint;

        apiFetch(url)
            .then((res) => {
                handleApiResponse(res);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    };

    useEffect(() => {
        if (magasinId) refreshData();
    }, [magasinId, filterType]);

    const handleOpenModal = (type: typeof modalType, item?: any) => { setModalType(type); if (item) setSelecteditem(item); };
    const handleCloseModal = () => { setModalType(null); setSelecteditem(null); };

    const filteredData = getFilteredData(searchTerm, ["fournisseur.nom", "commentaire"]);
    const currentitems = getPaginatedItems(filteredData);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) setSelectedIds(currentitems.map((item) => item.id));
        else setSelectedIds([]);
    };

    const handleSelectItem = (id: number) => {
        setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
    };

    const COLS = 8;

    if (!magasinId && !magasinLoading) {
        return (
            <ClientOnly>
                <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                    <Store className="w-12 h-12 text-slate-300" />
                    <p className="text-slate-500 font-medium">Veuillez sélectionner un magasin dans la barre latérale</p>
                </div>
            </ClientOnly>
        );
    }

    const getStatusBadge = (item: any) => {
        if (item.montant_credit <= 0) {
            return <Badge className="bg-green-50 text-green-700 border-green-100 font-bold uppercase text-[9px]">Soldé</Badge>;
        }
        return <Badge className="bg-orange-50 text-orange-700 border-orange-100 font-bold uppercase text-[9px]">À Crédit</Badge>;
    };

    return (
        <ClientOnly>
            <div className="space-y-6">
                <PageHeader
                    title="Achats Articles"
                    description={`Gestion des stocks & approvisionnements — ${magasin?.libelle ?? "Magasin"}`}
                    count={isBackendPaginated ? totalItems : filteredData.length}
                    action={
                        <div className="flex gap-2">
                            {selectedIds.length > 0 && canDelete && (
                                <button onClick={() => { setModalType("delete"); setSelecteditem(null); }} className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md flex items-center gap-2 text-sm transition-colors h-10">
                                    <Trash2 className="w-4 h-4" /> Supprimer ({selectedIds.length})
                                </button>
                            )}
                            {canCreate && (
                                <PrimaryButton onClick={() => handleOpenModal("add")} className="h-10">
                                    <Plus className="w-4 h-4" />
                                    Nouvel Achat
                                </PrimaryButton>
                            )}
                        </div>
                    }
                />

                {/* Filter Panels */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
                        <div className="flex bg-slate-100/80 p-1.5 rounded-2xl gap-1 self-start">
                            {[
                                { id: "all", label: "Tous les achats", icon: ShoppingBag },
                                { id: "non-soldes", label: "Achats à crédit", icon: Clock },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setFilterType(tab.id as any)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${filterType === tab.id
                                            ? "bg-white text-[#0052cc] shadow-sm scale-105"
                                            : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-wrap items-end gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] text-slate-400 font-black uppercase tracking-widest pl-1">Du</Label>
                                <Input type="date" value={filters.date_debut} onChange={(e) => setFilters({ ...filters, date_debut: e.target.value })} className="h-10 text-xs rounded-xl border-slate-200 focus:ring-4 focus:ring-[#0052cc]/5 bg-slate-50/30" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] text-slate-400 font-black uppercase tracking-widest pl-1">Au</Label>
                                <Input type="date" value={filters.date_fin} onChange={(e) => setFilters({ ...filters, date_fin: e.target.value })} className="h-10 text-xs rounded-xl border-slate-200 focus:ring-4 focus:ring-[#0052cc]/5 bg-slate-50/30" />
                            </div>
                            <PrimaryButton onClick={refreshData} className="h-10 rounded-xl px-6 text-xs font-black uppercase tracking-widest">
                                <Filter className="w-4 h-4 mr-2" /> Filtrer
                            </PrimaryButton>
                        </div>
                    </div>
                </div>

                <SearchBar
                    value={searchTerm}
                    onChange={(v) => { setSearchTerm(v); setCurrentPage(1); }}
                    placeholder="Filtrer par fournisseur ou commentaire..."
                    onRefresh={refreshData}
                    isLoading={isLoading}
                />

                <DataTable
                    title="Registre des approvisionnements"
                    titleIcon={<Package className="w-4 h-4" />}
                    footer={
                        <Pagination
                            currentPage={currentPage}
                            totalItems={isBackendPaginated ? totalItems : filteredData.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={(p) => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        />
                    }
                >
                    <table className="w-full">
                        <TableHeaderCustom
                            items={[
                               /*  <input 
                                    type="checkbox" 
                                    className="cursor-pointer"
                                    checked={currentitems.length > 0 && selectedIds.length === currentitems.length} 
                                    onChange={handleSelectAll} 
                                />, */
                                "Date", "Fournisseur", "Total Achat", "Réglé", "Solde Dû", "Statut"
                            ]}
                            afficheAction={true}
                            actionWidth="120px"
                        />
                        <tbody>
                            {isLoading ? (
                                <TableSkeletonRows cols={COLS} />
                            ) : currentitems.length === 0 ? (
                                <EmptyState message="Aucun achat enregistré" icon={<ShoppingBag className="w-10 h-10" />} cols={COLS} />
                            ) : (
                                currentitems.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors duration-100 group">
                                      {/*   <td className={TD.muted}>
                                            <input 
                                                type="checkbox" 
                                                className="cursor-pointer"
                                                checked={selectedIds.includes(item.id)} 
                                                onChange={() => handleSelectItem(item.id)} 
                                            />
                                        </td> */}
                                        <td className={TD.base}>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-700">{fmtDate(item.date_achat)}</span>
                                                <span className="text-[9px] text-slate-400 font-black uppercase">ID-{item.id}</span>
                                            </div>
                                        </td>
                                        <td className={TD.bold}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] text-slate-500 font-black uppercase">
                                                    {item.fournisseur?.nom?.substring(0, 2) || "FR"}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[13px] font-black text-slate-700 truncate max-w-[150px]">{item.fournisseur?.nom || "Non spécifié"}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium">{item.fournisseur?.tel || "Pas de contact"}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={TD.mono}>
                                            <div className="flex flex-col">
                                                <span className="text-slate-900 font-black">{formatAmount(item.montant_ht + (item.total_taxe || 0) - (item.montant_remise || 0))}</span>
                                                <span className="text-[9px] text-slate-400 font-bold uppercase">HT: {formatAmount(item.montant_ht)}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-sm font-black text-green-600 border-b border-slate-100">
                                            {formatAmount(item.montant_regle)}
                                        </td>
                                        <td className={`px-4 py-3.5 text-sm border-b border-slate-100 font-black ${item.montant_credit > 0 ? "text-red-500" : "text-slate-300"}`}>
                                            {formatAmount(item.montant_credit)}
                                        </td>
                                        <td className={TD.base}>
                                            {getStatusBadge(item)}
                                        </td>
                                        <td className={TD.action}>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => handleOpenModal("facture", item)} title="Télécharger le reçu" className="p-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                                                    <FileText className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleOpenModal("view", item)} className="p-2 rounded-xl bg-[#0052cc]/5 text-[#0052cc] hover:bg-[#0052cc] hover:text-white transition-all shadow-sm">
                                                    <ArrowRight className="w-4 h-4" />
                                                </button>
                                                {item.montant_credit > 0 && (
                                                    <button onClick={() => handleOpenModal("paiement", item)} title="Enregistrer un paiement" className="p-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all shadow-sm">
                                                        <Wallet className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {canDelete && (
                                                  <button onClick={() => handleOpenModal("delete", item)} className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </DataTable>

                {modalType === "add" && <Add isOpen={true} onClose={handleCloseModal} onSuccess={refreshData} />}
                {modalType === "paiement" && selecteditem && <Paiement isOpen={true} onClose={handleCloseModal} data={selecteditem} onSuccess={refreshData} />}
                {modalType === "facture" && selecteditem && <FactureAchatModal isOpen={true} onClose={handleCloseModal} data={selecteditem} />}

                {selecteditem && modalType === "view" && (
                    <Show isOpen={true} onClose={handleCloseModal} data={selecteditem} />
                )}
                {(selecteditem || (selectedIds.length > 0 && modalType === "delete")) && (
                    <Delete 
                        isOpen={modalType === "delete"} 
                        onClose={handleCloseModal} 
                        data={selecteditem} 
                        multiple={!selecteditem && selectedIds.length > 0}
                        selectedIds={selectedIds}
                        onSuccess={() => { refreshData(); setSelectedIds([]); }} 
                    />
                )}
            </div>
        </ClientOnly>
    );
}
