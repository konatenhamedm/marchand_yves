"use client";

import React, { useEffect, useState } from "react";
import { ClientOnly } from "@/components/ui/client-only";
import { Plus, Package, Store, Zap, ShoppingCart, PackageOpen, Trash } from "lucide-react";
import { apiFetch } from "@/lib/axios";
import { toast } from "sonner";
import { Pagination } from "@/components/ui/pagination";
import { usePaginationData } from "@/hooks/usePaginationData";
import { TableHeaderCustom } from "@/components/ui/TableHeaderCustom";
import {
    PageHeader, PrimaryButton, SearchBar, DataTable,
    TableSkeletonRows, EmptyState, ActionButtons, TD,
} from "@/components/ui/page-components";
import { useMagasin } from "@/context/MagasinContext";
import { Badge } from "@/components/ui/badge";
import { usePermissions } from "@/hooks/usePermissions";
import { useCurrency } from "@/hooks/useCurrency";
import { Add } from "./Add";
import { Edite } from "./Edite";
import { Delete } from "./Delete";
import { Show } from "./Show";

const TypeBadge = ({ type }: { type: string }) => {
    if (type === "manufacturable") {
        return <Badge className="bg-purple-100 text-purple-600 border-purple-200 gap-1 font-bold"><Zap className="w-3 h-3" /> Fabriqué</Badge>;
    }
    return <Badge variant="outline" className="text-slate-400 border-slate-200">Standard</Badge>;
};

const DetailBadge = ({ active }: { active: boolean | number }) => {
    if (active) return <Badge className="bg-blue-50 text-blue-600 border-blue-100 font-bold">Vente Détail</Badge>;
    return null;
};

export default function Page() {
    const { magasinId, magasin, isLoading: magasinLoading } = useMagasin();
    const { canCreate, canEdit, canDelete } = usePermissions("gestionArticles");
    const { formatAmount } = useCurrency();
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
        apiFetch(`/articles/all/magasin/{id}`.replace("{id}", String(magasinId)) + `?per_page=${itemsPerPage}&page=${currentPage}`)
            .then((res) => {
                handleApiResponse(res);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    };

    // --- DOUCHETTE (BARCODE SCANNER) LOGIC ---
    const lastKeyTimeRef = React.useRef<number>(0);
    const keyVelocityCountRef = React.useRef<number>(0);
    const accumulatedScanRef = React.useRef<string>("");

    const sanitizeBarcode = (raw: string) => {
        const azertyMap: Record<string, string> = {
            '&': '1', 'é': '2', '"': '3', "'": '4', '(': '5',
            '§': '6', '-': '6', 'è': '7', '!': '8', '_': '8', 'ç': '9', 'à': '0',
            'A': 'Q', 'Q': 'A', 'Z': 'W', 'W': 'Z', 'M': ',', '?': 'M'
        };
        let res = "";
        for (let char of raw) {
            res += azertyMap[char] !== undefined ? azertyMap[char] : char;
        }
        // Nettoyer : garder uniquement chiffres et lettres (A-Z, 0-9)
        return res.replace(/[^A-Z0-9]/gi, '');
    };

    React.useEffect(() => {
        if (!magasinId) return;

        const handleGlobalKeyDown = async (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") return;

            // Ignore if a modal is ALREADY open (unless it's the barcode itself, but typically we want fresh scans)
            if (document.querySelector('[role="dialog"]') || document.body.style.pointerEvents === 'none') return;

            if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                const now = Date.now();
                if (now - lastKeyTimeRef.current < 40) {
                    keyVelocityCountRef.current += 1;
                    accumulatedScanRef.current += e.key;
                } else {
                    keyVelocityCountRef.current = 1;
                    accumulatedScanRef.current = e.key;
                }
                lastKeyTimeRef.current = now;
            } else if (e.key === "Enter" && keyVelocityCountRef.current >= 6) {
                e.preventDefault();
                const codeRaw = accumulatedScanRef.current;
                const code = sanitizeBarcode(codeRaw);
                
                keyVelocityCountRef.current = 0;
                accumulatedScanRef.current = "";

                if (!code) return;

                // Chercher l'article par scan API
                if (!code) return;
                
                try {
                    const res = await apiFetch(`/articleProduitsServices/scan/${code}/magasin/${magasinId}`);
                    if (res?.data) {
                        toast.success(`${res.data.libelle} trouvé !`);
                        handleOpenModal("edit", { ...res.data, code_barre: code, bar_code: code });
                    } else {
                        toast.info("Article non trouvé. Mode création.");
                        setModalType("add");
                        setSelecteditem({ code_barre: code }); 
                    }
                } catch {
                    // Toute erreur (404, réseau, etc.) => mode création
                    toast.info("Article non trouvé. Mode création.");
                    setModalType("add");
                    setSelecteditem({ code_barre: code }); 
                }
            }
        };

        window.addEventListener("keydown", handleGlobalKeyDown);
        return () => window.removeEventListener("keydown", handleGlobalKeyDown);
    }, [magasinId]);
    // ------------------------------------------

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
                    title="Articles"
                    description={`Gestion de l'inventaire des articles — ${magasin?.libelle ?? ""}`}
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
                                    Nouvel article
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
                    title="Liste des articles"
                    titleIcon={<Package className="w-4 h-4" />}
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
                                "#", "Désignation", "Stock", "P. Vente", "Catégorie", "Unité"
                            ]}
                            afficheAction={true}
                            actionWidth="100px"
                        />
                        <tbody>
                            {isLoading ? (
                                <TableSkeletonRows cols={COLS} />
                            ) : currentitems.length === 0 ? (
                                <EmptyState message="Aucun article trouvé" icon={<PackageOpen className="w-10 h-10" />} cols={COLS} />
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
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-700">{item.libelle}</span>
                                                {item.code_barre && <span className="text-[10px] text-slate-400 font-mono tracking-tighter mt-1">{item.code_barre}</span>}
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

                <Add isOpen={modalType === "add"} onClose={handleCloseModal} onSuccess={refreshData} size="xl" initialData={selecteditem} />
                {selecteditem && modalType !== "add" && (
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
