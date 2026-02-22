'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard, Users, Settings, Activity,
  ChevronDown, Package, ShoppingCart, ClipboardList,
  UserCheck, BarChart2, Store, Boxes, Ruler, X,
  User, Tag, CreditCard, Wallet, TrendingUp, DollarSign,
  Truck, ShieldCheck, Phone, Info, FileText, Star,
  Printer, RefreshCw, LogOut, Layers, HelpCircle,
  ShoppingBag,
} from 'lucide-react';
import type { Feature, AccesMagasinPersonnel } from '@/app/types/auth';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface SubItem { title: string; path: string }
interface MenuItem {
  title: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: SubItem[];
  isAction?: boolean;       // ex: déconnexion
  onClick?: () => void;
}
interface MenuSection {
  section: string;
  items: MenuItem[];
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

// ─────────────────────────────────────────────────────────────
// Mapping feature.code → { route, icône }
// ─────────────────────────────────────────────────────────────
export const FEATURE_ROUTE_MAP: Record<string, { path: string; icon: React.ReactNode; label?: string }> = {
  gestionCaisses: { path: '/dashboard', icon: <BarChart2 className="w-4 h-4" />, label: 'Tableau de bord' },
  gestionArticles: { path: '/articles', icon: <Package className="w-4 h-4" />, label: 'Articles' },
  gestionProduits: { path: '/produits', icon: <Boxes className="w-4 h-4" />, label: 'Produits' },
  gestionServices: { path: '/services', icon: <Layers className="w-4 h-4" />, label: 'Services' },
  gestionCategories: { path: '/categories', icon: <Tag className="w-4 h-4" />, label: 'Catégories' },
  gestionMagasins: { path: '/liste_magasin', icon: <Store className="w-4 h-4" />, label: 'Magasins' },
  gestionUnites: { path: '/unites', icon: <Ruler className="w-4 h-4" />, label: 'Unités de mesure' },
  gestionTaxe: { path: '/taxes', icon: <DollarSign className="w-4 h-4" />, label: 'Taxes' },
  gestionModePaiements: { path: '/mode_paiement', icon: <CreditCard className="w-4 h-4" />, label: 'Modes de paiement' },
  gestionVentes: { path: '/ventes', icon: <ShoppingCart className="w-4 h-4" />, label: 'Ventes' },
  gestionAchatArticles: { path: '/achats', icon: <ShoppingBag className="w-4 h-4" />, label: "Achats d'articles" },
  gestionCommandes: { path: '/commandes', icon: <ClipboardList className="w-4 h-4" />, label: 'Commandes' },
  gestionCharges: { path: '/charges', icon: <TrendingUp className="w-4 h-4" />, label: 'Charges' },
  gestionDepenses: { path: '/depenses', icon: <Wallet className="w-4 h-4" />, label: 'Dépenses' },
  gestionClients: { path: '/clients', icon: <UserCheck className="w-4 h-4" />, label: 'Clients' },
  gestionFournisseurs: { path: '/fournisseurs', icon: <Truck className="w-4 h-4" />, label: 'Fournisseurs' },
  gestionRoles: { path: '/parametres/role_marchand', icon: <ShieldCheck className="w-4 h-4" />, label: 'Rôles & permissions' },
};

// ─────────────────────────────────────────────────────────────
// Menu ADMIN (statique)
// ─────────────────────────────────────────────────────────────
const ADMIN_SECTIONS: MenuSection[] = [
  {
    section: '',
    items: [
      { title: 'Tableau de bord', icon: <LayoutDashboard className="w-4 h-4" />, path: '/dashboard' },
      {
        title: 'Gestion', icon: <Users className="w-4 h-4" />,
        subItems: [
          { title: 'Marchands', path: '/liste_marchand' },
          { title: 'Magasins', path: '/liste_magasin' },
          { title: 'Administrateurs', path: '/liste_admin' },
        ],
      },
      { title: 'Transactions', icon: <Activity className="w-4 h-4" />, path: '/transactions' },
      {
        title: 'Paramètres', icon: <Settings className="w-4 h-4" />,
        subItems: [
          { title: 'Pays', path: '/parametres/pays' },
          { title: 'Devises', path: '/parametres/devise' },
          { title: 'Fonctionnalités', path: '/parametres/features' },
          { title: 'Rôles Admin', path: '/parametres/role_admin' },
          { title: 'Rôles Marchands', path: '/parametres/role_marchand' },
        ],
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// Menu MARCHAND COMPLET (quand role est null — pas de features)
// basé sur la structure de l'app mobile
// ─────────────────────────────────────────────────────────────
function buildFullMerchantSections(onLogout: () => void): MenuSection[] {
  return [
    {
      section: 'Utilisateurs',
      items: [
        { title: 'Mon profil', icon: <User className="w-4 h-4" />, path: '/profil' },
        { title: 'Personnel', icon: <Users className="w-4 h-4" />, path: '/personnel' },
        { title: 'Rôles & permissions', icon: <ShieldCheck className="w-4 h-4" />, path: '/parametres/role_marchand' },
      ],
    },
    {
      section: 'Gestion du stock',
      items: [
        { title: 'Articles', icon: <Package className="w-4 h-4" />, path: '/articles' },
        { title: 'Produits', icon: <Boxes className="w-4 h-4" />, path: '/produits' },
        { title: 'Services', icon: <Layers className="w-4 h-4" />, path: '/services' },
        { title: 'Catégories', icon: <Tag className="w-4 h-4" />, path: '/categories' },
      ],
    },
    {
      section: 'Paramètres magasin',
      items: [
        { title: 'Magasins', icon: <Store className="w-4 h-4" />, path: '/liste_magasin' },
        { title: 'Unités de mesure', icon: <Ruler className="w-4 h-4" />, path: '/unites' },
        { title: 'Taxes', icon: <DollarSign className="w-4 h-4" />, path: '/taxes' },
        { title: 'Modes de paiement', icon: <CreditCard className="w-4 h-4" />, path: '/mode_paiement' },
      ],
    },
    {
      section: 'Activités',
      items: [
        { title: 'Ventes', icon: <ShoppingCart className="w-4 h-4" />, path: '/ventes' },
        { title: "Achats d'articles", icon: <ShoppingBag className="w-4 h-4" />, path: '/achats' },
        { title: 'Commandes', icon: <ClipboardList className="w-4 h-4" />, path: '/commandes' },
        { title: 'Charges', icon: <TrendingUp className="w-4 h-4" />, path: '/charges' },
        { title: 'Dépenses', icon: <Wallet className="w-4 h-4" />, path: '/depenses' },
      ],
    },
    {
      section: 'Tiers',
      items: [
        { title: 'Clients', icon: <UserCheck className="w-4 h-4" />, path: '/clients' },
        { title: 'Fournisseurs', icon: <Truck className="w-4 h-4" />, path: '/fournisseurs' },
      ],
    },
    {
      section: 'Trésorerie',
      items: [
        { title: 'Caisses', icon: <BarChart2 className="w-4 h-4" />, path: '/dashboard' },
      ],
    },
    {
      section: 'Plus',
      items: [
        { title: 'Abonnements', icon: <Star className="w-4 h-4" />, path: '/abonnements' },
        { title: 'FAQ', icon: <HelpCircle className="w-4 h-4" />, path: '/faq' },
        { title: 'Nous contacter', icon: <Phone className="w-4 h-4" />, path: '/contact' },
        { title: 'À propos', icon: <Info className="w-4 h-4" />, path: '/apropos' },
        { title: 'Conditions générales', icon: <FileText className="w-4 h-4" />, path: '/conditions' },
        { title: 'Imprimantes', icon: <Printer className="w-4 h-4" />, path: '/imprimantes' },
        {
          title: 'Se déconnecter',
          icon: <LogOut className="w-4 h-4" />,
          isAction: true,
          onClick: onLogout,
        },
      ],
    },
  ];
}

// ─────────────────────────────────────────────────────────────
// Construit le menu depuis les features API
// ─────────────────────────────────────────────────────────────
function buildFeatureSections(features: Feature[]): MenuSection[] {
  const items: MenuItem[] = [];
  const seen = new Set<string>();

  for (const f of features) {
    const mapped = FEATURE_ROUTE_MAP[f.code];
    if (!mapped || seen.has(mapped.path)) continue;
    seen.add(mapped.path);
    items.push({
      title: mapped.label ?? f.libelle,
      icon: mapped.icon,
      path: mapped.path,
    });
  }

  return items.length ? [{ section: '', items }] : [];
}

// ─────────────────────────────────────────────────────────────
// Composant MenuItem (un seul item de navigation)
// ─────────────────────────────────────────────────────────────
function NavItem({
  item, isCollapsed, pathname, onToggle, depth = 0,
  openMenus, onMenuToggle,
}: {
  item: MenuItem;
  isCollapsed: boolean;
  pathname: string;
  onToggle: () => void;
  depth?: number;
  openMenus: string[];
  onMenuToggle: (title: string) => void;
}) {
  const isActive = (p: string) => pathname === p || pathname.startsWith(p + '/');
  const hasChildren = !!item.subItems?.length;
  const isOpen = openMenus.includes(item.title);
  const parentActive = item.path ? isActive(item.path) : item.subItems?.some(s => pathname === s.path);

  // Action (déconnexion…)
  if (item.isAction) {
    return (
      <button
        onClick={item.onClick}
        title={isCollapsed ? item.title : ''}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 text-red-400 hover:text-red-300 hover:bg-red-500/10 ${isCollapsed ? 'justify-center' : ''}`}
      >
        <span className="flex-shrink-0 w-4 h-4">{item.icon}</span>
        {!isCollapsed && <span className="truncate">{item.title}</span>}
      </button>
    );
  }

  // Lien direct
  if (!hasChildren && item.path) {
    const active = isActive(item.path);
    return (
      <Link
        href={item.path}
        onClick={() => { if (window.innerWidth < 1024) onToggle(); }}
        title={isCollapsed ? item.title : ''}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${active ? 'bg-[#0052CC] text-white font-medium' : 'text-white/55 hover:text-white hover:bg-white/8'
          } ${isCollapsed ? 'justify-center' : ''}`}
      >
        <span className="flex-shrink-0 w-4 h-4">{item.icon}</span>
        {!isCollapsed && <span className="truncate">{item.title}</span>}
      </Link>
    );
  }

  // Groupe avec sous-items
  return (
    <>
      <button
        onClick={() => onMenuToggle(item.title)}
        title={isCollapsed ? item.title : ''}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${parentActive ? 'text-white font-medium' :
            isOpen ? 'text-white/80' :
              'text-white/55 hover:text-white hover:bg-white/8'
          } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex-shrink-0 w-4 h-4">{item.icon}</span>
          {!isCollapsed && <span className="truncate">{item.title}</span>}
        </div>
        {!isCollapsed && (
          <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </button>

      {!isCollapsed && isOpen && item.subItems && (
        <div className="mt-0.5 ml-7 space-y-0.5 border-l border-white/8 pl-3">
          {item.subItems.map(sub => (
            <Link
              key={sub.path}
              href={sub.path}
              onClick={() => { if (window.innerWidth < 1024) onToggle(); }}
              className={`block px-3 py-2 text-[13px] rounded-md transition-all duration-150 ${pathname === sub.path ? 'text-white font-medium bg-[#0052CC]/30' : 'text-white/45 hover:text-white hover:bg-white/6'
                }`}
            >
              {sub.title}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Sidebar principal
// ─────────────────────────────────────────────────────────────
export default function MoomenProSidebar({
  isOpen, onToggle, isCollapsed, onCollapsedChange,
}: SidebarProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const u = session?.user as any;
  const isAdmin = u?.kind === 'admin';
  const nom = u?.nom ?? '';
  const prenoms = u?.prenoms ?? '';
  const features: Feature[] = u?.features ?? [];
  const roleLibelle: string = u?.roleLibelle ?? '';

  // Détermine le jeu de sections
  const sections: MenuSection[] = useMemo(() => {
    if (status === 'loading') return [];

    if (isAdmin) return ADMIN_SECTIONS;

    // Marchand avec rôle + features → menu filtré
    if (features.length > 0) return buildFeatureSections(features);

    // Marchand sans rôle → menu complet
    return buildFullMerchantSections(() => signOut({ callbackUrl: '/login' }));
  }, [isAdmin, features, status]);

  // Infos affichage
  const displayName = nom ? `${prenoms} ${nom}`.trim() : (session?.user?.email ?? '…');
  const initials = displayName.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase() || 'U';

  const kindLabel = isAdmin
    ? 'Administrateur'
    : features.length > 0
      ? roleLibelle || 'Marchand'
      : 'Marchand (complet)';

  const kindColor = isAdmin ? 'bg-[#0052CC]/20 text-[#6EA8FF]' : 'bg-emerald-500/15 text-emerald-400';

  // Ouvre le groupe parent de la route active
  useEffect(() => {
    const toOpen: string[] = [];
    sections.forEach(sec =>
      sec.items.forEach(item => {
        if (item.subItems?.some(s => pathname.startsWith(s.path))) toOpen.push(item.title);
      })
    );
    if (toOpen.length) setOpenMenus(toOpen);
  }, [pathname, sections]);

  const toggleMenu = (title: string) => {
    if (isCollapsed) {
      onCollapsedChange(false);
      setTimeout(() => setOpenMenus([title]), 150);
    } else {
      setOpenMenus(prev => prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onToggle} />}

      <div className={`
        fixed top-0 left-0 h-full z-50 bg-[#0A1628] text-white flex flex-col
        transition-all duration-300 ease-in-out border-r border-white/5
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'w-[68px]' : 'w-60'}
      `}>

        {/* ── Logo ── */}
        <div className={`flex items-center border-b border-white/8 flex-shrink-0 ${isCollapsed ? 'h-16 justify-center px-2' : 'h-[72px] px-4 gap-3'}`}>
          {isCollapsed ? (
            <div className="relative w-[38px] h-[38px] rounded-full flex items-center justify-center"
              style={{ background: 'conic-gradient(from 0deg, rgba(0,82,204,0.15), rgba(0,82,204,0.4), rgba(0,82,204,0.15))' }}>
              <div className="w-[30px] h-[30px] rounded-full bg-white border border-[#0052CC]/30 shadow flex items-center justify-center overflow-hidden">
                <div className="relative w-[22px] h-[22px]">
                  <Image src="/logo.jpeg" alt="Moomen Pro" fill className="object-contain" priority />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="relative w-[44px] h-[44px] rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'conic-gradient(from 0deg, rgba(0,82,204,0.15), rgba(0,82,204,0.45), rgba(0,82,204,0.15))' }}>
                <div className="w-[36px] h-[36px] rounded-full bg-white border border-[#0052CC]/30 shadow-md flex items-center justify-center overflow-hidden">
                  <div className="relative w-[26px] h-[26px]">
                    <Image src="/logo.jpeg" alt="Moomen Pro" fill className="object-contain" priority />
                  </div>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white leading-tight truncate">Moomen Pro</p>
                <p className="text-[10px] text-white/40 leading-tight mt-0.5">
                  {isAdmin ? 'Administration' : 'Espace Marchand'}
                </p>
              </div>
              <button onClick={onToggle} className="ml-auto lg:hidden p-1.5 rounded-md hover:bg-white/10 transition-colors flex-shrink-0">
                <X className="w-4 h-4 text-white/50" />
              </button>
            </>
          )}
        </div>

        {/* ── Badge type ── */}
        {!isCollapsed && status === 'authenticated' && (
          <div className="px-4 pt-3 pb-1">
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${kindColor}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {kindLabel}
            </span>
          </div>
        )}

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-2 space-y-0">
          {status === 'loading' ? (
            <div className="space-y-1 px-1 pt-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-8 rounded-lg bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : (
            sections.map((sec, si) => (
              <div key={`sec-${si}-${sec.section}`} className={si > 0 ? 'mt-1' : ''}>
                {/* Titre de section */}
                {!isCollapsed && sec.section && (
                  <p className="px-3 py-2 text-[9px] font-bold text-white/25 uppercase tracking-widest">
                    {sec.section}
                  </p>
                )}
                {isCollapsed && sec.section && si > 0 && (
                  <div className="mx-3 my-1.5 h-px bg-white/8" />
                )}

                {/* Items */}
                <div className="space-y-0.5">
                  {sec.items.map((item, ii) => (
                    <NavItem
                      key={`${si}-${ii}-${item.title}`}
                      item={item}
                      isCollapsed={isCollapsed}
                      pathname={pathname}
                      onToggle={onToggle}
                      openMenus={openMenus}
                      onMenuToggle={toggleMenu}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </nav>

        {/* ── Footer — utilisateur ── */}
        <div className="flex-shrink-0 border-t border-white/8 p-3">
          {!isCollapsed ? (
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-white/5">
              <div className="w-8 h-8 bg-[#0052CC] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">{initials}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-white/90 truncate leading-tight">{displayName}</p>
                <p className="text-[11px] text-white/40 truncate leading-tight">{roleLibelle || '—'}</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-[#0052CC] rounded-full flex items-center justify-center" title={displayName}>
                <span className="text-white text-xs font-bold">{initials}</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </>
  );
}