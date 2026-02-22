'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ClientOnly } from '@/components/ui/client-only';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState({
    login: '',
    password: '',
    rememberMe: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.login || !formData.password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const result = await signIn('credentials', {
        login: formData.login,
        password: formData.password,
        redirect: false,
      });
      if (result?.error) {
        setError('Identifiants incorrects. Veuillez réessayer.');
        setIsLoading(false);
        return;
      }
      if (result?.ok) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError('Une erreur est survenue. Veuillez réessayer.');
      setIsLoading(false);
    }
  };

  return (
    <ClientOnly>
      {/* ── Page ── */}
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0A1628]">

        {/* ── Fond : décoration géométrique brand ── */}
        {/* Cercle haut-droit */}
        <div className="absolute top-0 right-0 w-[520px] h-[520px] rounded-full border border-[#0052CC]/20 translate-x-1/3 -translate-y-1/3" />
        <div className="absolute top-0 right-0 w-[360px] h-[360px] rounded-full border border-[#0052CC]/15 translate-x-1/3 -translate-y-1/3" />
        {/* Blob gauche */}
        <div className="absolute -left-48 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#0052CC]/10 blur-3xl" />
        {/* Blob droit */}
        <div className="absolute -right-32 bottom-10 w-80 h-80 rounded-full bg-[#0052CC]/8 blur-3xl" />
        {/* Grille de points */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* ── Contenu ── */}
        <div className="relative z-10 w-full max-w-[420px] mx-4">

          {/* ── Card ── */}
          <div className="bg-white rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.4)] p-8 sm:p-10">

            {/* Logo */}
            <div className="flex justify-center mb-7">
              {/* Anneau extérieur */}
              <div className="relative w-28 h-28 rounded-full flex items-center justify-center"
                style={{ background: 'conic-gradient(from 0deg, #0052CC22, #0052CC55, #0052CC22)' }}>
                {/* Anneau intérieur / fond */}
                <div className="w-24 h-24 rounded-full bg-white shadow-lg border-2 border-[#0052CC]/20 flex items-center justify-center overflow-hidden">
                  <div className="relative w-16 h-16">
                    <Image src="/logo.jpeg" alt="Moomen Pro" fill className="object-contain" priority />
                  </div>
                </div>
              </div>
            </div>

            {/* Titre */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-slate-900">Bienvenue</h1>
              <p className="text-sm text-slate-400 mt-1">Connectez-vous à votre espace administrateur</p>
            </div>

            {/* Erreur */}
            {error && (
              <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Email */}
              <div>
                <label htmlFor="login" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Adresse e-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="login"
                    name="login"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.login}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder="admin@moomen.pro"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC] focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC] focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Se souvenir + Oublié */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-4 h-4 rounded border-slate-300 text-[#0052CC] focus:ring-[#0052CC]/20 transition-colors"
                  />
                  <span className="text-sm text-slate-600">Se souvenir de moi</span>
                </label>
                <a
                  href="/reset"
                  className="text-sm font-medium text-[#0052CC] hover:text-[#0041A8] transition-colors"
                >
                  Mot de passe oublié ?
                </a>
              </div>

              {/* Bouton */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 bg-[#0052CC] hover:bg-[#0041A8] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    Se connecter
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Séparateur */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white text-xs text-slate-400">Première visite ?</span>
              </div>
            </div>

            {/* Créer un compte */}
            <div className="text-center">
              <p className="text-sm text-slate-500 mb-2">Vous n'avez pas de compte ?</p>
              <a
                href="/new_account"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0052CC] hover:text-[#0041A8] transition-colors"
              >
                Créer un compte entreprise
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-white/40">
            En vous connectant, vous acceptez nos{' '}
            <a href="/terms" className="text-white/60 hover:text-white underline transition-colors">
              Conditions
            </a>
            {' '}et notre{' '}
            <a href="/privacy" className="text-white/60 hover:text-white underline transition-colors">
              Politique de confidentialité
            </a>
          </p>
        </div>
      </div>
    </ClientOnly>
  );
}