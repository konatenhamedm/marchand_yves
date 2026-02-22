'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ClientOnly } from '@/components/ui/client-only';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Mail, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { BASE_URL } from '@/lib/axios';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [email, setEmail] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) { setError('Veuillez entrer votre adresse e-mail'); return; }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { setError('Veuillez entrer une adresse e-mail valide'); return; }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${BASE_URL}/reset-password/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) throw new Error('Aucun compte trouvé avec cette adresse e-mail');
        if (response.status === 429) throw new Error('Trop de tentatives. Veuillez réessayer dans quelques minutes');
        throw new Error(data.message || 'Une erreur est survenue lors de la demande');
      }

      setSuccess('Un code de vérification a été envoyé à votre adresse e-mail');
      setCodeSent(true);
      sessionStorage.setItem('reset_email', email);

      setTimeout(() => {
        router.push(`/otp?email=${encodeURIComponent(email)}&mode=reset`);
      }, 2500);

    } catch (err: any) {
      console.error('Erreur de réinitialisation:', err);
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Veuillez d'abord entrer une adresse e-mail valide");
      return;
    }
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${BASE_URL}/reset-password/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erreur lors du renvoi du code');
      setSuccess('Nouveau code envoyé avec succès !');
    } catch (err: any) {
      setError(err.message || 'Erreur lors du renvoi du code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ClientOnly>
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0A1628]">

        {/* ── Décoration géométrique ── */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full border border-[#0052CC]/20 translate-x-1/3 -translate-y-1/3" />
        <div className="absolute top-0 right-0 w-[340px] h-[340px] rounded-full border border-[#0052CC]/12 translate-x-1/3 -translate-y-1/3" />
        <div className="absolute -left-48 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#0052CC]/10 blur-3xl" />
        <div className="absolute -right-32 bottom-10 w-80 h-80 rounded-full bg-[#0052CC]/8 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* ── Carte ── */}
        <div className="relative z-10 w-full max-w-[420px] mx-4 my-8">
          <div className="bg-white rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.4)] p-8 sm:p-10">

            {/* Logo */}
            <div className="flex justify-center mb-7">
              <div className="relative w-28 h-28 rounded-full flex items-center justify-center"
                style={{ background: 'conic-gradient(from 0deg, #0052CC22, #0052CC55, #0052CC22)' }}>
                <div className="w-24 h-24 rounded-full bg-white shadow-lg border-2 border-[#0052CC]/20 flex items-center justify-center overflow-hidden">
                  <div className="relative w-16 h-16">
                    <Image src="/logo.jpeg" alt="Moomen Pro" fill className="object-contain" priority />
                  </div>
                </div>
              </div>
            </div>

            {/* Icône + Titre */}
            <div className="text-center mb-7">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#EBF2FF] border border-[#0052CC]/20 mb-4">
                <ShieldCheck className="w-5 h-5 text-[#0052CC]" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Mot de passe oublié</h1>
              <p className="text-sm text-slate-400 mt-1">
                Entrez votre e-mail pour recevoir un code de vérification
              </p>
            </div>

            {/* Erreur */}
            {error && (
              <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Succès */}
            {success && (
              <div className="mb-5 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <p className="text-sm text-green-700 font-medium">{success}</p>
                </div>
                {codeSent && !success.includes('Nouveau') && (
                  <p className="text-xs text-green-500 mt-1 ml-6">Redirection automatique dans 2 secondes…</p>
                )}
              </div>
            )}

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Adresse e-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value.trim());
                      if (error) setError('');
                      if (success) setSuccess('');
                    }}
                    disabled={isLoading}
                    placeholder="exemple@entreprise.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC] focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-400">
                  Un code à 6 chiffres valable 10 minutes vous sera envoyé
                </p>
              </div>

              <div className="space-y-3 pt-1">
                {/* Bouton principal */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#0052CC] hover:bg-[#0041A8] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      Envoyer le code de vérification
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </>
                  )}
                </button>

                {/* Renvoyer le code */}
                {codeSent && (
                  <button
                    type="button"
                    onClick={handleResendEmail}
                    disabled={isLoading}
                    className="w-full py-2 text-sm font-medium text-[#0052CC] hover:text-[#0041A8] transition-colors disabled:opacity-50 text-center"
                  >
                    Renvoyer le code
                  </button>
                )}

                {/* Retour Login */}
                <a
                  href="/login"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour à la connexion
                </a>
              </div>
            </form>

            {/* Sécurité */}
            <div className="mt-7 pt-5 border-t border-slate-100">
              <div className="flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0052CC]" />
                <p className="text-xs text-slate-400">
                  Votre adresse e-mail ne sera jamais partagée
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-white/40">
            Vous ne recevez pas l'e-mail ? Vérifiez vos spams ou{' '}
            <a href="mailto:support@moomen.pro" className="text-white/60 hover:text-white underline transition-colors">
              contactez notre support
            </a>
          </p>
        </div>
      </div>
    </ClientOnly>
  );
}