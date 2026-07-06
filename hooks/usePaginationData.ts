import { useState } from 'react';

export function usePaginationData(initialItemsPerPage = 15) {
    const [currentPage, setCurrentPage] = useState(1);
    const [data, setData] = useState<any[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [isBackendPaginated, setIsBackendPaginated] = useState(false);
    const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

    const handleApiResponse = (res: any) => {
        if (!res) {
            setData([]);
            setTotalItems(0);
            setIsBackendPaginated(false);
            return;
        }

        // Cas 3: Format { status: true, data: [...], pagination: { current_page, total, per_page } }
        if (res.pagination && Array.isArray(res.data)) {
            setData(res.data);
            setTotalItems(res.pagination.total || res.data.length);
            setCurrentPage(res.pagination.current_page || 1);
            setItemsPerPage(res.pagination.per_page || initialItemsPerPage);
            setIsBackendPaginated(true);
        }
        // Cas 1: Paginator Laravel racine (LengthAwarePaginator)
        else if (res.current_page !== undefined && Array.isArray(res.data)) {
            setData(res.data);
            setTotalItems(res.total || res.data.length);
            setCurrentPage(res.current_page || 1);
            setItemsPerPage(res.per_page || initialItemsPerPage);
            setIsBackendPaginated(true);
        }
        // Cas 2: Wrappé { data: { current_page, data, total } }
        else if (res.data && res.data.current_page !== undefined && Array.isArray(res.data.data)) {
            setData(res.data.data);
            setTotalItems(res.data.total || res.data.data.length);
            setCurrentPage(res.data.current_page || 1);
            setItemsPerPage(res.data.per_page || initialItemsPerPage);
            setIsBackendPaginated(true);
        }
        // Cas 4: Simple tableau / Tableau sans pagination
        else {
            const list = Array.isArray(res) ? res : (Array.isArray(res.data) ? res.data : []);
            setData(list);
            setTotalItems(list.length);
            setIsBackendPaginated(false);
        }
    };

    // Helper pour filtrer selon les termes de recherche
    const getFilteredData = (searchTerm: string, filterKeys: string[]) => {
        if (!Array.isArray(data)) return [];
        if (!searchTerm) return data;
        
        return data.filter((item) => {
            return filterKeys.some((key) => {
                const val = item[key];
                return val && String(val).toLowerCase().includes(searchTerm.toLowerCase());
            });
        });
    };

    // Helper pour récupérer la portion de données à afficher
    const getPaginatedItems = (filteredData: any[]) => {
        if (isBackendPaginated) {
            return filteredData; // Déjà paginé par le backend
        }
        // Pagination Front-end
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(startIndex, Math.min(startIndex + itemsPerPage, filteredData.length));
    };

    return {
        currentPage,
        setCurrentPage,
        data,
        setData, 
        totalItems,
        setTotalItems,
        itemsPerPage,
        isBackendPaginated,
        handleApiResponse,
        getFilteredData,
        getPaginatedItems
    };
}
