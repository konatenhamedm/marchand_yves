'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bell, Search, PanelLeft } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

interface NavbarProps {
  onMenuToggle: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Navbar({ onMenuToggle, isCollapsed, onToggleCollapse }: NavbarProps) {
  const { data: session } = useSession();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const getInitials = () => {
    const u = session?.user as any;
    if (u?.prenoms && u?.nom) {
      return `${u.prenoms.charAt(0)}${u.nom.charAt(0)}`.toUpperCase();
    }
    return session?.user?.email?.charAt(0).toUpperCase() || 'U';
  };

  const getDisplayName = () => {
    const u = session?.user as any;
    if (u?.prenoms && u?.nom) return `${u.prenoms} ${u.nom}`;
    return session?.user?.email || 'Utilisateur';
  };

  const getRoleLabel = () => {
    const u = session?.user as any;
    return u?.roleLibelle || (u?.kind === 'admin' ? 'Administrateur' : 'Marchand');
  };

  return (
    <nav className="sticky top-0 z-[110] bg-white border-b border-slate-200 w-full">
      <div className="px-4 sm:px-6 h-15 flex items-center justify-between w-full" style={{ height: '60px' }}>

        {/* Left */}
        <div className="flex items-center gap-2">
          {/* Mobile burger */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Collapse — desktop */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title={isCollapsed ? 'Étendre le menu' : 'Réduire le menu'}
          >
            <PanelLeft className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>

          {/* Search */}
          <div className="hidden md:flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="pl-9 pr-4 py-2 w-64 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Search mobile */}
          <button className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
            <Search className="w-4 h-4" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setNotificationsOpen(!notificationsOpen); setProfileOpen(false); }}
              className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            </button>

            {notificationsOpen && (
              <>
                <div className="fixed inset-0 z-[100]" onClick={() => setNotificationsOpen(false)} />
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-slate-200 shadow-lg z-[105] overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
                    <span className="text-xs text-slate-400">3 non lues</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                    {[
                      { title: 'Nouveau marchand inscrit', time: 'Il y a 2 h' },
                      { title: 'Abonnement expiré', time: 'Il y a 5 h' },
                      { title: 'Rapport mensuel disponible', time: 'Hier' },
                    ].map((n, i) => (
                      <button
                        key={i}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-start gap-3"
                      >
                        <div className="w-2 h-2 rounded-full bg-[#0052CC] mt-1.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-slate-700">{n.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50">
                    <button className="text-xs font-medium text-[#0052CC] hover:text-[#0041A8] transition-colors">
                      Voir toutes les notifications →
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => { setProfileOpen(!profileOpen); setNotificationsOpen(false); }}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="w-8 h-8 bg-[#0052CC] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-semibold">{getInitials()}</span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-slate-800 leading-tight">{getDisplayName()}</p>
                <p className="text-xs text-slate-400 leading-tight">{getRoleLabel()}</p>
              </div>
              <svg className="w-3.5 h-3.5 text-slate-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-[100]" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-lg z-[105] overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                    <p className="text-sm font-semibold text-slate-800 truncate">{getDisplayName()}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{session?.user?.email}</p>
                  </div>
                  <div className="py-1">
                    <Link href="/profil">
                      <button
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Mon Profil
                      </button>
                    </Link>
                    <Link href="/settings">
                      <button
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Paramètres
                      </button>
                    </Link>
                  </div>
                  <div className="border-t border-slate-100 py-1">
                    <button
                      onClick={() => signOut({ callbackUrl: '/login' })}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Déconnexion
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
