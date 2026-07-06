"use client";

import React, { useEffect, useState } from "react";
import { ClientOnly } from "@/components/ui/client-only";
import { Plus, Zap } from "lucide-react";
import { apiFetch } from "@/lib/axios";
import { Pagination } from "@/components/ui/pagination";
import { usePaginationData } from "@/hooks/usePaginationData";
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

    const [selecteditem, setSelecteditem] = useState<any | null>(null);
    const [modalType, setModalType] = useState<"add" | "edit" | "delete" | "view" | null>(null);

    const refreshData = () => {
        setIsLoading(true);
        apiFetch("/features/all")
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

    const handleCloseModal = () => {
        setModalType(null);
        setSelecteditem(null);
    };

    const filteredData = getFilteredData(searchTerm, ["libelle", "code"]);
    const currentitems = getPaginatedItems(filteredData);
    const startIndex = (currentPage - 1) * itemsPerPage;

    useEffect(() => { refreshData(); }, []);

    const COLS = 4;

    return (
        <ClientOnly>
            <div className="space-y-5">

                <PageHeader
                    title="Fonctionnalités"
                    description="Gestion des modules et fonctionnalités de la plateforme"
                    count={isBackendPaginated ? totalItems : filteredData.length}
                    action={
                        <PrimaryButton onClick={() => handleOpenModal("add", {})}>
                            <Plus className="w-4 h-4" />
                            Nouvelle fonctionnalité
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
                            totalItems={isBackendPaginated ? totalItems : filteredData.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={(p) => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        />
                    }
                >
                    <table className="w-full">
                        <TableHeaderCustom
                            items={["#", "Code", "Libellé"]}
                            afficheAction={true}
                            actionWidth="100px"
                        />
                        <tbody>
                            {isLoading ? (
                                <TableSkeletonRows cols={COLS} />
                            ) : currentitems.length === 0 ? (
                                <EmptyState message="Aucune fonctionnalité trouvée" icon={<Zap className="w-10 h-10" />} cols={COLS} />
                            ) : (
                                currentitems.map((item, index) => (
                                    <tr key={item.id ?? index} className="hover:bg-slate-50 transition-colors duration-100">
                                        <td className={TD.muted}>{startIndex + index + 1}</td>
                                        <td className={TD.mono}>{item.code}</td>
                                        <td className={TD.bold}>{item.libelle}</td>
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

                <Add isOpen={modalType === "add"} onClose={handleCloseModal} onSuccess={refreshData} />
                {selecteditem && (
                    <>
                        <Edite isOpen={modalType === "edit"} onClose={handleCloseModal} data={selecteditem} onSuccess={refreshData} />
                        <Delete isOpen={modalType === "delete"} onClose={handleCloseModal} data={selecteditem} onSuccess={refreshData} />
                        <Show isOpen={modalType === "view"} onClose={handleCloseModal} data={selecteditem} />
                    </>
                )}
            </div>
        </ClientOnly>
    );
}
