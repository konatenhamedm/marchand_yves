"use client";

import React, { useEffect, useState } from "react";
import { ClientOnly } from "@/components/ui/client-only";
import { Plus, ShieldCheck, Trash2 } from "lucide-react";
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

export default function RoleMarchandPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Utilisation du hook custom pour gérer transparentement la pagination côté serveur et JS
    const { 
        data, 
        currentPage, 
        setCurrentPage, 
        totalItems, 
        itemsPerPage, 
        handleApiResponse,
        getPaginatedItems,
        isBackendPaginated,
    } = usePaginationData(15);


    const [selecteditem, setSelecteditem] = useState<any | null>(null);
    const [modalType, setModalType] = useState<"add" | "edit" | "delete" | "view" | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const refreshData = (page: number = 1) => {
        setIsLoading(true);
        apiFetch(`/roles/marchands/all?page=${page}`, { provenance: false, method: "GET" })
            .then((res: any) => {
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

    const filteredData = Array.isArray(data)
        ? data.filter((item) =>
            searchTerm === "" ||
            item.libelle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.code?.toLowerCase().includes(searchTerm.toLowerCase()))
        : [];

    const displayItems = getPaginatedItems(filteredData);

    useEffect(() => { refreshData(1); }, []);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) setSelectedIds(filteredData.map((item) => item.id));
        else setSelectedIds([]);
    };

    const handleSelectItem = (id: number) => {
        setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
    };

    const COLS = 4;

    return (
        <ClientOnly>
            <div className="space-y-5">
                <PageHeader
                    title="Rôles marchands"
                    description="Gestion des rôles et des droits d'accès pour les marchands"
                    count={isBackendPaginated ? totalItems : filteredData.length}
                    action={
                        <div className="flex gap-2">
                            {selectedIds.length > 0 && (
                                <button onClick={() => { setModalType("delete"); setSelecteditem(null); }} className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md flex items-center gap-2 text-sm transition-colors h-10">
                                    <Trash2 className="w-4 h-4" /> Supprimer ({selectedIds.length})
                                </button>
                            )}
                            <PrimaryButton onClick={() => handleOpenModal("add", {})}>
                                <Plus className="w-4 h-4" />
                                Nouveau rôle
                            </PrimaryButton>
                        </div>
                    }
                />

                <SearchBar
                    value={searchTerm}
                    onChange={(v) => { setSearchTerm(v); setCurrentPage(1); }}
                    placeholder="Rechercher par libellé..."
                    onRefresh={refreshData}
                    isLoading={isLoading}
                />

                <DataTable
                    title="Liste des rôles"
                    titleIcon={<ShieldCheck className="w-4 h-4" />}
                    footer={
                        <Pagination
                            currentPage={currentPage}
                            totalItems={isBackendPaginated ? totalItems : filteredData.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={(p) => { 
                                setCurrentPage(p);
                                refreshData(p);
                                window.scrollTo({ top: 0, behavior: "smooth" }); 
                            }}
                        />
                    }
                >
                    <table className="w-full">
                        <TableHeaderCustom
                            items={[
                                    <input 
                                        type="checkbox" 
                                        className="cursor-pointer"
                                        checked={displayItems.length > 0 && selectedIds.length === displayItems.length} 
                                        onChange={handleSelectAll} 
                                    />,
                                "#", "Libellé", "Code interne"
                            ]}
                            afficheAction={true}
                            actionWidth="100px"
                        />
                        <tbody>
                            {isLoading ? (
                                <TableSkeletonRows cols={COLS + 1} />
                            ) : displayItems.length === 0 ? (
                                <EmptyState message="Aucun rôle trouvé" icon={<ShieldCheck className="w-10 h-10" />} cols={COLS + 1} />
                            ) : (
                                displayItems.map((item, index) => (
                                    <tr key={item.id ?? index} className="hover:bg-slate-50 transition-colors duration-100">
                                        <td className={TD.muted}>
                                            <input 
                                                type="checkbox" 
                                                className="cursor-pointer"
                                                checked={selectedIds.includes(item.id)} 
                                                onChange={() => handleSelectItem(item.id)} 
                                            />
                                        </td>
                                        <td className={TD.muted}>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        <td className={TD.bold}>{item.libelle}</td>
                                        <td className={TD.mono}>{item.code || "—"}</td>
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

                <Add isOpen={modalType === "add"} onClose={handleCloseModal} onSuccess={refreshData} size="md" />
                {selecteditem && (
                    <>
                        <Edite isOpen={modalType === "edit"} onClose={handleCloseModal} data={selecteditem} onSuccess={refreshData} size="md" />
                        <Show isOpen={modalType === "view"} onClose={handleCloseModal} data={selecteditem} size="md" />
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
