"use client";

import React, { useEffect, useState } from "react";
import { ClientOnly } from "@/components/ui/client-only";
import { Plus, Boxes, Store, Zap, ShoppingCart, PackageOpen, Trash } from "lucide-react";
import { apiFetch } from "@/lib/axios";
import { Pagination } from "@/components/ui/pagination";
import { usePaginationData } from "@/hooks/usePaginationData";
import { TableHeaderCustom } from "@/components/ui/TableHeaderCustom";
import {
    PageHeader, PrimaryButton, SearchBar, DataTable,
    TableSkeletonRows, EmptyState, ActionButtons, TD,
} from "@/components/ui/page-components";
import { useMagasin } from "@/context/MagasinContext";
import { Badge } from "@/components/ui/badge";
import { Add } from "./Add";
import { Edite } from "./Edite";
import { Delete } from "./Delete";
import { Show } from "./Show";
import { usePermissions } from "@/hooks/usePermissions";
import { useCurrency } from "@/hooks/useCurrency";

const TypeBadge = ({ type }: { type: string }) => {
    if (type === "manufacturable") {
        return <Badge className="bg-purple-100 text-purple-600 border-purple-200 gap-1 font-bold"><Zap className="w-3 h-3" /> Fabriqué</Badge>;
    }
    return <Badge variant="outline" className="text-slate-400 border-slate-200">Standard</Badge>;
};

const DetailBadge = ({ active }: { active: boolean }) => {
    if (active) return <Badge className="bg-blue-50 text-blue-600 border-blue-100 font-bold">Vente Détail</Badge>;
    return null;
};

export default function Page() {
    const { canCreate, canEdit, canDelete } = usePermissions("gestionProduits");
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

    const [selecteditem, setSelecteditem] = useState<any | null>(null);
    const [modalType, setModalType] = useState<"add" | "edit" | "delete" | "view" | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const refreshData = () => {
        if (!magasinId) return;
        setIsLoading(true);
        apiFetch(`/produits/all/magasin/${magasinId}?per_page=${itemsPerPage}&page=${currentPage}`)
            .then((res) => {
                handleApiResponse(res);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    };

    const handleOpenModal = (type: typeof modalType, item?: any) => { setModalType(type); if (item) setSelecteditem(item); };
    const handleCloseModal = () => { setModalType(null); setSelecteditem(null); };

    const filteredData = getFilteredData(searchTerm, ["libelle", "code_barre"]);
    const currentitems = getPaginatedItems(filteredData);
    const startIndex = (currentPage - 1) * itemsPerPage;

    useEffect(() => { refreshData(); }, [magasinId, currentPage]);

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

    return (
        <ClientOnly>
            <div className="space-y-5">
                <PageHeader
                    title="Produits"
                    description={`Gestion du catalogue produits — ${magasin?.libelle ?? ""}`}
                    count={isBackendPaginated ? totalItems : filteredData.length}
                    action={
                        <div className="flex gap-2">
                            {selectedIds.length > 0 && canDelete && (
                                <button onClick={() => { setModalType("delete"); setSelecteditem(null); }} className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md flex items-center gap-2 text-sm transition-colors">
                                    <Trash className="w-4 h-4" /> Supprimer ({selectedIds.length})
                                </button>
                            )}
                            {canCreate && (
                                <PrimaryButton onClick={() => handleOpenModal("add", {})}>
                                    <Plus className="w-4 h-4" />
                                    Nouveau produit
                                </PrimaryButton>
                            )}
                        </div>
                    }
                />
                <SearchBar
                    value={searchTerm}
                    onChange={(v) => { setSearchTerm(v); setCurrentPage(1); }}
                    placeholder="Rechercher par libellé ou code barre..."
                    onRefresh={refreshData}
                    isLoading={isLoading}
                />
                <DataTable
                    title="Inventaire des produits"
                    titleIcon={<Boxes className="w-4 h-4" />}
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
                                "#", "Type/Vente", "Désignation", "Stock", "P. Vente", "Catégorie", "Unité"
                            ]}
                            afficheAction={true}
                            actionWidth="100px"
                        />
                        <tbody>
                            {isLoading ? (
                                <TableSkeletonRows cols={COLS} />
                            ) : currentitems.length === 0 ? (
                                <EmptyState message="Aucun produit trouvé" icon={<PackageOpen className="w-10 h-10" />} cols={COLS} />
                            ) : (
                                currentitems.map((item, index) => (
                                    <tr key={item.id ?? index} className="hover:bg-slate-50 transition-colors duration-100 group">
                                        <td className={TD.muted}>
                                            <input 
                                                type="checkbox" 
                                                className="cursor-pointer"
                                                checked={selectedIds.includes(item.id)} 
                                                onChange={() => handleSelectItem(item.id)} 
                                            />
                                        </td>
                                        <td className={TD.muted}>{startIndex + index + 1}</td>
                                        <td className="px-4 py-3.5 border-b border-slate-100">
                                            <div className="flex flex-col gap-1.5">
                                                <TypeBadge type={item.product_type} />
                                                <DetailBadge active={item.vente_en_detail} />
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 border-b border-slate-100">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-700">{item.libelle}</span>
                                            </div>
                                        </td>
                                        <td className={TD.base}>
                                            <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold ${item.stock <= (item.seuil || 0) ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                                                {item.stock ?? 0}
                                            </span>
                                        </td>
                                        <td className={TD.mono}>
                                            <span className="font-bold text-[#0052cc]">
                                                {formatAmount(item.prix_vente)}
                                            </span>
                                        </td>
                                        <td className={TD.base}>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                                <span className="text-xs text-slate-600 font-medium">{item.categorie?.libelle ?? "—"}</span>
                                            </div>
                                        </td>
                                        <td className={TD.base}>
                                            <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 font-bold">
                                                {item.unite?.abr ?? item.unite?.libelle ?? "—"}
                                            </span>
                                        </td>

                                        <td className={TD.action}>
                                            <ActionButtons
                                                onView={() => handleOpenModal("view", item)}
                                                onEdit={canEdit ? () => handleOpenModal("edit", item) : undefined}
                                                onDelete={canDelete ? () => handleOpenModal("delete", item) : undefined}
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </DataTable>

                <Add isOpen={modalType === "add"} onClose={handleCloseModal} onSuccess={refreshData} size="xl" />
                {selecteditem && (
                    <>
                        <Edite isOpen={modalType === "edit"} onClose={handleCloseModal} data={selecteditem} onSuccess={refreshData} size="xl" />
                        <Show isOpen={modalType === "view"} onClose={handleCloseModal} data={selecteditem} size="xl" />
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
