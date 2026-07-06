"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ClientOnly } from "@/components/ui/client-only";
import { ShoppingCart, Store, Filter, Calendar, User, Wallet, UserCheck, Plus, Trash2, Search, RefreshCw, Eye, Edit3, ArrowUpRight, CheckCircle2, Clock, ScanLine, CreditCard, ListFilter, FileText, EyeClosed, EyeIcon, Printer } from "lucide-react";
import { apiFetch } from "@/lib/axios";
import { Pagination } from "@/components/ui/pagination";
import { usePaginationData } from "@/hooks/usePaginationData";
import { TableHeaderCustom } from "@/components/ui/TableHeaderCustom";
import {
    PageHeader, SearchBar, DataTable,
    TableSkeletonRows, EmptyState, TD, PrimaryButton,
} from "@/components/ui/page-components";
import { useMagasin } from "@/context/MagasinContext";
import { Add } from "./Add";
import { Delete } from "./Delete";
import { Show } from "./Show";
import { Paiement } from "./Paiement";
import { FactureModal } from "./FactureModal";
import { PrintTicketModal } from "./PrintTicketModal";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePermissions } from "@/hooks/usePermissions";
import { useCurrency } from "@/hooks/useCurrency";

const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString("fr-FR") : "—";

export default function VentesPage() {
    const { canCreate, canEdit, canDelete } = usePermissions("gestionVentes");
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
    const [filters, setFilters] = useState({
        date_debut: "",
        date_fin: "",
        caisse_id: "",
        vendeur_id: "",
        client_id: ""
    });

    // Dropdown data
    const [caisses, setCaisses] = useState<any[]>([]);
    const [vendeurs, setVendeurs] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);

    const [selecteditem, setSelecteditem] = useState<any | null>(null);
    const [modalType, setModalType] = useState<"view" | "delete" | "add" | "paiement" | "facture" | "print_ticket" | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const router = useRouter();

    const refreshData = (isTodayOnly = false) => {
        if (!magasinId) return;
        setIsLoading(true);

        let endpoint = isTodayOnly
            ? `/ventes/all-of-day/magasin/${magasinId}`
            : `/ventes/all/magasin/${magasinId}`;

        // Build query string
        const params = new URLSearchParams();
        params.append("per_page", itemsPerPage.toString());
        params.append("page", currentPage.toString());
        if (!isTodayOnly) {
            if (filters.date_debut) params.append("date_debut", filters.date_debut);
            if (filters.date_fin) params.append("date_fin", filters.date_fin);
            if (filters.caisse_id) params.append("caisse_id", filters.caisse_id);
            if (filters.vendeur_id) params.append("vendeur_id", filters.vendeur_id);
            if (filters.client_id) params.append("client_id", filters.client_id);
        }

        const url = params.toString() ? `${endpoint}?${params.toString()}` : endpoint;

        apiFetch(url)
            .then((res) => {
                handleApiResponse(res);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    };

    const fetchFiltersData = () => {
        if (!magasinId) return;
        // Fetch caisses
        apiFetch(`/caisses/all/magasin/${magasinId}?per_page=${itemsPerPage}&page=${currentPage}`).then(res => setCaisses(Array.isArray(res.data) ? res.data : res.data?.data ?? [])).catch(() => { });
        // Fetch personnels (vendeurs)
        apiFetch(`/personnels/all/magasin/${magasinId}?per_page=${itemsPerPage}&page=${currentPage}`).then(res => setVendeurs(Array.isArray(res.data) ? res.data : res.data?.data ?? [])).catch(() => { });
        // Fetch clients
        apiFetch(`/clients/all/magasin/${magasinId}?per_page=${itemsPerPage}&page=${currentPage}`).then(res => setClients(Array.isArray(res.data) ? res.data : res.data?.data ?? [])).catch(() => { });
    };

    useEffect(() => {
        if (magasinId) {
            refreshData();
            fetchFiltersData();
        }
    }, [magasinId, currentPage]);

    const handleOpenModal = (type: typeof modalType, item?: any) => { setModalType(type); if (item) setSelecteditem(item); };
    const handleCloseModal = () => { setModalType(null); setSelecteditem(null); };

    const filteredData = getFilteredData(searchTerm, ["ref_vente", "client.nom", "client.prenom"]);
    const currentitems = getPaginatedItems(filteredData);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) setSelectedIds(currentitems.map((item) => item.id));
        else setSelectedIds([]);
    };

    const handleSelectItem = (id: number) => {
        setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
    };

    const COLS = 10;

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
        if (item.montant_regle >= item.montant_ttc) {
            return <Badge className="bg-green-50 text-green-700 border-green-100 font-bold">Payée</Badge>;
        }
        if (item.montant_credit > 0) {
            return <Badge className="bg-orange-50 text-orange-700 border-orange-100 font-bold">Crédit</Badge>;
        }
        return <Badge className="bg-red-50 text-red-700 border-red-100 font-bold">Non payée</Badge>;
    };

    return (
        <ClientOnly>
            <div className="space-y-6">
                <PageHeader
                    title="Ventes"
                    description={`Gestion des transactions — ${magasin?.libelle ?? "Magasin"}`}
                    count={isBackendPaginated ? totalItems : filteredData.length}
                    action={
                        <div className="flex gap-2">
                            {selectedIds.length > 0 && canDelete && (
                                <button onClick={() => { setModalType("delete"); setSelecteditem(null); }} className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md flex items-center gap-2 text-sm transition-colors h-10">
                                    <Trash2 className="w-4 h-4" /> Supprimer ({selectedIds.length})
                                </button>
                            )}
                            <button
                                onClick={() => refreshData(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-all shadow-sm h-10"
                            >
                                <Clock className="w-4 h-4 text-[#0052cc]" />
                                Ventes du jour
                            </button>
                            {canCreate && (
                                <>
                                   {/*  <PrimaryButton onClick={() => router.push('/ventes/pos')} className="h-10 bg-indigo-600 hover:bg-indigo-700">
                                        <ScanLine className="w-4 h-4 mr-2" />
                                        Vente Barcode
                                    </PrimaryButton> */}
                                    <PrimaryButton onClick={() => handleOpenModal("add")} className="h-10">
                                        <Plus className="w-4 h-4" />
                                        Nouvelle Vente
                                    </PrimaryButton>
                                </>
                            )}
                        </div>
                    }
                />

                {/* Filters Panel */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-slate-800 font-black text-[10px] uppercase tracking-widest border-b border-slate-50 pb-3">
                        <Filter className="w-3.5 h-3.5" /> Filtres Avancés
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] text-slate-400 font-bold uppercase">Début</Label>
                            <Input type="date" value={filters.date_debut} onChange={(e) => setFilters({ ...filters, date_debut: e.target.value })} className="h-9 text-xs rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] text-slate-400 font-bold uppercase">Fin</Label>
                            <Input type="date" value={filters.date_fin} onChange={(e) => setFilters({ ...filters, date_fin: e.target.value })} className="h-9 text-xs rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] text-slate-400 font-bold uppercase">Caisse</Label>
                            <select value={filters.caisse_id} onChange={(e) => setFilters({ ...filters, caisse_id: e.target.value })} className="w-full h-9 rounded-xl border border-slate-200 text-xs px-2 outline-none focus:ring-2 focus:ring-[#0052cc]/10">
                                <option value="">Toutes</option>
                                {caisses.map(c => <option key={c.id} value={c.id}>{c.libelle}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] text-slate-400 font-bold uppercase">Vendeur</Label>
                            <select value={filters.vendeur_id} onChange={(e) => setFilters({ ...filters, vendeur_id: e.target.value })} className="w-full h-9 rounded-xl border border-slate-200 text-xs px-2 outline-none focus:ring-2 focus:ring-[#0052cc]/10">
                                <option value="">Tous</option>
                                {vendeurs.map(v => <option key={v.id} value={v.id}>{v.nom} {v.prenoms}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] text-slate-400 font-bold uppercase">Client</Label>
                            <select value={filters.client_id} onChange={(e) => setFilters({ ...filters, client_id: e.target.value })} className="w-full h-9 rounded-xl border border-slate-200 text-xs px-2 outline-none focus:ring-2 focus:ring-[#0052cc]/10">
                                <option value="">Tous</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.nom} {c.prenom}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end pt-2">
                        <PrimaryButton onClick={() => refreshData()} className="h-9 px-6 text-xs rounded-xl">
                            Appliquer les filtres
                        </PrimaryButton>
                    </div>
                </div>

                <SearchBar
                    value={searchTerm}
                    onChange={(v) => { setSearchTerm(v); setCurrentPage(1); }}
                    placeholder="Filtrer par référence ou nom client..."
                    onRefresh={() => refreshData()}
                    isLoading={isLoading}
                />

                <DataTable
                    title="Historique des ventes"
                    titleIcon={<ShoppingCart className="w-4 h-4" />}
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
                                "Référence", "Date", "Client", "Vendeur", "Net à payer", "Réglé", "Solde dû", "Statut"
                            ]}
                            afficheAction={true}
                            actionWidth="120px"
                        />
                        <tbody>
                            {isLoading ? (
                                <TableSkeletonRows cols={COLS} />
                            ) : currentitems.length === 0 ? (
                                <EmptyState message="Aucune transaction trouvée" icon={<ShoppingCart className="w-10 h-10" />} cols={COLS} />
                            ) : (
                                currentitems.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors duration-100 group">
                                       {/*  <td className={TD.muted}>
                                            <input 
                                                type="checkbox" 
                                                className="cursor-pointer"
                                                checked={selectedIds.includes(item.id)} 
                                                onChange={() => handleSelectItem(item.id)} 
                                            />
                                        </td> */}
                                        <td className={TD.mono}>{item.id}</td>
                                        <td className={TD.base}>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-700">{fmtDate(item.date_vente)}</span>
                                                {/* <span className="text-[10px] text-slate-400 font-medium font-mono uppercase">VTE-{item.id}</span> */}
                                            </div>
                                        </td>
                                        <td className={TD.bold}>
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] text-slate-500 font-bold uppercase">
                                                    {item.client?.nom?.substring(0, 2) || "AN"}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-slate-700">{item.client ? `${item.client.nom}` : "Client Anonyme"}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium">{item.client?.tel || "—"}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={TD.base}>
                                            <span className="text-[11px] font-bold text-slate-500 uppercase">{item.user_vendeur?.nom}</span>
                                        </td>
                                        <td className={TD.mono}>
                                            <span className="text-slate-900 font-black">{formatAmount(item.montant_ttc)}</span>
                                        </td>
                                        <td className="px-4 py-3.5 border-b border-slate-100">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-green-600 font-mono">{formatAmount(item.montant_regle)}</span>
                                                <span className="text-[9px] text-slate-400 font-bold uppercase">{item.mode_paiement?.libelle || "Multiple"}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 border-b border-slate-100">
                                            <span className={`text-sm font-black font-mono ${item.montant_credit > 0 ? "text-red-500" : "text-slate-300"}`}>
                                                {formatAmount(item.montant_credit)}
                                            </span>
                                        </td>
                                        <td className={TD.base}>
                                            {getStatusBadge(item)}
                                        </td>
                                        <td className={TD.action}>
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => handleOpenModal("print_ticket", item)} title="Imprimer le ticket" className="p-1.5 rounded-lg bg-orange-50 text-orange-500 hover:bg-orange-500 hover:text-white transition-all">
                                                    <Printer className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleOpenModal("facture", item)} title="Aperçu facture" className="p-1.5 rounded-lg bg-indigo-50 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all">
                                                    <FileText className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleOpenModal("view", item)} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all">
                                                    <EyeIcon className="w-4 h-4" />
                                                </button>
                                                {item.montant_credit > 0 && canEdit && (
                                                    <button onClick={() => handleOpenModal("paiement", item)} title="Régler le crédit" className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all">
                                                        <Wallet className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <button onClick={() => handleOpenModal("delete", item)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all">
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

                {/* Modals for Add */}
                {modalType === "add" && <Add isOpen={true} onClose={handleCloseModal} onSuccess={(newSale) => {
                    refreshData();
                    handleCloseModal();
                    // On enchaine directement sur l'impression ticket !
                    setTimeout(() => {
                        handleOpenModal("print_ticket", newSale);
                    }, 300);
                }} />}

                {/* Modals for Action */}
                {selecteditem && (  <>
                        <Show isOpen={modalType === "view"} onClose={handleCloseModal} data={selecteditem} />
                        <Paiement isOpen={modalType === "paiement"} onClose={handleCloseModal} data={selecteditem} onSuccess={refreshData} />
                        <FactureModal isOpen={modalType === "facture"} onClose={handleCloseModal} data={selecteditem} />
                        <PrintTicketModal isOpen={modalType === "print_ticket"} onClose={handleCloseModal} data={selecteditem} />
                    </>
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
