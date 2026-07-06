'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { ClientOnly } from '@/components/ui/client-only';
import { ChevronLeft, ShieldCheck, Zap, Star, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

interface AuthWrapperProps {
  title: string;
  subtitle?: string | React.ReactNode;
  imageTitle?: string;
  imageSubtitle?: string;
  children: React.ReactNode;
  showBack?: boolean;
  wide?: boolean;
}

export const AuthWrapper = ({
  title,
  subtitle,
  imageTitle = "Gérez votre entreprise intelligemment.",
  imageSubtitle = "Ventes, stocks, finances et suivi — tout centralisé dans une interface moderne et performante.",
  children,
  showBack = false,
  wide = false
}: AuthWrapperProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      size: number; opacity: number; color: string;
    }> = [];

    const colors = ['#0052CC', '#0041A8', '#5C8FFF', '#ffffff'];

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      particles.forEach((p, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 82, 204, ${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });

      // Draw particles
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.round(p.opacity * 255).toString(16).padStart(2, '0');
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });

      animId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <ClientOnly>
      <div className="auth-page-root">
        {/* Animated Background */}
        <div className="auth-bg-layer" />
        <div className="auth-bg-mesh" />

        {/* Floating Orbs */}
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />

        {/* Particle Canvas */}
        <canvas ref={canvasRef} className="auth-canvas" />

        {/* Grid Pattern */}
        <div className="auth-grid-pattern" />

        {/* ── Left Panel : Branding ── */}
        <div className="auth-left-panel">
          {/* Logo */}
          <div className="auth-brand">
            <div className="auth-brand-icon">
              <LayoutDashboard className="w-5 h-5 text-[#0A1628]" />
            </div>
            <span className="auth-brand-name">moomen<span className="auth-brand-dot">.</span>pro</span>
          </div>

          {/* Center content */}
          <div className="auth-left-content">
            <div className="auth-badge">
              <span className="auth-badge-dot" />
              Écosystème B2B Intelligent
            </div>

            <div className="auth-left-headline">
              <h2 className="auth-headline-text">
                {imageTitle.includes('.') ? (
                  <>
                    {imageTitle.split('.')[0]}
                    <span className="auth-headline-accent">.</span>
                  </>
                ) : imageTitle}
              </h2>
              <p className="auth-subheadline">{imageSubtitle}</p>
            </div>

            {/* Feature Pills */}
            <div className="auth-features">
              {[
                { icon: <ShieldCheck className="w-3.5 h-3.5" />, label: 'Sécurisé SSL 256-bit' },
                { icon: <Zap className="w-3.5 h-3.5" />, label: 'Infrastructure Cloud' },
                { icon: <Star className="w-3.5 h-3.5" />, label: 'Disponibilité 99.9%' },
              ].map(f => (
                <div key={f.label} className="auth-feature-pill">
                  {f.icon}
                  <span>{f.label}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="auth-stats">
              {[
                { value: '5k+', label: 'Magasins' },
                { value: '24/7', label: 'Monitorage' },
                { value: '10+', label: 'Pays' },
              ].map(s => (
                <div key={s.label} className="auth-stat">
                  <span className="auth-stat-value">{s.value}</span>
                  <span className="auth-stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="auth-left-footer">
            <span>© 2026</span>
            <span className="auth-footer-sep" />
            <span>Moomen Network</span>
          </div>
        </div>

        {/* ── Right Panel : Form ── */}
        <div className="auth-right-panel">
          <div className={`auth-form-container ${wide ? 'auth-form-wide' : ''}`}>

            {/* Mobile Logo */}
            <div className="auth-mobile-brand">
              <div className="auth-brand-icon auth-brand-icon-sm">
                <LayoutDashboard className="w-4 h-4 text-[#0A1628]" />
              </div>
              <span className="auth-brand-name">moomen<span className="auth-brand-dot">.</span>pro</span>
            </div>

            {/* Glass Card */}
            <div className="auth-glass-card">
              {/* Card shine effect */}
              <div className="auth-card-shine" />
              <div className="auth-card-glow" />

              {/* Logo Circle */}
              <div className="auth-logo-circle">
                <div className="auth-logo-ring">
                  <div className="auth-logo-inner">
                    <div className="auth-logo-img">
                      <Image src="/logo.jpeg" alt="Moomen" fill className="object-cover rounded-full" />
                    </div>
                  </div>
                </div>
                <div className="auth-logo-pulse" />
              </div>

              {showBack && (
                <Link href="/login" className="auth-back-link">
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Retour</span>
                </Link>
              )}

              {/* Title */}
              <div className="auth-card-header">
                <h1 className="auth-card-title">{title}</h1>
                <div className="auth-card-divider">
                  <span className="auth-divider-line" />
                  <span className="auth-divider-icon"><ShieldCheck className="w-3 h-3" /></span>
                  <span className="auth-divider-line" />
                </div>
                <div className="auth-card-subtitle">{subtitle}</div>
              </div>

              {/* Form Content */}
              <div className="auth-card-body">
                {children}
              </div>

              {/* Footer */}
              <div className="auth-card-footer">
                <span className="auth-footer-badge">
                  <ShieldCheck className="w-3 h-3" />
                  Sécurisé par <strong>Moomen Pro</strong> · Plateforme certifiée
                </span>
              </div>
            </div>
          </div>
        </div>

        <style jsx global>{`
          /* ═══════════════════════════════════════════════════
             AUTH PAGE — ROOT & BACKGROUND
          ═══════════════════════════════════════════════════ */
          .auth-page-root {
            min-height: 100vh;
            display: flex;
            align-items: stretch;
            position: relative;
            overflow: hidden;
            background: #0A1628;
            font-family: 'Inter', sans-serif;
          }

          .auth-bg-layer {
            position: absolute;
            inset: 0;
            z-index: 0;
            background: radial-gradient(ellipse 80% 60% at 20% 40%, rgba(0, 82, 204, 0.12) 0%, transparent 60%),
                        radial-gradient(ellipse 60% 80% at 80% 80%, rgba(13, 27, 47, 0.5) 0%, transparent 60%),
                        linear-gradient(135deg, #0A1628 0%, #0D1B2F 50%, #060B18 100%);
          }

          .auth-bg-mesh {
            position: absolute;
            inset: 0;
            z-index: 0;
            background-image: 
              linear-gradient(rgba(0, 82, 204, 0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 82, 204, 0.04) 1px, transparent 1px);
            background-size: 48px 48px;
          }

          .auth-canvas {
            position: absolute;
            inset: 0;
            z-index: 1;
            width: 100%;
            height: 100%;
          }

          .auth-grid-pattern {
            position: absolute;
            inset: 0;
            z-index: 0;
            background-image: radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px);
            background-size: 24px 24px;
          }

          /* ── Floating Orbs ── */
          .auth-orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(80px);
            z-index: 0;
            animation: orbFloat 8s ease-in-out infinite;
          }
          .auth-orb-1 {
            width: 500px; height: 500px;
            background: radial-gradient(circle, rgba(0, 82, 204, 0.15) 0%, transparent 70%);
            top: -150px; left: -100px;
            animation-delay: 0s;
          }
          .auth-orb-2 {
            width: 400px; height: 400px;
            background: radial-gradient(circle, rgba(92, 143, 255, 0.1) 0%, transparent 70%);
            bottom: -100px; right: 20%;
            animation-delay: -3s;
          }
          .auth-orb-3 {
            width: 300px; height: 300px;
            background: radial-gradient(circle, rgba(0, 82, 204, 0.08) 0%, transparent 70%);
            top: 40%; right: 10%;
            animation-delay: -6s;
          }

          @keyframes orbFloat {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -30px) scale(1.05); }
            66% { transform: translate(-20px, 20px) scale(0.95); }
          }

          /* ═══════════════════════════════════════════════════
             LEFT PANEL
          ═══════════════════════════════════════════════════ */
          .auth-left-panel {
            display: none;
            flex-direction: column;
            justify-content: space-between;
            width: 42%;
            position: relative;
            z-index: 10;
            padding: 3rem 4rem;
            border-right: 1px solid rgba(0, 82, 204, 0.06);
          }
          @media (min-width: 1024px) {
            .auth-left-panel { display: flex; }
          }

          /* Brand */
          .auth-brand {
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }
          .auth-brand-icon {
            width: 2.75rem; height: 2.75rem;
            border-radius: 14px;
            background: linear-gradient(135deg, #0052CC, #0041A8);
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 8px 24px rgba(0, 82, 204, 0.35), inset 0 1px 0 rgba(255,255,255,0.2);
            transition: transform 0.5s cubic-bezier(0.34,1.56,0.64,1);
          }
          .auth-brand-icon:hover { transform: rotate(10deg) scale(1.08); }
          .auth-brand-icon-sm {
            width: 2.25rem; height: 2.25rem;
            border-radius: 10px;
          }
          .auth-brand-name {
            font-size: 1.5rem;
            font-weight: 900;
            color: #fff;
            letter-spacing: -0.04em;
            text-transform: uppercase;
          }
          .auth-brand-dot { color: #0052CC; }

          /* Left content */
          .auth-left-content {
            display: flex;
            flex-direction: column;
            gap: 2rem;
          }

          /* Badge */
          .auth-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1.25rem;
            border-radius: 100px;
            background: rgba(0, 82, 204, 0.08);
            border: 1px solid rgba(0, 82, 204, 0.2);
            color: rgba(92, 143, 255, 0.9);
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            width: fit-content;
          }
          .auth-badge-dot {
            width: 6px; height: 6px;
            border-radius: 50%;
            background: #0052CC;
            box-shadow: 0 0 8px #0052CC;
            animation: pulse 2s ease-in-out infinite;
          }

          /* Headline */
          .auth-headline-text {
            font-size: clamp(2.5rem, 4vw, 3.75rem);
            font-weight: 900;
            color: #fff;
            line-height: 1.05;
            letter-spacing: -0.04em;
            margin-bottom: 1rem;
          }
          .auth-headline-accent { color: #0052CC; }
          .auth-subheadline {
            color: rgba(255,255,255,0.38);
            font-size: 15px;
            line-height: 1.65;
            max-width: 380px;
            font-weight: 450;
          }

          /* Feature pills */
          .auth-features {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
          }
          .auth-feature-pill {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            padding: 0.4rem 0.875rem;
            border-radius: 100px;
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08);
            color: rgba(255,255,255,0.55);
            font-size: 11px;
            font-weight: 600;
            transition: all 0.2s;
          }
          .auth-feature-pill:hover {
            background: rgba(0, 82, 204, 0.1);
            border-color: rgba(0, 82, 204, 0.25);
            color: #5C8FFF;
          }

          /* Stats */
          .auth-stats {
            display: flex;
            gap: 2.5rem;
            padding-top: 1.5rem;
            border-top: 1px solid rgba(255,255,255,0.06);
          }
          .auth-stat { display: flex; flex-direction: column; gap: 0.25rem; }
          .auth-stat-value {
            font-size: 1.75rem;
            font-weight: 900;
            color: #fff;
            letter-spacing: -0.03em;
            line-height: 1;
          }
          .auth-stat-label {
            font-size: 9px;
            font-weight: 800;
            color: #0052CC;
            text-transform: uppercase;
            letter-spacing: 0.2em;
          }

          /* Footer */
          .auth-left-footer {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            color: rgba(255,255,255,0.18);
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.25em;
          }
          .auth-footer-sep {
            width: 4px; height: 4px;
            border-radius: 50%;
            background: rgba(255,255,255,0.18);
          }

          /* ═══════════════════════════════════════════════════
             RIGHT PANEL
          ═══════════════════════════════════════════════════ */
          .auth-right-panel {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            z-index: 10;
            padding: 1.5rem;
          }

          .auth-form-container {
            width: 100%;
            max-width: 480px;
            animation: slideUpFade 0.7s cubic-bezier(0.34,1.2,0.64,1) both;
          }
          .auth-form-wide { max-width: 860px; }
          @media (min-width: 1024px) {
            .auth-form-container { max-width: 520px; }
            .auth-form-wide { max-width: 860px; }
          }

          @keyframes slideUpFade {
            from { opacity: 0; transform: translateY(32px) scale(0.97); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }

          /* Mobile brand */
          .auth-mobile-brand {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.625rem;
            margin-bottom: 2rem;
          }
          @media (min-width: 1024px) { .auth-mobile-brand { display: none; } }

          /* ── Glass Card ── */
          .auth-glass-card {
            background: rgba(255,255,255,0.035);
            backdrop-filter: blur(60px) saturate(1.5);
            -webkit-backdrop-filter: blur(60px) saturate(1.5);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 28px;
            padding: 2.5rem 2.5rem 2rem;
            position: relative;
            overflow: hidden;
            box-shadow:
              0 0 0 1px rgba(0, 82, 204, 0.05) inset,
              0 40px 80px -10px rgba(0,0,0,0.6),
              0 20px 40px -10px rgba(0,0,0,0.4);
            transition: border-color 0.5s, box-shadow 0.5s;
          }
          .auth-glass-card:hover {
            border-color: rgba(0, 82, 204, 0.15);
            box-shadow:
              0 0 0 1px rgba(0, 82, 204, 0.1) inset,
              0 40px 80px -10px rgba(0,0,0,0.7),
              0 0 60px -10px rgba(0, 82, 204, 0.05);
          }

          .auth-card-shine {
            position: absolute;
            top: -50%; left: -50%;
            width: 200%; height: 200%;
            background: conic-gradient(
              from 180deg at 50% 50%,
              transparent 0deg,
              rgba(0, 82, 204, 0.04) 60deg,
              transparent 120deg
            );
            animation: shimmer 8s linear infinite;
            pointer-events: none;
          }
          @keyframes shimmer {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          .auth-card-glow {
            position: absolute;
            top: 0; left: 50%; transform: translateX(-50%);
            width: 70%; height: 1px;
            background: linear-gradient(90deg, transparent, rgba(0, 82, 204, 0.4), transparent);
            pointer-events: none;
          }

          /* ── Logo Circle ── */
          .auth-logo-circle {
            position: relative;
            width: 72px; height: 72px;
            margin: 0 auto 1.5rem;
          }
          .auth-logo-ring {
            width: 100%; height: 100%;
            border-radius: 50%;
            padding: 2px;
            background: conic-gradient(#0052CC, #0041A8, rgba(0, 82, 204, 0.2), #0052CC);
            animation: spin 4s linear infinite;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .auth-logo-inner {
            width: 100%; height: 100%;
            border-radius: 50%;
            background: #ffffff;
            display: flex; align-items: center; justify-content: center;
            overflow: hidden;
          }
          .auth-logo-img {
            position: relative;
            width: 100%; height: 100%;
          }
          .auth-logo-pulse {
            position: absolute;
            inset: -4px;
            border-radius: 50%;
            border: 1px solid rgba(0, 82, 204, 0.3);
            animation: pulse-ring 2s ease-out infinite;
          }
          @keyframes pulse-ring {
            0% { opacity: 1; transform: scale(1); }
            100% { opacity: 0; transform: scale(1.4); }
          }

          /* ── Back Link ── */
          .auth-back-link {
            display: inline-flex;
            align-items: center;
            gap: 0.375rem;
            color: rgba(255,255,255,0.4);
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            margin-bottom: 1rem;
            transition: color 0.2s, gap 0.2s;
            text-decoration: none;
          }
          .auth-back-link:hover {
            color: #0052CC;
            gap: 0.5rem;
          }

          /* ── Card Header ── */
          .auth-card-header {
            text-align: center;
            margin-bottom: 1.75rem;
            position: relative;
            z-index: 1;
          }
          .auth-card-title {
            font-size: 1.875rem;
            font-weight: 900;
            color: #fff;
            letter-spacing: -0.035em;
            line-height: 1.1;
            margin-bottom: 0.875rem;
            background: linear-gradient(135deg, #fff 30%, rgba(255,255,255,0.7));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .auth-card-divider {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            justify-content: center;
            margin-bottom: 0.75rem;
          }
          .auth-divider-line {
            flex: 1;
            max-width: 60px;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(0, 82, 204, 0.3), transparent);
          }
          .auth-divider-icon {
            color: rgba(0, 82, 204, 0.5);
            display: flex; align-items: center;
          }
          .auth-card-subtitle {
            color: rgba(255,255,255,0.4);
            font-size: 13px;
            font-weight: 500;
            line-height: 1.55;
          }

          /* ── Card Body ── */
          .auth-card-body {
            position: relative;
            z-index: 1;
          }

          /* ── Card Footer ── */
          .auth-card-footer {
            text-align: center;
            margin-top: 1.5rem;
            position: relative;
            z-index: 1;
          }
          .auth-footer-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.375rem;
            color: rgba(255,255,255,0.22);
            font-size: 10px;
            font-weight: 600;
            letter-spacing: 0.02em;
          }
          .auth-footer-badge strong { color: rgba(255,255,255,0.4); font-weight: 800; }
          .auth-footer-badge svg { color: rgba(0, 82, 204, 0.4); }

          /* ═══════════════════════════════════════════════════
             FORM ELEMENTS — SHARED
          ═══════════════════════════════════════════════════ */
          .auth-input {
            display: block;
            width: 100%;
            padding: 0.875rem 1.25rem 0.875rem 3rem;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 14px;
            font-size: 13px;
            color: #fff;
            font-weight: 500;
            letter-spacing: 0.01em;
            transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
            outline: none;
            font-family: inherit;
          }
          .auth-input:focus {
            background: rgba(0, 82, 204, 0.06);
            border-color: rgba(0, 82, 204, 0.5);
            box-shadow:
              0 0 0 3px rgba(0, 82, 204, 0.1),
              0 4px 12px rgba(0,0,0,0.2);
            transform: translateY(-1px);
          }
          .auth-input::placeholder {
            color: rgba(255,255,255,0.2);
            font-weight: 400;
            font-size: 12px;
            letter-spacing: 0.05em;
          }
          .auth-input:focus::placeholder { opacity: 0.5; }

          .auth-label {
            display: block;
            font-size: 11px;
            font-weight: 700;
            color: rgba(255,255,255,0.55);
            margin-bottom: 0.5rem;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          /* Select Style */
          .auth-input option { background: #0D1B2F; color: #fff; }

          /* Primary Button */
          .auth-btn-primary {
            width: 100%;
            height: 3.25rem;
            display: flex;
            align-items: center !important;
            justify-content: center !important;
            gap: 0.625rem;
            background: linear-gradient(135deg, #0052CC, #0041A8);
            color: #ffffff;
            font-weight: 800;
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 0.1em;
            border-radius: 14px;
            border: none;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
            box-shadow:
              0 8px 24px rgba(0, 82, 204, 0.35),
              0 2px 6px rgba(0,0,0,0.2),
              inset 0 1px 0 rgba(255,255,255,0.25);
            font-family: inherit;
          }
          .auth-btn-primary::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
            opacity: 0;
            transition: opacity 0.3s;
          }
          .auth-btn-primary:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow:
              0 14px 32px rgba(0, 82, 204, 0.45),
              0 4px 10px rgba(0,0,0,0.3),
              inset 0 1px 0 rgba(255,255,255,0.3);
          }

          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.1); }
          }
        `}</style>
      </div>
    </ClientOnly>
  );
};
