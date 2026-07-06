"use client";

import React, { useEffect, useState } from "react";
import { ClientOnly } from "@/components/ui/client-only";
import { Plus, TrendingUp, Store, Calendar, Info, Search, Trash2, Edit3, Eye, MoreVertical } from "lucide-react";
import { apiFetch } from "@/lib/axios";
import { Pagination } from "@/components/ui/pagination";
import { usePaginationData } from "@/hooks/usePaginationData";
import { TableHeaderCustom } from "@/components/ui/TableHeaderCustom";
import {
    PageHeader, PrimaryButton, SearchBar, DataTable,
    TableSkeletonRows, EmptyState, TD,
} from "@/components/ui/page-components";
import { useMagasin } from "@/context/MagasinContext";
import { Add } from "./Add";
import { Edite } from "./Edite";
import { Delete } from "./Delete";
import { Show } from "./Show";
import { Badge } from "@/components/ui/badge";
import { usePermissions } from "@/hooks/usePermissions";

const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString("fr-FR") : "—";
const fmt = (v?: number) => v ? v.toLocaleString("fr-FR") : "0";

export default function Page() {
    const { canCreate, canEdit, canDelete } = usePermissions("gestionCharges");
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
    } = usePaginationData(8);

    const [selecteditem, setSelecteditem] = useState<any | null>(null);
    const [modalType, setModalType] = useState<"add" | "edit" | "delete" | "view" | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const refreshData = () => {
        if (!magasinId) return;
        setIsLoading(true);
        apiFetch(`/charges/all/magasin/${magasinId}?per_page=${itemsPerPage}&page=${currentPage}`)
            .then((res) => {
                handleApiResponse(res);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    };

    const handleOpenModal = (type: typeof modalType, item?: any) => { setModalType(type); if (item) setSelecteditem(item); };
    const handleCloseModal = () => { setModalType(null); setSelecteditem(null); };

    const filteredData = getFilteredData(searchTerm, ["libelle", "description"]);
    const currentitems = getPaginatedItems(filteredData);

    useEffect(() => { refreshData(); }, [magasinId, currentPage]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) setSelectedIds(currentitems.map((item) => item.id));
        else setSelectedIds([]);
    };

    const handleSelectItem = (id: number) => {
        setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
    };

    const COLS = 6;

    if (!magasinId && !magasinLoading) {
        return (
            <ClientOnly>
                <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100 shadow-inner">
                        <Store className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-slate-800 font-black text-lg uppercase tracking-tight">Aucun Magasin Sélectionné</p>
                        <p className="text-slate-400 text-sm font-medium">Veuillez choisir un établissement pour voir les charges</p>
                    </div>
                </div>
            </ClientOnly>
        );
    }

    return (
        <ClientOnly>
            <div className="space-y-6">
                <PageHeader
                    title="Charges de fonctionnement"
                    description={`Suivi des dépenses budgétaires de ${magasin?.libelle || "votre magasin"}`}
                    count={isBackendPaginated ? totalItems : filteredData.length}
                    action={
                        <div className="flex gap-2">
                            {selectedIds.length > 0 && canDelete && (
                                <button onClick={() => { setModalType("delete"); setSelecteditem(null); }} className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md flex items-center gap-2 text-sm transition-colors">
                                    <Trash2 className="w-4 h-4" /> Supprimer ({selectedIds.length})
                                </button>
                            )}
                            {canCreate && (
                                <PrimaryButton onClick={() => handleOpenModal("add", {})}>
                                    <Plus className="w-4 h-4" />
                                    Nouvelle charge
                                </PrimaryButton>
                            )}
                        </div>
                    }
                />

                <SearchBar
                    value={searchTerm}
                    onChange={(v) => { setSearchTerm(v); setCurrentPage(1); }}
                    placeholder="Filtrer les charges par libellé ou description..."
                    onRefresh={refreshData}
                    isLoading={isLoading}
                />

                <DataTable
                    title="Registre des charges"
                    titleIcon={<TrendingUp className="w-4 h-4" />}
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
                                <input 
                                    type="checkbox" 
                                    className="cursor-pointer"
                                    checked={currentitems.length > 0 && selectedIds.length === currentitems.length} 
                                    onChange={handleSelectAll} 
                                />,
                                "Date", "Libellé", "Montant Budgété", "Description"
                            ]}
                            afficheAction={true}
                            actionWidth="150px"
                        />
                        <tbody>
                            {isLoading ? (
                                <TableSkeletonRows cols={COLS} />
                            ) : currentitems.length === 0 ? (
                                <EmptyState message="Aucune charge enregistrée" icon={<TrendingUp className="w-10 h-10" />} cols={COLS} />
                            ) : (
                                currentitems.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/80 transition-all duration-200 group border-b border-slate-50 last:border-0">
                                        <td className={TD.muted}>
                                            <input 
                                                type="checkbox" 
                                                className="cursor-pointer"
                                                checked={selectedIds.includes(item.id)} 
                                                onChange={() => handleSelectItem(item.id)} 
                                            />
                                        </td>
                                        <td className={TD.base}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[#0052cc] shadow-sm">
                                                    <Calendar className="w-4 h-4" />
                                                </div>
                                                <span className="font-bold text-slate-700">{fmtDate(item.date_charge)}</span>
                                            </div>
                                        </td>
                                        <td className={TD.bold}>
                                            <span className="text-slate-900 tracking-tight">{item.libelle}</span>
                                        </td>
                                        <td className={TD.base}>
                                            <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 font-black px-3 py-1 text-[11px]">
                                                {fmt(item.montant)} FCFA
                                            </Badge>
                                        </td>
                                        <td className={TD.muted}>
                                            <p className="max-w-[300px] truncate text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                                                {item.description || "—"}
                                            </p>
                                        </td>
                                        <td className={TD.action}>
                                            <div className="flex items-center justify-end gap-2 pr-2">
                                                <button onClick={() => handleOpenModal("view", item)} className="p-2 rounded-xl bg-[#0052cc]/5 text-[#0052cc] hover:bg-[#0052cc] hover:text-white transition-all shadow-sm">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {canEdit && (
                                                  <button onClick={() => handleOpenModal("edit", item)} className="p-2 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-800 hover:text-white transition-all shadow-sm">
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                )}
                                                {canDelete && (
                                                  <button onClick={() => handleOpenModal("delete", item)} className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-600 hover:text-white transition-all shadow-sm">
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

                <Add isOpen={modalType === "add"} onClose={handleCloseModal} onSuccess={refreshData} size="lg" />
                {selecteditem && (
                    <>
                        <Edite isOpen={modalType === "edit"} onClose={handleCloseModal} data={selecteditem} onSuccess={refreshData} size="lg" />
                        <Show isOpen={modalType === "view"} onClose={handleCloseModal} data={selecteditem} size="lg" />
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
                        size="md" 
                    />
                )}
            </div>
        </ClientOnly>
    );
}
