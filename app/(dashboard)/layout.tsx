'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import AnimatedContent from '@/components/ui/AnimatedContent';
import { MagasinProvider } from '@/context/MagasinContext';

// Pages qui gèrent leur propre layout/padding (pas de padding supplémentaire)
const NO_EXTRA_PADDING_ROUTES = ['/faq'];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  const hasExtraPadding = !NO_EXTRA_PADDING_ROUTES.some(route =>
    pathname?.endsWith(route)
  );

  const router = useRouter();

  // 🟢 DÉTECTION GLOBALE DE DOUCHETTE POUR REDIRECTION AUTO
  const lastKeyTimeRef = useRef<number>(0);
  const keyVelocityCountRef = useRef<number>(0);
  const accumulatedScanRef = useRef<string>("");

  useEffect(() => {
    // Pages qui bloquent l'intercepteur global pour garder le scan local
    const EXCLUDED_ROUTES = ['/commandes', '/achats', '/articles', '/ventes/pos'];
    if (!pathname || EXCLUDED_ROUTES.some(route => pathname.startsWith(route))) return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignore si on tape dans un champ (input, textarea, select)
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") return;

      // Ignore si une modale est ouverte n'importe où sur l'écran !
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
          // Redirection globale instantanée vers la page de Caisse !
          router.push(`/ventes/pos?scan=${encodeURIComponent(accumulatedScanRef.current)}`);
          keyVelocityCountRef.current = 0;
          accumulatedScanRef.current = "";
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [pathname, router]);

  return (
    <MagasinProvider>
      <div className="min-h-screen bg-[#F8FAFC]">
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          isCollapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />
        <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-[68px]' : 'lg:ml-60'}`}>
          <Navbar
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
          <main className={`p-5 sm:p-6 ${hasExtraPadding ? 'sm:px-8' : ''}`}>
            <AnimatedContent>
              {children}
            </AnimatedContent>
          </main>
        </div>
      </div>
    </MagasinProvider>
  );
}