"use client";

import React, { useEffect, useState } from "react";
import { ClientOnly } from "@/components/ui/client-only";
import { ShoppingBag } from "lucide-react";
import { apiFetch } from "@/lib/axios";
import { Pagination } from "@/components/ui/pagination";
import { TableHeaderCustom } from "@/components/ui/TableHeaderCustom";
import {
    PageHeader, SearchBar, DataTable,
    TableSkeletonRows, EmptyState, TD,
} from "@/components/ui/page-components";
import { Show } from "./Show";
import { Delete } from "./Delete";

const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString("fr-FR") : "—";
const fmt = (v?: number) => v ? v.toLocaleString("fr-FR") : "0";

export default function AchatsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [data, setData] = useState<any[]>([]);
    const itemsPerPage = 10;

    const [selecteditem, setSelecteditem] = useState<any | null>(null);
    const [modalType, setModalType] = useState<"view" | "delete" | null>(null);

    const refreshData = () => {
        setIsLoading(true);
        apiFetch("/achats/magasin")
            .then((res) => { setData(Array.isArray(res.data) ? res.data : res.data?.data ?? []); setIsLoading(false); })
            .catch(() => setIsLoading(false));
    };

    const handleOpenModal = (type: typeof modalType, item?: any) => { setModalType(type); if (item) setSelecteditem(item); };
    const handleCloseModal = () => { setModalType(null); setSelecteditem(null); };

    const filteredData = Array.isArray(data)
        ? data.filter((item) =>
            searchTerm === "" ||
            item.fournisseur?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.commentaire?.toLowerCase().includes(searchTerm.toLowerCase()))
        : [];

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentitems = filteredData.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => { refreshData(); }, []);

    const COLS = 7;

    return (
        <ClientOnly>
            <div className="space-y-5">

                <PageHeader
                    title="Achats d'articles"
                    description="Approvisionnements auprès des fournisseurs"
                    count={filteredData.length}
                />

                <SearchBar
                    value={searchTerm}
                    onChange={(v) => { setSearchTerm(v); setCurrentPage(1); }}
                    placeholder="Rechercher par fournisseur ou commentaire..."
                    onRefresh={refreshData}
                    isLoading={isLoading}
                />

                <DataTable
                    title="Liste des achats"
                    titleIcon={<ShoppingBag className="w-4 h-4" />}
                    footer={
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredData.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={(p) => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        />
                    }
                >
                    <table className="w-full">
                        <TableHeaderCustom
                            items={["#", "Date", "Fournisseur", "Réglé", "Crédit", "Remise"]}
                            afficheAction={true}
                            actionWidth="80px"
                        />
                        <tbody>
                            {isLoading ? (
                                <TableSkeletonRows cols={COLS} />
                            ) : currentitems.length === 0 ? (
                                <EmptyState message="Aucun achat trouvé" icon={<ShoppingBag className="w-10 h-10" />} cols={COLS} />
                            ) : (
                                currentitems.map((item, index) => (
                                    <tr key={item.id ?? index} className="hover:bg-slate-50 transition-colors duration-100">
                                        <td className={TD.muted}>{startIndex + index + 1}</td>
                                        <td className={TD.base}>{fmtDate(item.date_achat)}</td>
                                        <td className={TD.bold}>{item.fournisseur?.nom ?? "—"}</td>
                                        <td className="px-4 py-3.5 text-sm text-green-600 font-semibold border-b border-slate-100">{fmt(item.montant_regle)}</td>
                                        <td className={`px-4 py-3.5 text-sm border-b border-slate-100 font-semibold ${item.montant_credit > 0 ? "text-red-500" : "text-slate-300"}`}>{fmt(item.montant_credit)}</td>
                                        <td className={TD.base}>{fmt(item.montant_remise)}</td>
                                        <td className={TD.action}>
                                            <div className="flex items-center justify-center gap-1">
                                                <button onClick={() => handleOpenModal("view", item)} title="Voir"
                                                    className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-[#EBF2FF] text-[#0052CC] hover:bg-[#0052CC] hover:text-white transition-all duration-150">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                </button>
                                                <button onClick={() => handleOpenModal("delete", item)} title="Supprimer"
                                                    className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-150">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </DataTable>

                {selecteditem && (
                    <>
                        <Show isOpen={modalType === "view"} onClose={handleCloseModal} data={selecteditem} />
                        <Delete isOpen={modalType === "delete"} onClose={handleCloseModal} data={selecteditem} onSuccess={refreshData} />
                    </>
                )}
            </div>
        </ClientOnly>
    );
}
