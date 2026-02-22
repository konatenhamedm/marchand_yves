"use client";

import React, { useEffect, useState } from "react";
import { ClientOnly } from '@/components/ui/client-only';
import { Plus, Zap } from "lucide-react";
import { apiFetch } from "@/lib/axios";
import { Pagination } from "@/components/ui/pagination";
import { TableHeaderCustom } from "@/components/ui/TableHeaderCustom";
import {
    PageHeader, PrimaryButton, SearchBar, DataTable,
    TableSkeletonRows, EmptyState, ActionButtons, TD,
} from "@/components/ui/page-components";
import { Add } from "./Add";
import { Edite } from "./Edite";
import { Delete } from "./Delete";
import { Show } from "./Show";

export default function FeaturesPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [data, setData] = useState<any[]>([]);
    const itemsPerPage = 10;

    const [selecteditem, setSelecteditem] = useState<any | null>(null);
    const [modalType, setModalType] = useState<"add" | "edit" | "delete" | "view" | null>(null);

    const refreshData = () => {
        setIsLoading(true);
        apiFetch(`/features/all?page=${currentPage}`)
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
                item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.libelle?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredData.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => { refreshData(); }, [currentPage]);

    const COLS = 3;

    return (
        <ClientOnly>
            <div className="space-y-5">

                <PageHeader
                    title="Fonctionnalités"
                    description="Configuration des fonctionnalités système"
                    count={filteredData.length}
                    action={
                        <PrimaryButton onClick={() => handleOpenModal("add")}>
                            <Plus className="w-4 h-4" />
                            Nouvelle feature
                        </PrimaryButton>
                    }
                />

                <SearchBar
                    value={searchTerm}
                    onChange={(v) => { setSearchTerm(v); setCurrentPage(1); }}
                    placeholder="Rechercher par code ou libellé..."
                    onRefresh={refreshData}
                    isLoading={isLoading}
                />

                <DataTable
                    title="Liste des fonctionnalités"
                    titleIcon={<Zap className="w-4 h-4" />}
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
                        <TableHeaderCustom items={["Code", "Libellé"]} afficheAction={true} actionWidth="100px" />
                        <tbody>
                            {isLoading ? (
                                <TableSkeletonRows cols={COLS} />
                            ) : currentItems.length === 0 ? (
                                <EmptyState message="Aucune fonctionnalité trouvée" icon={<Zap className="w-10 h-10" />} cols={COLS} />
                            ) : (
                                currentItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors duration-100">
                                        <td className={TD.mono}>{item.code}</td>
                                        <td className={TD.bold + " capitalize"}>{item.libelle}</td>
                                        <td className={TD.action}>
                                            <ActionButtons
                                                onView={() => handleOpenModal("view", item)}
                                                onEdit={() => handleOpenModal("edit", item)}
                                                onDelete={() => handleOpenModal("delete", item)}
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </DataTable>

                {modalType === "add" && (
                    <Add isOpen={true} onClose={handleCloseModal} onSuccess={() => { handleCloseModal(); refreshData(); }} />
                )}
                {selecteditem && modalType === "edit" && (
                    <Edite isOpen={true} onClose={handleCloseModal} data={selecteditem} onSuccess={() => { handleCloseModal(); refreshData(); }} />
                )}
                {selecteditem && modalType === "view" && (
                    <Show isOpen={true} onClose={handleCloseModal} data={selecteditem} />
                )}
                {selecteditem && modalType === "delete" && (
                    <Delete isOpen={true} onClose={handleCloseModal} data={selecteditem} onSuccess={() => { handleCloseModal(); refreshData(); }} />
                )}
            </div>
        </ClientOnly>
    );
}
