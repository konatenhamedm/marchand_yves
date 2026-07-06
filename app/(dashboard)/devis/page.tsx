"use client";

import React, { useEffect, useState } from "react";
import { ClientOnly } from "@/components/ui/client-only";
import { 
    FileText, Store, Filter, Calendar, User, 
    CheckCircle2, AlertCircle, XCircle, Search, 
    Plus, Clock, ArrowRight, UserCheck, Edit3 
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrency } from "@/hooks/useCurrency";

import { Add } from "./Add";
import { Edit } from "./Edit";
import { Show } from "./Show";
import { StatusModal } from "./StatusModal";
import { ConvertModal } from "./ConvertModal";
import { FactureDevisModal } from "./FactureDevisModal";
import { Download } from "lucide-react";

const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString("fr-FR") : "—";

export default function DevisPage() {
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

    const [filters, setFilters] = useState({
        date_debut: "",
        date_fin: "",
        client_id: "",
        statut: ""
    });

    const [clients, setClients] = useState<any[]>([]);

    const [selecteditem, setSelecteditem] = useState<any | null>(null);
    const [modalType, setModalType] = useState<"view" | "add" | "edit" | "status" | "convert" | "download" | null>(null);

    const refreshData = () => {
        if (!magasinId) return;
        setIsLoading(true);

        let endpoint = `/devis/all/magasin/${magasinId}`;

        const params = new URLSearchParams();
        params.append("per_page", itemsPerPage.toString());
        params.append("page", currentPage.toString());
        if (filters.date_debut) params.append("date_debut", filters.date_debut);
        if (filters.date_fin) params.append("date_fin", filters.date_fin);
        if (filters.client_id) params.append("client_id", filters.client_id);
        if (filters.statut) params.append("statut", filters.statut);

        const url = params.toString() ? `${endpoint}?${params.toString()}` : endpoint;

        apiFetch(url)
            .then((res) => {

                console.log(res.data);
                handleApiResponse(res);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    };

    const fetchFiltersData = () => {
        if (!magasinId) return;
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

    const filteredData = getFilteredData(searchTerm, ["libelle", "client.nom", "client.prenom"]);
    const currentitems = getPaginatedItems(filteredData);

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

    const getStatusBadge = (statut: string) => {
        switch (statut) {
            case "accepte": return <Badge className="bg-green-50 text-green-700 border-green-100 font-bold">Accepté</Badge>;
            case "refuse": return <Badge className="bg-red-50 text-red-700 border-red-100 font-bold">Refusé</Badge>;
            case "expire": return <Badge className="bg-slate-50 text-slate-700 border-slate-200 font-bold">Expiré</Badge>;
            case "en_attente":
            default: return <Badge className="bg-amber-50 text-amber-700 border-amber-100 font-bold">En attente</Badge>;
        }
    };

    return (
        <ClientOnly>
            <div className="space-y-6">
                <PageHeader
                    title="Devis"
                    description={`Gestion des devis — ${magasin?.libelle ?? "Magasin"}`}
                    count={isBackendPaginated ? totalItems : filteredData.length}
                    action={
                        <div className="flex gap-2">
                            <PrimaryButton onClick={() => handleOpenModal("add")} className="h-10">
                                <Plus className="w-4 h-4" />
                                Nouveau Devis
                            </PrimaryButton>
                        </div>
                    }
                />

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-slate-800 font-black text-[10px] uppercase tracking-widest border-b border-slate-50 pb-3">
                        <Filter className="w-3.5 h-3.5" /> Filtres Avancés
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] text-slate-400 font-bold uppercase">Début</Label>
                            <Input type="date" value={filters.date_debut} onChange={(e) => setFilters({ ...filters, date_debut: e.target.value })} className="h-9 text-xs rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] text-slate-400 font-bold uppercase">Fin</Label>
                            <Input type="date" value={filters.date_fin} onChange={(e) => setFilters({ ...filters, date_fin: e.target.value })} className="h-9 text-xs rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] text-slate-400 font-bold uppercase">Client</Label>
                            <select value={filters.client_id} onChange={(e) => setFilters({ ...filters, client_id: e.target.value })} className="w-full h-9 rounded-xl border border-slate-200 text-xs px-2 outline-none focus:ring-2 focus:ring-[#0052cc]/10">
                                <option value="">Tous</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.nom} {c.prenom}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] text-slate-400 font-bold uppercase">Statut</Label>
                            <select value={filters.statut} onChange={(e) => setFilters({ ...filters, statut: e.target.value })} className="w-full h-9 rounded-xl border border-slate-200 text-xs px-2 outline-none focus:ring-2 focus:ring-[#0052cc]/10">
                                <option value="">Tous</option>
                                <option value="en_attente">En attente</option>
                                <option value="accepte">Accepté</option>
                                <option value="refuse">Refusé</option>
                                <option value="expire">Expiré</option>
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
                    title="Liste des devis"
                    titleIcon={<FileText className="w-4 h-4" />}
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
                            items={["Référence", "Date Devis", "Expiration", "Client", "Montant TTC", "Statut"]}
                            afficheAction={true}
                            actionWidth="160px"
                        />
                        <tbody>
                            {isLoading ? (
                                <TableSkeletonRows cols={COLS} />
                            ) : currentitems.length === 0 ? (
                                <EmptyState message="Aucun devis trouvé" icon={<FileText className="w-10 h-10" />} cols={COLS} />
                            ) : (
                                currentitems.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors duration-100 group">
                                        <td className={TD.mono}>DEV-{item.id}</td>
                                        <td className={TD.base}>
                                            <span className="font-bold text-slate-700">{fmtDate(item.date_devis)}</span>
                                        </td>
                                        <td className={TD.base}>
                                            <span className="font-bold text-slate-700">{fmtDate(item.date_expiration)}</span>
                                        </td>
                                        <td className={TD.bold}>
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] text-slate-500 font-bold uppercase">
                                                    {item.client?.nom?.substring(0, 2) || "AN"}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-slate-700">{item.client ? `${item.client.nom} ${item.client.prenom}` : "Client Anonyme"}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={TD.mono}>
                                            <span className="text-slate-900 font-black">{formatAmount(item.montant_ttc)}</span>
                                        </td>
                                        <td className={TD.base}>
                                            {getStatusBadge(item.statut)}
                                        </td>
                                        <td className={TD.action}>
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => handleOpenModal("download", item)} className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all" title="Télécharger le PDF">
                                                    <Download className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleOpenModal("view", item)} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all" title="Voir détails">
                                                    <ArrowRight className="w-4 h-4" />
                                                </button>
                                                {item.statut === "en_attente" && (
                                                    <button onClick={() => handleOpenModal("edit", item)} className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all" title="Modifier">
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button onClick={() => handleOpenModal("status", item)} className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white transition-all" title="Changer statut">
                                                    <AlertCircle className="w-4 h-4" />
                                                </button>
                                                {item.statut === "accepte" && (
                                                    <button onClick={() => handleOpenModal("convert", item)} className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all" title="Convertir en vente">
                                                        <CheckCircle2 className="w-4 h-4" />
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
                
                {selecteditem && (
                    <>
                        <Show isOpen={modalType === "view"} onClose={handleCloseModal} data={selecteditem} />
                        <Edit isOpen={modalType === "edit"} onClose={handleCloseModal} data={selecteditem} onSuccess={refreshData} />
                        <StatusModal isOpen={modalType === "status"} onClose={handleCloseModal} data={selecteditem} onSuccess={refreshData} />
                        <ConvertModal isOpen={modalType === "convert"} onClose={handleCloseModal} data={selecteditem} onSuccess={refreshData} />
                        <FactureDevisModal isOpen={modalType === "download"} onClose={handleCloseModal} data={selecteditem} />
                    </>
                )}
            </div>
        </ClientOnly>
    );
}
