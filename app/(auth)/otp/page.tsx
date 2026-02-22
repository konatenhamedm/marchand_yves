'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { ClientOnly } from '@/components/ui/client-only';
import { BASE_URL } from '@/lib/axios';
import { Clock, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function ResetPasswordOTPPage() {
  const inputsRef = useRef<HTMLInputElement[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get('email') || '';
  const mode = searchParams.get('mode') || 'reset'; // 'reset' ou 'mfa'

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success'>('error');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes pour le reset
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState<'otp' | 'newPassword'>('otp'); // Étape actuelle
  const [token, setToken] = useState(''); // Token OTP
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  // Récupérer le timer sauvegardé
  useEffect(() => {
    const expiry = localStorage.getItem('reset_password_expiry');
    if (expiry) {
      const diff = Math.floor((+expiry - Date.now()) / 1000);
      if (diff > 0) {
        setTimeLeft(diff);
      } else {
        const newExpiry = Date.now() + 600 * 1000; // 10 minutes
        localStorage.setItem('reset_password_expiry', newExpiry.toString());
        setTimeLeft(600);
      }
    } else {
      const newExpiry = Date.now() + 600 * 1000;
      localStorage.setItem('reset_password_expiry', newExpiry.toString());
      setTimeLeft(600);
    }
  }, []);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          localStorage.removeItem('reset_password_expiry');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // Gestion OTP
  const handleOtpChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value.replace(/\D/g, '');
    e.target.value = value;
    if (value && index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === 'Backspace' && !e.currentTarget.value && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData
      .getData('Text')
      .replace(/\D/g, '')
      .slice(0, 6);
    pasteData.split('').forEach((char, i) => {
      if (inputsRef.current[i]) inputsRef.current[i].value = char;
    });
    if (inputsRef.current[pasteData.length - 1]) {
      inputsRef.current[pasteData.length - 1].focus();
    }
  };

  // Vérifier si le token est expiré
  const verifyTokenExpired = async (token: string) => {
    try {
      const response = await fetch(`${BASE_URL}/reset-password/verify-token-expired`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          token: token
        }),
      });

      const data = await response.json();
      return { expired: !response.ok || data.expired === true, data };
    } catch (error) {
      console.error('Erreur vérification token:', error);
      return { expired: true, data: null };
    }
  };

  // Soumission OTP
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (timeLeft <= 0) {
      setMessage('Le code a expiré. Veuillez en demander un nouveau.');
      setMessageType('error');
      return;
    }

    const otpCode = inputsRef.current.map(i => i.value).join('');
    if (otpCode.length !== 6) {
      setMessage('Veuillez entrer les 6 chiffres.');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // Vérifier si le token n'est pas expiré
      const { expired, data } = await verifyTokenExpired(otpCode);

      if (expired) {
        setMessage('Le code a expiré. Veuillez en demander un nouveau.');
        setMessageType('error');
        return;
      }

      // Token valide, passer à l'étape suivante
      setToken(otpCode);
      setStep('newPassword');
      setMessage('Code vérifié avec succès. Définissez votre nouveau mot de passe.');
      setMessageType('success');

    } catch (error: any) {
      setMessage(error.message || 'Erreur de vérification.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Soumission nouveau mot de passe
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.newPassword || !formData.confirmPassword) {
      setMessage('Veuillez remplir tous les champs.');
      setMessageType('error');
      return;
    }

    if (formData.newPassword.length < 8) {
      setMessage('Le mot de passe doit contenir au moins 8 caractères.');
      setMessageType('error');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage('Les mots de passe ne correspondent pas.');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // Vérifier à nouveau le token avant de reset
      const { expired } = await verifyTokenExpired(token);

      if (expired) {
        setMessage('Le code a expiré. Veuillez recommencer la procédure.');
        setMessageType('error');
        setStep('otp');
        return;
      }

      // Reset du mot de passe
      const response = await fetch(`${BASE_URL}/reset-password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          token: token,
          newPassword: formData.newPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la réinitialisation');
      }

      // Succès
      setMessage('Mot de passe réinitialisé avec succès ! Redirection vers la connexion...');
      setMessageType('success');

      // Nettoyage
      localStorage.removeItem('reset_password_expiry');

      // Redirection après 3 secondes
      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } catch (error: any) {
      setMessage(error.message || 'Erreur lors de la réinitialisation.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Renvoyer le code
  const handleResend = async () => {
    try {
      setIsLoading(true);
      setMessage('');

      const response = await fetch(`${BASE_URL}/reset-password/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors du renvoi');
      }

      // Reset timer
      const newExpiry = Date.now() + 600 * 1000;
      localStorage.setItem('reset_password_expiry', newExpiry.toString());
      setTimeLeft(600);

      // Reset OTP inputs
      inputsRef.current.forEach(input => {
        if (input) input.value = '';
      });
      inputsRef.current[0]?.focus();

      setMessage('✅ Nouveau code envoyé !');
      setMessageType('success');

    } catch (error: any) {
      setMessage(error.message || 'Erreur lors du renvoi.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (message) setMessage('');
  };

  return (
    <ClientOnly>
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden p-4">
        {/* Fond dégradé */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0052cc] via-[#1a66b3] to-[#8B5CF6]"></div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-white/5"></div>

        {/* Formes décoratives */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0052cc]/20 rounded-full transform translate-x-40 -translate-y-40 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#8B5CF6]/20 rounded-full transform -translate-x-40 translate-y-40 blur-3xl"></div>

        <div className="w-full max-w-md relative z-10 my-auto">
          {/* Carte principale */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-6 sm:p-8 md:p-10 hover:shadow-[0_20px_60px_rgba(83,176,183,0.3)] transition-all duration-500">

            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-gradient-to-br from-white/80 to-white/60 rounded-full flex items-center justify-center border-4 border-[#0052cc]/30 shadow-lg hover:shadow-xl hover:border-[#8B5CF6]/50 hover:scale-105 transition-all duration-300">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24">
                  <Image
                    src="/logo.jpeg"
                    alt="Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Titre */}
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#0052cc] to-[#8B5CF6] bg-clip-text text-transparent mb-2">
                {step === 'otp' ? 'Code de vérification' : 'Nouveau mot de passe'}
              </h2>
              <p className="text-sm text-slate-600 font-light">
                {step === 'otp'
                  ? `Entrez le code envoyé à ${email || 'votre email'}`
                  : 'Définissez votre nouveau mot de passe'}
              </p>

              {/* Timer pour OTP */}
              {step === 'otp' && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0052cc]/10 to-[#8B5CF6]/10 border border-[#0052cc]/30 rounded-full mt-3">
                  <Clock className="h-4 w-4 text-[#0052cc]" />
                  <span className={`text-sm font-semibold ${timeLeft <= 60 ? 'text-red-600' : 'text-[#0052cc]'
                    }`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              )}
            </div>

            {/* Messages */}
            {message && (
              <div className={`mb-4 p-3 rounded-xl border ${messageType === 'success'
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-red-50 border-red-200 text-red-700'
                } animate-fadeIn`}>
                <p className="text-sm text-center">{message}</p>
              </div>
            )}

            {/* Étape OTP */}
            {step === 'otp' && (
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                {/* Inputs OTP */}
                <div className="flex flex-col items-center">
                  <div className="flex justify-center gap-2 mb-6">
                    {[...Array(6)].map((_, i) => (
                      <input
                        key={i}
                        type="text"
                        maxLength={1}
                        inputMode="numeric"
                        className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl font-semibold border-2 border-[#0052cc]/30 rounded-xl bg-white/70 text-slate-900 focus:border-[#0052cc] focus:ring-2 focus:ring-[#0052cc]/50 focus:outline-none focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md hover:border-[#0052cc]/50"
                        ref={(el) => {
                          if (el) inputsRef.current[i] = el;
                        }}
                        onChange={(e) => handleOtpChange(e, i)}
                        onKeyDown={(e) => handleOtpKeyDown(e, i)}
                        onPaste={handleOtpPaste}
                        disabled={isLoading || timeLeft <= 0}
                      />
                    ))}
                  </div>

                  {/* Renvoyer */}
                  <div className="text-center space-y-2">
                    <p className="text-sm text-slate-600">
                      Vous n'avez pas reçu le code ?
                    </p>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={isLoading || timeLeft > 540} // Ne peut renvoyer qu'après 1 minute
                      className="inline-flex items-center gap-2 text-sm font-semibold text-[#0052cc] hover:text-[#8B5CF6] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg hover:bg-[#0052cc]/10"
                    >
                      <Mail className="h-4 w-4" />
                      Renvoyer le code
                    </button>
                  </div>
                </div>

                {/* Bouton soumission */}
                <button
                  type="submit"
                  disabled={isLoading || timeLeft <= 0}
                  className="group relative w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-[#0052cc] via-[#1a66b3] to-[#8B5CF6] hover:from-[#8B5CF6] hover:via-[#1a66b3] hover:to-[#0052cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0052cc] shadow-lg hover:shadow-xl hover:shadow-[#0052cc]/50 transition-all duration-500 transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <span className="relative z-10">
                    {isLoading ? 'Vérification...' : 'Vérifier le code'}
                  </span>
                  <svg
                    className="w-5 h-5 relative z-10 transform group-hover:translate-x-1 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                </button>
              </form>
            )}

            {/* Étape nouveau mot de passe */}
            {step === 'newPassword' && (
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                {/* Nouveau mot de passe */}
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-2">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-[#1a66b3]" />
                    </div>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.newPassword}
                      onChange={handleFormChange}
                      disabled={isLoading}
                      className="appearance-none rounded-xl relative block w-full px-12 py-3 pr-12 border border-[#0052cc]/30 bg-white/70 backdrop-blur-sm placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052cc]/50 focus:border-[#0052cc] focus:bg-white focus:z-10 text-sm transition-all duration-300 shadow-sm hover:shadow-md hover:border-[#0052cc]/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Minimum 8 caractères"
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-[#0052cc] transition-colors duration-300"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirmation mot de passe */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-[#1a66b3]" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleFormChange}
                      disabled={isLoading}
                      className="appearance-none rounded-xl relative block w-full px-12 py-3 pr-12 border border-[#0052cc]/30 bg-white/70 backdrop-blur-sm placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052cc]/50 focus:border-[#0052cc] focus:bg-white focus:z-10 text-sm transition-all duration-300 shadow-sm hover:shadow-md hover:border-[#0052cc]/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Retapez le mot de passe"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-[#0052cc] transition-colors duration-300"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Indications */}
                <div className="text-xs text-slate-500 space-y-1">
                  <p>• Le mot de passe doit contenir au moins 8 caractères</p>
                  <p>• Assurez-vous que les deux mots de passe correspondent</p>
                </div>

                {/* Boutons */}
                <div className="flex flex-col gap-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-[#0052cc] via-[#1a66b3] to-[#8B5CF6] hover:from-[#8B5CF6] hover:via-[#1a66b3] hover:to-[#0052cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0052cc] shadow-lg hover:shadow-xl hover:shadow-[#0052cc]/50 transition-all duration-500 transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <span className="relative z-10">
                      {isLoading ? 'Traitement...' : 'Réinitialiser le mot de passe'}
                    </span>
                    <svg
                      className="w-5 h-5 relative z-10 transform group-hover:translate-x-1 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep('otp')}
                    disabled={isLoading}
                    className="group relative w-full flex justify-center items-center gap-2 py-3 px-4 border border-[#0052cc]/30 text-sm font-semibold rounded-xl text-[#0052cc] bg-white/70 hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0052cc] shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-300" />
                    <span className="relative z-10">Retour au code</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-white/90 drop-shadow-md">
            Vous rencontrez des problèmes ?{' '}
            <a href="mailto:support@batiflow.com" className="text-white font-semibold hover:text-[#8B5CF6] transition-colors duration-300 underline">
              Contactez le support
            </a>
          </p>
        </div>
      </div>

      {/* Styles CSS */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </ClientOnly>
  );
}