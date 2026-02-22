"use client";

import React, { useEffect, useState } from "react";
import { ClientOnly } from '@/components/ui/client-only';
import { Store, User, Phone, Mail, Coins } from "lucide-react";
import { apiFetch } from "@/lib/axios";
import { Pagination } from "@/components/ui/pagination";
import { TableHeaderCustom } from "@/components/ui/TableHeaderCustom";
import {
    PageHeader, SearchBar, DataTable,
    TableSkeletonRows, EmptyState, ActionButtons, TD,
} from "@/components/ui/page-components";
import { Show } from "./Show";

export default function ListeMagasinPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [data, setData] = useState<any[]>([]);
    const itemsPerPage = 10;

    const [selecteditem, setSelecteditem] = useState<any | null>(null);
    const [modalType, setModalType] = useState<"view" | null>(null);

    const refreshData = () => {
        setIsLoading(true);
        apiFetch(`/magasins/all?page=${currentPage}`)
            .then((res) => { setData(res.data || res); setIsLoading(false); })
            .catch((err) => { console.error(err.message); setIsLoading(false); });
    };

    const handleOpenModal = (type: typeof modalType, item?: any) => {
        setModalType(type);
        if (item) setSelecteditem(item);
    };

    const handleCloseModal = () => { setModalType(null); setSelecteditem(null); };

    const filteredData = Array.isArray(data)
        ? data.filter(
            (item) =>
                searchTerm === "" ||
                item.libelle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.tel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.owner?.nom?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredData.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => { refreshData(); }, [currentPage]);

    const COLS = 5;

    return (
        <ClientOnly>
            <div className="space-y-5">

                <PageHeader
                    title="Magasins"
                    description="Liste des boutiques et ateliers de la plateforme"
                    count={filteredData.length}
                />

                <SearchBar
                    value={searchTerm}
                    onChange={(v) => { setSearchTerm(v); setCurrentPage(1); }}
                    placeholder="Rechercher par libellé, propriétaire ou email..."
                    onRefresh={refreshData}
                    isLoading={isLoading}
                />

                <DataTable
                    title="Liste des magasins"
                    titleIcon={<Store className="w-4 h-4" />}
                    footer={
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredData.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                        />
                    }
                >
                    <table className="w-full">
                        <TableHeaderCustom
                            items={["Magasin", "Propriétaire", "Contact", "Devise"]}
                            afficheAction={true}
                            actionWidth="72px"
                        />
                        <tbody>
                            {isLoading ? (
                                <TableSkeletonRows cols={COLS} />
                            ) : currentItems.length === 0 ? (
                                <EmptyState message="Aucun magasin trouvé" icon={<Store className="w-10 h-10" />} cols={COLS} />
                            ) : (
                                currentItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors duration-100">
                                        {/* Libellé */}
                                        <td className={TD.bold + " capitalize"}>{item.libelle}</td>
                                        {/* Propriétaire */}
                                        <td className={TD.base}>
                                            <div className="flex items-center gap-1.5 text-slate-600">
                                                <User className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                                <span>{item.owner?.nom} {item.owner?.prenoms}</span>
                                            </div>
                                        </td>
                                        {/* Contact */}
                                        <td className="px-4 py-3 border-b border-slate-100">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                                    <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                                    {item.tel || <span className="text-slate-300">—</span>}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                    <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                                    {item.email || <span className="text-slate-300">—</span>}
                                                </div>
                                            </div>
                                        </td>
                                        {/* Devise */}
                                        <td className={TD.base}>
                                            {item.pays_devise?.devise?.code ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                                    <Coins className="w-3 h-3" />
                                                    {item.pays_devise.devise.code}
                                                </span>
                                            ) : (
                                                <span className="text-slate-300 text-xs">—</span>
                                            )}
                                        </td>
                                        <td className={TD.action}>
                                            <ActionButtons onView={() => handleOpenModal("view", item)} />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </DataTable>

                {selecteditem && (
                    <Show isOpen={modalType === "view"} onClose={handleCloseModal} data={selecteditem} />
                )}
            </div>
        </ClientOnly>
    );
}
