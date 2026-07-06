"use client";

import React, { useEffect, useState } from "react";
import { ClientOnly } from "@/components/ui/client-only";
import { Wallet, Store, Calendar, Plus, Search, Trash2, Eye, HandCoins, AlertCircle } from "lucide-react";
import { apiFetch } from "@/lib/axios";
import { Pagination } from "@/components/ui/pagination";
import { usePaginationData } from "@/hooks/usePaginationData";
import { TableHeaderCustom } from "@/components/ui/TableHeaderCustom";
import {
    PageHeader, SearchBar, DataTable,
    TableSkeletonRows, EmptyState, TD, PrimaryButton
} from "@/components/ui/page-components";
import { useMagasin } from "@/context/MagasinContext";
import { Show } from "./Show";
import { Delete } from "./Delete";
import { Add } from "./Add";
import { Paiement } from "./Paiement";
import { Badge } from "@/components/ui/badge";
import { usePermissions } from "@/hooks/usePermissions";
import { useCurrency } from "@/hooks/useCurrency";

const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString("fr-FR") : "—";

export default function DepensesPage() {
    const { canCreate, canEdit, canDelete } = usePermissions("gestionDepenses");
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
    } = usePaginationData(8);

    const [selecteditem, setSelecteditem] = useState<any | null>(null);
    const [modalType, setModalType] = useState<"view" | "delete" | "add" | "paiement" | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const refreshData = () => {
        if (!magasinId) return;
        setIsLoading(true);
        apiFetch(`/depenses/all/magasin/${magasinId}?per_page=${itemsPerPage}&page=${currentPage}`)
            .then((res) => {
                handleApiResponse(res);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    };

    const handleOpenModal = (type: typeof modalType, item?: any) => {
        setModalType(type);
        if (item) setSelecteditem(item);
    };
    const handleCloseModal = () => { setModalType(null); setSelecteditem(null); };

    const filteredData = getFilteredData(searchTerm, ["charge.libelle", "commentaire"]);
    const currentitems = getPaginatedItems(filteredData);

    useEffect(() => { refreshData(); }, [magasinId, currentPage]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) setSelectedIds(currentitems.map((item) => item.id));
        else setSelectedIds([]);
    };

    const handleSelectItem = (id: number) => {
        setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
    };

    const COLS = 7;

    if (!magasinId && !magasinLoading) {
        return (
            <ClientOnly>
                <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100 shadow-inner">
                        <Store className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-slate-800 font-black text-lg uppercase tracking-tight">Aucun Magasin Sélectionné</p>
                        <p className="text-slate-400 text-sm font-medium">Veuillez choisir un établissement pour voir les dépenses</p>
                    </div>
                </div>
            </ClientOnly>
        );
    }

    return (
        <ClientOnly>
            <div className="space-y-6">
                <PageHeader
                    title="Dépenses & Frais"
                    description={`Gestion des flux de sortie de ${magasin?.libelle || "votre magasin"}`}
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
                                    Nouvelle dépense
                                </PrimaryButton>
                            )}
                        </div>
                    }
                />

                <SearchBar
                    value={searchTerm}
                    onChange={(v) => { setSearchTerm(v); setCurrentPage(1); }}
                    placeholder="Filtrer par type de charge ou commentaire..."
                    onRefresh={refreshData}
                    isLoading={isLoading}
                />

                <DataTable
                    title="Registre des décaissements"
                    titleIcon={<Wallet className="w-4 h-4" />}
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
                                "Date", "Type de Charge", "Total", "Statut / Crédit", "Commentaire"
                            ]}
                            afficheAction={true}
                            actionWidth="160px"
                        />
                        <tbody>
                            {isLoading ? (
                                <TableSkeletonRows cols={COLS} />
                            ) : currentitems.length === 0 ? (
                                <EmptyState message="Aucune dépense enregistrée" icon={<Wallet className="w-10 h-10" />} cols={COLS} />
                            ) : (
                                currentitems.map((item) => {
                                    const isCredit = item.montant_credit > 0;
                                    return (
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
                                                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shadow-sm group-hover:bg-white group-hover:text-[#0052cc] transition-colors">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                    </div>
                                                    <span className="font-bold text-slate-700">{fmtDate(item.date_depense)}</span>
                                                </div>
                                            </td>
                                            <td className={TD.bold}>
                                                <div className="flex flex-col">
                                                    <span className="text-slate-900 tracking-tight">{item.charge?.libelle || "Dépense Diverse"}</span>
                                                    {item.charge && <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Charge fixe</span>}
                                                </div>
                                            </td>
                                            <td className={TD.base}>
                                                <span className="text-sm font-black text-slate-900">{formatAmount(item.montant)}</span>
                                            </td>
                                            <td className={TD.base}>
                                                {isCredit ? (
                                                    <div className="flex flex-col gap-1">
                                                        <Badge className="bg-red-50 text-red-700 border-red-100 font-black px-2 py-0.5 text-[9px] uppercase w-fit tracking-widest">À Crédit</Badge>
                                                        <span className="text-[10px] text-red-500 font-bold italic">Reste {formatAmount(item.montant_credit)}</span>
                                                    </div>
                                                ) : (
                                                    <Badge className="bg-green-50 text-green-700 border-green-100 font-black px-2 py-0.5 text-[9px] uppercase w-fit tracking-widest">Réglé</Badge>
                                                )}
                                            </td>
                                            <td className={TD.muted}>
                                                <p className="max-w-[200px] truncate text-[11px] font-medium text-slate-400 uppercase tracking-widest">
                                                    {item.commentaire || "—"}
                                                </p>
                                            </td>
                                            <td className={TD.action}>
                                                <div className="flex items-center justify-end gap-2 pr-2">
                                                    {isCredit && (
                                                        <button
                                                            onClick={() => handleOpenModal("paiement", item)}
                                                            className="p-2 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white transition-all shadow-sm"
                                                            title="Solder le crédit"
                                                        >
                                                            <HandCoins className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleOpenModal("view", item)} className="p-2 rounded-xl bg-[#0052cc]/5 text-[#0052cc] hover:bg-[#0052cc] hover:text-white transition-all shadow-sm">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    {canDelete && (
                                                      <button onClick={() => handleOpenModal("delete", item)} className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-600 hover:text-white transition-all shadow-sm">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </DataTable>

                <Add isOpen={modalType === "add"} onClose={handleCloseModal} onSuccess={refreshData} size="lg" />
                {selecteditem && (
                    <>
                        <Show isOpen={modalType === "view"} onClose={handleCloseModal} data={selecteditem} refreshData={refreshData} size="lg" />
                        <Paiement isOpen={modalType === "paiement"} onClose={handleCloseModal} data={selecteditem} onSuccess={refreshData} />
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
