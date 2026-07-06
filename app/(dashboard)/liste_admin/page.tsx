"use client";

import React, { useEffect, useState } from "react";
import { ClientOnly } from '@/components/ui/client-only';
import { Plus, UserCog, Shield, Mail, Trash2 } from "lucide-react";
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

function AdminAvatar({ name }: { name: string }) {
    const initials = name.trim().split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
    return (
        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-semibold flex-shrink-0">
            {initials || "?"}
        </div>
    );
}

export default function ListeAdminPage() {
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
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const refreshData = () => {
        setIsLoading(true);
        apiFetch("/admins/all", { method: "GET" })
            .then((res) => { handleApiResponse(res); setIsLoading(false); })
            .catch((err) => { console.error(err.message); setIsLoading(false); });
    };

    const handleOpenModal = (type: typeof modalType, item?: any) => {
        setModalType(type);
        if (item) setSelecteditem(item);
    };

    const handleCloseModal = () => { setModalType(null); setSelecteditem(null); };

    const filteredData = getFilteredData(searchTerm, ["nom", "prenoms", "email", "role.libelle"]);
    const currentitems = getPaginatedItems(filteredData);

    useEffect(() => { refreshData(); }, []);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) setSelectedIds(currentitems.map((item) => item.id));
        else setSelectedIds([]);
    };

    const handleSelectItem = (id: number) => {
        setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
    };

    const COLS = 6;

    return (
        <ClientOnly>
            <div className="space-y-5">

                <PageHeader
                    title="Administrateurs"
                    description="Gestion des utilisateurs administrateurs"
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
                                Nouvel admin
                            </PrimaryButton>
                        </div>
                    }
                />

                <SearchBar
                    value={searchTerm}
                    onChange={(v) => { setSearchTerm(v); setCurrentPage(1); }}
                    placeholder="Rechercher par nom, email ou rôle..."
                    onRefresh={refreshData}
                    isLoading={isLoading}
                />

                <DataTable
                    title="Liste des administrateurs"
                    titleIcon={<UserCog className="w-4 h-4" />}
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
                                "Administrateur", "Email", "Rôle"
                            ]}
                            afficheAction={true}
                            actionWidth="100px"
                        />
                        <tbody>
                            {isLoading ? (
                                <TableSkeletonRows cols={COLS} />
                            ) : currentitems.length === 0 ? (
                                <EmptyState message="Aucun administrateur trouvé" icon={<UserCog className="w-10 h-10" />} cols={COLS} />
                            ) : (
                                currentitems.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors duration-100">
                                        <td className="px-4 py-3 border-b border-slate-100 w-12 pt-5">
                                            <input 
                                                type="checkbox" 
                                                className="cursor-pointer"
                                                checked={selectedIds.includes(item.id)} 
                                                onChange={() => handleSelectItem(item.id)} 
                                            />
                                        </td>
                                        {/* Nom */}
                                        <td className="px-4 py-3 border-b border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <AdminAvatar name={`${item.prenoms || ""} ${item.nom || ""}`} />
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-800">
                                                        {item.prenoms} {item.nom}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Email */}
                                        <td className={TD.base}>
                                            <div className="flex items-center gap-1.5 text-slate-600">
                                                <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                                {item.email}
                                            </div>
                                        </td>
                                        {/* Rôle */}
                                        <td className={TD.base}>
                                            {item.role ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EBF2FF] text-[#0052CC]">
                                                    <Shield className="w-3 h-3" />
                                                    {item.role.libelle}
                                                </span>
                                            ) : (
                                                <span className="text-slate-300 text-xs">—</span>
                                            )}
                                        </td>
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
                        <Show isOpen={modalType === "view"} onClose={handleCloseModal} data={selecteditem} />
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
