/**
 * Composants de layout réutilisables pour les pages de liste
 * Moomen Pro — Design System B2B
 */
import React from "react";
import { Search, RefreshCw } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// PageHeader — titre + bouton d'action principal
// ─────────────────────────────────────────────────────────────
interface PageHeaderProps {
    title: string;
    description?: string;
    action?: React.ReactNode;
    count?: number;
}

export function PageHeader({ title, description, action, count }: PageHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-slate-900">{title}</h1>
                    {count !== undefined && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EBF2FF] text-[#0052CC]">
                            {count}
                        </span>
                    )}
                </div>
                {description && (
                    <p className="text-sm text-slate-400 mt-0.5">{description}</p>
                )}
            </div>
            {action && <div className="flex-shrink-0">{action}</div>}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// PrimaryButton
// ─────────────────────────────────────────────────────────────
interface PrimaryButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    type?: "button" | "submit";
    className?: string;
}

export function PrimaryButton({ children, onClick, disabled, type = "button", className = "" }: PrimaryButtonProps) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#0052CC] hover:bg-[#0041A8] disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition-colors shadow-sm ${className}`}
        >
            {children}
        </button>
    );
}

// ─────────────────────────────────────────────────────────────
// SearchBar — barre de recherche + filtre optionnel
// ─────────────────────────────────────────────────────────────
interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    children?: React.ReactNode; // filtres supplémentaires
    onRefresh?: () => void;
    isLoading?: boolean;
}

export function SearchBar({ value, onChange, placeholder = "Rechercher...", children, onRefresh, isLoading }: SearchBarProps) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC] focus:bg-white transition-all"
                />
            </div>
            {children}
            {onRefresh && (
                <button
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                    title="Actualiser"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                </button>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// DataTable wrapper — conteneur tableau pro
// ─────────────────────────────────────────────────────────────
interface DataTableProps {
    title?: string;
    titleIcon?: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export function DataTable({ title, titleIcon, children, footer }: DataTableProps) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            {title && (
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                    {titleIcon && <span className="text-[#0052CC]">{titleIcon}</span>}
                    <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
                </div>
            )}
            <div className="overflow-x-auto">
                {children}
            </div>
            {footer && (
                <div className="px-4 border-t border-slate-100">
                    {footer}
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// TableSkeletonRows — lignes squelettes durante chargement
// ─────────────────────────────────────────────────────────────
interface TableSkeletonProps {
    cols: number;
    rows?: number;
}

export function TableSkeletonRows({ cols, rows = 6 }: TableSkeletonProps) {
    return (
        <>
            {Array.from({ length: rows }).map((_, i) => (
                <tr key={i} className="border-b border-slate-100 animate-pulse">
                    {Array.from({ length: cols }).map((_, j) => (
                        <td key={j} className="px-4 py-4">
                            <div className={`h-4 bg-slate-100 rounded ${j === 0 ? "w-3/4" : j === cols - 1 ? "w-1/2 mx-auto" : "w-full"}`} />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}

// ─────────────────────────────────────────────────────────────
// EmptyState — état vide
// ─────────────────────────────────────────────────────────────
interface EmptyStateProps {
    message?: string;
    icon?: React.ReactNode;
    cols: number;
}

export function EmptyState({ message = "Aucun résultat trouvé", icon, cols }: EmptyStateProps) {
    return (
        <tr>
            <td colSpan={cols} className="px-4 py-16 text-center">
                <div className="flex flex-col items-center gap-3 text-slate-400">
                    {icon && <div className="opacity-30">{icon}</div>}
                    <p className="text-sm font-medium">{message}</p>
                </div>
            </td>
        </tr>
    );
}

// ─────────────────────────────────────────────────────────────
// ActionButtons — boutons d'actions du tableau (voir/éditer/supprimer)
// ─────────────────────────────────────────────────────────────
interface ActionButtonProps {
    onView?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

export function ActionButtons({ onView, onEdit, onDelete }: ActionButtonProps) {
    return (
        <div className="flex items-center justify-center gap-1">
            {onView && (
                <button
                    onClick={onView}
                    title="Voir le détail"
                    className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-[#EBF2FF] text-[#0052CC] hover:bg-[#0052CC] hover:text-white transition-all duration-150"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                </button>
            )}
            {onEdit && (
                <button
                    onClick={onEdit}
                    title="Modifier"
                    className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white transition-all duration-150"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </button>
            )}
            {onDelete && (
                <button
                    onClick={onDelete}
                    title="Supprimer"
                    className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-150"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// StatusBadge
// ─────────────────────────────────────────────────────────────
type StatusVariant = "active" | "inactive" | "pending" | "success" | "error" | "warning" | "info";

interface StatusBadgeProps {
    status: boolean | StatusVariant;
    label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
    const isActive = status === true || status === "active" || status === "success";
    const isWarning = status === "warning" || status === "pending";
    const isError = status === false || status === "inactive" || status === "error";

    const cls = isError
        ? "bg-red-50 text-red-600"
        : isWarning
            ? "bg-amber-50 text-amber-600"
            : "bg-green-50 text-green-700";

    const dot = isError
        ? "bg-red-400"
        : isWarning
            ? "bg-amber-400"
            : "bg-green-500";

    const defaultLabel = isError ? "Inactif" : isWarning ? "En attente" : "Actif";

    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
            {label || defaultLabel}
        </span>
    );
}

// ─────────────────────────────────────────────────────────────
// TableCell helpers
// ─────────────────────────────────────────────────────────────
export const TD = {
    base: "px-4 py-3.5 text-sm text-slate-700 border-b border-slate-100",
    muted: "px-4 py-3.5 text-sm text-slate-400 border-b border-slate-100",
    mono: "px-4 py-3.5 text-xs font-mono text-[#0052CC] font-semibold border-b border-slate-100",
    bold: "px-4 py-3.5 text-sm font-semibold text-slate-800 border-b border-slate-100",
    action: "px-4 py-3 border-b border-slate-100",
};
