const fs = require('fs');
const glob = require('glob');
const path = require('path');

const extractPaginationHookCode = `import { useState } from "react";

export function usePagination(itemsPerPageDefault = 15) {
    const [currentPage, setCurrentPage] = useState(1);
    const [data, setData] = useState<any[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [isBackendPaginated, setIsBackendPaginated] = useState(false);

    const handleApiResponse = (res: any) => {
        if (!res) {
            setData([]);
            setTotalItems(0);
            setIsBackendPaginated(false);
            return;
        }

        if (res.pagination && Array.isArray(res.data)) {
            setData(res.data);
            setTotalItems(res.pagination.total || res.data.length);
            setCurrentPage(res.pagination.current_page || 1);
            setIsBackendPaginated(true);
        } else if (res.current_page !== undefined && Array.isArray(res.data)) {
            setData(res.data);
            setTotalItems(res.total || res.data.length);
            setCurrentPage(res.current_page || 1);
            setIsBackendPaginated(true);
        } else if (res.data?.current_page !== undefined && Array.isArray(res.data?.data)) {
            setData(res.data.data);
            setTotalItems(res.data.total || res.data.data.length);
            setCurrentPage(res.data.current_page || 1);
            setIsBackendPaginated(true);
        } else {
            const list = Array.isArray(res) ? res : (Array.isArray(res.data) ? res.data : []);
            setData(list);
            setTotalItems(list.length);
            setIsBackendPaginated(false);
        }
    };

    const getPaginatedData = (filteredData: any[]) => {
        if (isBackendPaginated) return filteredData;
        const startIndex = (currentPage - 1) * itemsPerPageDefault;
        return filteredData.slice(startIndex, startIndex + itemsPerPageDefault);
    };

    return {
        currentPage,
        setCurrentPage,
        data,
        handleApiResponse,
        totalItems,
        getPaginatedData,
        itemsPerPage: itemsPerPageDefault,
        setData, // Expose setData in case some components manipulate state directly
        setTotalItems, // Expose in case needed
    };
}
`;

fs.mkdirSync('/Volumes/konate/PERSONNEL/YVES/moomen_front/hooks', { recursive: true });
const hookPath = '/Volumes/konate/PERSONNEL/YVES/moomen_front/hooks/usePagination.ts';
if (!fs.existsSync(hookPath)) {
    fs.writeFileSync(hookPath, extractPaginationHookCode, 'utf8');
}

// Regex implementation to refactor components.
// We are looking for lines with:
// const [currentPage, setCurrentPage] = useState(1);
// const [data, setData] = useState<any[]>([]);
// const [totalItems, setTotalItems] = useState(0);
// const itemsPerPage = 15;
