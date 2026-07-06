"use client";

import React, { useEffect, useState } from "react";
import { ClientOnly } from "@/components/ui/client-only";
import {
    ClipboardList, Store, Filter, Calendar, User, Wallet,
    Plus, Clock, Truck, CheckCircle2, AlertCircle, Search,
    Package, ArrowRight, UserCheck, Trash2, Settings
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UpdateStatus } from "./UpdateStatus";
import { UpdateLivraison } from "./UpdateLivraison";
import { ConvertToVente } from "./ConvertToVente";
import { toast } from "sonner";
import { RefreshCw, Zap } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { useCurrency } from "@/hooks/useCurrency";

const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString("fr-FR") : "—";

export default function CommandesPage() {
    const { canCreate, canEdit, canDelete } = usePermissions("gestionCommandes");
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
    const [filterType, setFilterType] = useState<"all" | "non-livrees" | "livrees">("all");
    const [filters, setFilters] = useState({
        date_debut: "",
        date_fin: "",
    });

    const [selecteditem, setSelecteditem] = useState<any | null>(null);
    const [modalType, setModalType] = useState<"view" | "delete" | "add" | "status" | "livraison" | "convert" | null>(null);
    const [isConverting, setIsConverting] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const refreshData = () => {
        if (!magasinId) return;
        setIsLoading(true);

        let endpoint = `/commandes/all/magasin/${magasinId}`;
        if (filterType === "non-livrees") endpoint = `/commandes/all/non-livrees/magasin/${magasinId}`;
        else if (filterType === "livrees") endpoint = `/commandes/all/livrees/magasin/${magasinId}`;

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

    const filteredData = getFilteredData(searchTerm, ["ref_vente", "client.nom", "client.prenom", "lieu_livraison"]);
    const currentitems = getPaginatedItems(filteredData);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) setSelectedIds(currentitems.map((item) => item.id));
        else setSelectedIds([]);
    };

    const handleSelectItem = (id: number) => {
        setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
    };

    const COLS = 9;

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
        const status = item.status_commande?.toLowerCase();
        if (status === "livre") {
            return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold px-3 py-1 rounded-full uppercase text-[9px] tracking-widest">Livré</Badge>;
        }
        if (status === "reporte") {
            return <Badge className="bg-amber-50 text-amber-700 border-amber-100 font-bold px-3 py-1 rounded-full uppercase text-[9px] tracking-widest">Reporté</Badge>;
        }
        if (status === "annule") {
            return <Badge className="bg-red-50 text-red-700 border-red-100 font-bold px-3 py-1 rounded-full uppercase text-[9px] tracking-widest">Annulé</Badge>;
        }
        return <Badge className="bg-blue-50 text-blue-700 border-blue-100 font-bold px-3 py-1 rounded-full uppercase text-[9px] tracking-widest">Prévu</Badge>;
    };

    const handleConvertToVente = (item: any) => {
        setSelecteditem(item);
        setModalType("convert");
    };

    return (
        <ClientOnly>
            <div className="space-y-6">
                <PageHeader
                    title="Commandes"
                    description={`Gestion des livraisons — ${magasin?.libelle ?? "Magasin"}`}
                    count={isBackendPaginated ? totalItems : filteredData.length}
                    action={
                        <div className="flex gap-2">
                            {selectedIds.length > 0 && canDelete && (
                                <button onClick={() => { setModalType("delete"); setSelecteditem(null); }} className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md flex items-center gap-2 text-sm transition-colors">
                                    <Trash2 className="w-4 h-4" /> Supprimer ({selectedIds.length})
                                </button>
                            )}
                            {canCreate && (
                                <PrimaryButton onClick={() => handleOpenModal("add")}>
                                    <Plus className="w-4 h-4" />
                                    Nouvelle Commande
                                </PrimaryButton>
                            )}
                        </div>
                    }
                />

                {/* Filter Tabs & Date Filter */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
                        <div className="flex bg-slate-100/80 p-1.5 rounded-2xl gap-1 self-start">
                            {[
                                { id: "all", label: "Toutes", icon: ClipboardList },
                                { id: "non-livrees", label: "Non livrées", icon: Clock },
                                { id: "livrees", label: "Livrées", icon: Truck },
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
                                <Input type="date" value={filters.date_debut} onChange={(e) => setFilters({ ...filters, date_debut: e.target.value })} className="h-10 text-xs rounded-xl border-slate-200 focus:ring-4 focus:ring-[#0052cc]/5 transition-all bg-slate-50/30" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] text-slate-400 font-black uppercase tracking-widest pl-1">Au</Label>
                                <Input type="date" value={filters.date_fin} onChange={(e) => setFilters({ ...filters, date_fin: e.target.value })} className="h-10 text-xs rounded-xl border-slate-200 focus:ring-4 focus:ring-[#0052cc]/5 transition-all bg-slate-50/30" />
                            </div>
                            <PrimaryButton onClick={refreshData} className="h-10 rounded-xl px-6 text-xs font-black uppercase tracking-widest">
                                Filtrer
                            </PrimaryButton>
                        </div>
                    </div>
                </div>

                <SearchBar
                    value={searchTerm}
                    onChange={(v) => { setSearchTerm(v); setCurrentPage(1); }}
                    placeholder="Filtrer par référence, client ou lieu..."
                    onRefresh={refreshData}
                    isLoading={isLoading}
                />

                <DataTable
                    title="Registre des commandes"
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
                                /* <input 
                                    type="checkbox" 
                                    className="cursor-pointer"
                                    checked={currentitems.length > 0 && selectedIds.length === currentitems.length} 
                                    onChange={handleSelectAll} 
                                /> ,*/
                                "Référence", "Date Cmd", "Client", "Net à payer", "Lieu Livraison", "Livraison Prévue", "Statut"
                            ]}
                            afficheAction={true}
                            actionWidth="180px"
                        />
                        <tbody>
                            {isLoading ? (
                                <TableSkeletonRows cols={COLS} />
                            ) : currentitems.length === 0 ? (
                                <EmptyState message="Aucune commande enregistrée" icon={<Package className="w-10 h-10" />} cols={COLS} />
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
                                        <td className={TD.mono}>{item.ref_vente}</td>
                                        <td className={TD.base}>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-700">{fmtDate(item.date_commande || item.date_vente)}</span>
                                                <span className="text-[9px] text-slate-400 font-medium font-mono uppercase">ID-{item.id}</span>
                                            </div>
                                        </td>
                                        <td className={TD.bold}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] text-slate-500 font-black uppercase">
                                                    {item.client?.nom?.substring(0, 2) || "AN"}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[13px] font-black text-slate-700 truncate max-w-[120px]">{item.client ? `${item.client.nom}` : "Anonyme"}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium">{item.client?.tel || "—"}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={TD.mono}>
                                            <div className="flex flex-col">
                                                <span className="text-slate-900 font-black">{formatAmount(item.montant_ttc)}</span>
                                                <span className="text-[9px] text-green-600 font-bold uppercase">Payé: {formatAmount(item.montant_regle)}</span>
                                            </div>
                                        </td>
                                        <td className={TD.base}>
                                            <div className="flex items-center gap-1.5 max-w-[150px]">
                                                <Truck className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                                                <span className="truncate text-slate-600 font-medium">{item.lieu_livraison || "Non spécifié"}</span>
                                            </div>
                                        </td>
                                        <td className={TD.base}>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-orange-600">{fmtDate(item.date_livraison)}</span>
                                                {item.nom_livreur && <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1"><User className="w-2.5 h-2.5" /> {item.nom_livreur}</span>}
                                            </div>
                                        </td>
                                        <td className={TD.base}>
                                            {getStatusBadge(item)}
                                        </td>
                                        <td className={TD.action}>
                                            <div className="flex items-center gap-1.5 justify-end">
                                                <button
                                                    onClick={() => handleConvertToVente(item)}
                                                    disabled={isConverting === item.id}
                                                    title="Convertir en vente"
                                                    className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                                >
                                                    {isConverting === item.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                                </button>
                                                {item.status_commande?.toLowerCase() !== "livre" && (
                                                    <button
                                                        onClick={() => handleOpenModal("livraison", item)}
                                                        title="Infos livraison"
                                                        className="p-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white transition-all shadow-sm"
                                                    >
                                                        <Truck className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleOpenModal("status", item)}
                                                    title="Changer statut"
                                                    className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                >
                                                    <Settings className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleOpenModal("view", item)} className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-800 hover:text-white transition-all shadow-sm">
                                                    <ArrowRight className="w-4 h-4" />
                                                </button>
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

                {modalType === "add" && <Add isOpen={true} onClose={handleCloseModal} onSuccess={() => refreshData()} />}

                {selecteditem && (
                    <>
                        <Show isOpen={modalType === "view"} onClose={handleCloseModal} data={selecteditem} />
                        <UpdateStatus isOpen={modalType === "status"} onClose={handleCloseModal} data={selecteditem} onSuccess={refreshData} />
                        <UpdateLivraison isOpen={modalType === "livraison"} onClose={handleCloseModal} data={selecteditem} onSuccess={refreshData} />
                        <ConvertToVente isOpen={modalType === "convert"} onClose={handleCloseModal} data={selecteditem} onSuccess={refreshData} />
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
