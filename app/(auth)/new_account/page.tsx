'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ClientOnly } from '@/components/ui/client-only';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Building2, User, Mail, Phone, Globe, AlertCircle, CheckCircle, X } from 'lucide-react';
import { apiFetch } from '@/lib/axios';
import { signIn } from 'next-auth/react';

interface Pays {
  id: number;
  libelle: string;
  code: string;
  indicatif: string;
  actif: boolean;
}

interface AlertModal {
  show: boolean;
  type: 'success' | 'error' | 'warning';
  title: string;
  message: string;
}

export default function CreateAccountPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pays, setPays] = useState<Pays[]>([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertModal>({
    show: false,
    type: 'success',
    title: '',
    message: ''
  });
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    denominationEntreprise: '',
    emailEntreprise: '',
    numeroEntreprise: '',
    pays: ''
  });

  useEffect(() => {
    const fetchPays = async () => {
      try {
        const data = await apiFetch('/pays/actif', { method: 'GET' });
        setPays(data.data);
      } catch (error) {
        console.error('Erreur lors du chargement des pays:', error);
        showAlert('error', 'Erreur', 'Impossible de charger la liste des pays');
      }
    };
    fetchPays();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showAlert = (type: 'success' | 'error' | 'warning', title: string, message: string) => {
    setAlert({ show: true, type, title, message });
  };

  const closeAlert = () => {
    setAlert({ ...alert, show: false });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      showAlert('error', 'Erreur de validation', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 8) {
      showAlert('error', 'Erreur de validation', 'Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setLoading(true);
    try {
      // 1. Créer le compte
      await apiFetch('/user/create', {
        method: 'POST',
        data: {
          ...formData,
          pays: parseInt(formData.pays)
        }
      });

      // 2. Connexion automatique après création du compte
      const result = await signIn('credentials', {
        login: formData.email,  // ✅ Changé de "email" à "login"
        password: formData.password,
        redirect: false,
      });

      console.log('Résultat signIn:', result);

      // 3. Gérer le résultat de la connexion
      if (result?.error) {
        console.error('Erreur de connexion:', result.error);
        showAlert('warning', 'Compte créé', 'Votre compte a été créé avec succès. Veuillez vous connecter manuellement.');
        setTimeout(() => router.push('/login'), 2000);
        return;
      }

      if (result?.ok) {
        showAlert('success', 'Succès', 'Compte créé et connexion réussie ! Redirection...');
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh();
        }, 1500);
      } else {
        // Cas où result.ok est false mais pas d'erreur explicite
        showAlert('warning', 'Compte créé', 'Votre compte a été créé. Redirection vers la page de connexion...');
        setTimeout(() => router.push('/login'), 2000);
      }

    } catch (error: any) {
      console.error('Erreur:', error);
      showAlert('error', 'Erreur de création', error.message || 'Une erreur est survenue lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClientOnly>
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-6 px-4 sm:px-6 lg:px-8">
        {/* Fond dégradé unique turquoise/or */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0052cc] via-[#2d7acc] to-[#8B5CF6]"></div>

        {/* Overlay pour adoucir */}
        <div className="absolute inset-0 bg-white/5"></div>

        {/* Formes géométriques décoratives */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0052cc]/20 rounded-full transform translate-x-40 -translate-y-40 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#8B5CF6]/20 rounded-full transform -translate-x-40 translate-y-40 blur-3xl"></div>

        {/* Motifs de points blancs subtils */}
        <div className="absolute top-20 left-40 w-64 h-64 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle, white 2px, transparent 2px)',
          backgroundSize: '25px 25px'
        }}></div>

        {/* Formes animées douces */}
        <div className="absolute top-10 right-10 w-96 h-96 bg-white/10 rounded-full filter blur-[120px] animate-blob-slow"></div>
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-[#8B5CF6]/15 rounded-full filter blur-[100px] animate-blob-slow animation-delay-4000"></div>

        {/* Modal d'alerte */}
        {alert.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={closeAlert}
            ></div>

            {/* Modal */}
            <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 p-6 max-w-md w-full animate-slideUp">
              {/* Icône et titre */}
              <div className="flex items-start gap-4 mb-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${alert.type === 'success' ? 'bg-green-100' :
                    alert.type === 'error' ? 'bg-red-100' :
                      'bg-yellow-100'
                  }`}>
                  {alert.type === 'success' ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <AlertCircle className={`w-6 h-6 ${alert.type === 'error' ? 'text-red-600' : 'text-yellow-600'
                      }`} />
                  )}
                </div>

                <div className="flex-1">
                  <h3 className={`text-lg font-semibold mb-1 ${alert.type === 'success' ? 'text-green-800' :
                      alert.type === 'error' ? 'text-red-800' :
                        'text-yellow-800'
                    }`}>
                    {alert.title}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {alert.message}
                  </p>
                </div>

                {/* Bouton fermer */}
                <button
                  onClick={closeAlert}
                  className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Bouton OK */}
              <div className="flex justify-end">
                <button
                  onClick={closeAlert}
                  className={`px-6 py-2 rounded-lg font-medium text-white transition-all duration-300 ${alert.type === 'success'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                      : alert.type === 'error'
                        ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                        : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700'
                    } shadow-lg hover:shadow-xl transform hover:scale-105`}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-3xl w-full relative z-10">
          {/* Carte avec effet glassmorphism */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 p-6 sm:p-7 hover:shadow-[0_20px_60px_rgba(83,176,183,0.3)] transition-all duration-500">

            {/* Logo Section */}
            <div className="flex justify-center mb-3">
              <div className="relative w-20 h-20 bg-gradient-to-br from-white/80 to-white/60 rounded-full flex items-center justify-center border-3 border-[#0052cc]/30 shadow-lg hover:shadow-xl hover:border-[#8B5CF6]/50 hover:scale-105 transition-all duration-300">
                <div className="relative w-14 h-14">
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

            {/* Title Section */}
            <div className="text-center mb-5">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[#0052cc] to-[#8B5CF6] bg-clip-text text-transparent mb-1">
                Créer votre compte
              </h2>
              <p className="text-xs text-slate-600 font-light">
                Inscrivez votre entreprise et commencez dès maintenant
              </p>
            </div>

            {/* Form Section */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Section Informations Entreprise */}
              <div className="bg-gradient-to-br from-[#0052cc]/5 to-[#8B5CF6]/5 rounded-xl p-4 border border-[#0052cc]/20">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-4 w-4 text-[#0052cc]" />
                  <h3 className="text-sm font-semibold text-slate-800">Informations de l&apos;entreprise</h3>
                </div>

                <div className="space-y-3">
                  {/* Nom de l'entreprise */}
                  <div>
                    <label htmlFor="denominationEntreprise" className="block text-xs font-medium text-slate-700 mb-1">
                      Nom de l&apos;entreprise <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="denominationEntreprise"
                      name="denominationEntreprise"
                      type="text"
                      required
                      value={formData.denominationEntreprise}
                      onChange={handleChange}
                      className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-[#0052cc]/30 bg-white/70 backdrop-blur-sm placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052cc]/50 focus:border-[#0052cc] focus:bg-white text-sm transition-all duration-300 shadow-sm hover:shadow-md hover:border-[#0052cc]/50"
                      placeholder="Ex: Fashion Boutique CI"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Email entreprise */}
                    <div>
                      <label htmlFor="emailEntreprise" className="block text-xs font-medium text-slate-700 mb-1">
                        Email entreprise <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                          <Mail className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                          id="emailEntreprise"
                          name="emailEntreprise"
                          type="email"
                          required
                          value={formData.emailEntreprise}
                          onChange={handleChange}
                          className="appearance-none rounded-lg relative block w-full pl-9 pr-3 py-2 border border-[#0052cc]/30 bg-white/70 backdrop-blur-sm placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052cc]/50 focus:border-[#0052cc] focus:bg-white text-sm transition-all duration-300 shadow-sm hover:shadow-md hover:border-[#0052cc]/50"
                          placeholder="contact@entreprise.com"
                        />
                      </div>
                    </div>

                    {/* Téléphone entreprise */}
                    <div>
                      <label htmlFor="numeroEntreprise" className="block text-xs font-medium text-slate-700 mb-1">
                        Téléphone <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                          <Phone className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                          id="numeroEntreprise"
                          name="numeroEntreprise"
                          type="tel"
                          required
                          value={formData.numeroEntreprise}
                          onChange={handleChange}
                          className="appearance-none rounded-lg relative block w-full pl-9 pr-3 py-2 border border-[#0052cc]/30 bg-white/70 backdrop-blur-sm placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052cc]/50 focus:border-[#0052cc] focus:bg-white text-sm transition-all duration-300 shadow-sm hover:shadow-md hover:border-[#0052cc]/50"
                          placeholder="+225 XX XX XX XX XX"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pays */}
                  <div>
                    <label htmlFor="pays" className="block text-xs font-medium text-slate-700 mb-1">
                      Pays <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                        <Globe className="h-4 w-4 text-slate-400" />
                      </div>
                      <select
                        id="pays"
                        name="pays"
                        required
                        value={formData.pays}
                        onChange={handleChange}
                        className="appearance-none rounded-lg relative block w-full pl-9 pr-8 py-2 border border-[#0052cc]/30 bg-white/70 backdrop-blur-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052cc]/50 focus:border-[#0052cc] focus:bg-white text-sm transition-all duration-300 shadow-sm hover:shadow-md hover:border-[#0052cc]/50"
                      >
                        <option value="">Sélectionnez un pays</option>
                        {pays.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.libelle} ({p.indicatif})
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section Informations Administrateur */}
              <div className="bg-gradient-to-br from-[#8B5CF6]/5 to-[#0052cc]/5 rounded-xl p-4 border border-[#8B5CF6]/20">
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-4 w-4 text-[#8B5CF6]" />
                  <h3 className="text-sm font-semibold text-slate-800">Informations de l&apos;administrateur</h3>
                </div>

                <div className="space-y-3">
                  {/* Email admin */}
                  <div>
                    <label htmlFor="email" className="block text-xs font-medium text-slate-700 mb-1">
                      Email de connexion <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="appearance-none rounded-lg relative block w-full pl-9 pr-3 py-2 border border-[#0052cc]/30 bg-white/70 backdrop-blur-sm placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052cc]/50 focus:border-[#0052cc] focus:bg-white text-sm transition-all duration-300 shadow-sm hover:shadow-md hover:border-[#0052cc]/50"
                        placeholder="admin@entreprise.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Mot de passe */}
                    <div>
                      <label htmlFor="password" className="block text-xs font-medium text-slate-700 mb-1">
                        Mot de passe <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          required
                          minLength={8}
                          value={formData.password}
                          onChange={handleChange}
                          className="appearance-none rounded-lg relative block w-full px-3 py-2 pr-9 border border-[#0052cc]/30 bg-white/70 backdrop-blur-sm placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052cc]/50 focus:border-[#0052cc] focus:bg-white text-sm transition-all duration-300 shadow-sm hover:shadow-md hover:border-[#0052cc]/50"
                          placeholder="Min. 8 caractères"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-[#0052cc] transition-colors duration-300"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirmation mot de passe */}
                    <div>
                      <label htmlFor="confirmPassword" className="block text-xs font-medium text-slate-700 mb-1">
                        Confirmer <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          required
                          minLength={8}
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="appearance-none rounded-lg relative block w-full px-3 py-2 pr-9 border border-[#0052cc]/30 bg-white/70 backdrop-blur-sm placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052cc]/50 focus:border-[#0052cc] focus:bg-white text-sm transition-all duration-300 shadow-sm hover:shadow-md hover:border-[#0052cc]/50"
                          placeholder="Confirmez"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-[#0052cc] transition-colors duration-300"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Indication mot de passe */}
                  <p className="text-xs text-slate-500 flex items-start gap-1">
                    <svg className="h-3.5 w-3.5 text-[#0052cc] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Le mot de passe doit contenir au moins 8 caractères
                  </p>
                </div>
              </div>

              {/* Bouton de soumission */}
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center items-center gap-2 py-2.5 px-6 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-[#0052cc] via-[#2d7acc] to-[#8B5CF6] hover:from-[#8B5CF6] hover:via-[#2d7acc] hover:to-[#0052cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0052cc] shadow-lg hover:shadow-xl hover:shadow-[#0052cc]/50 transition-all duration-500 transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative z-10">{loading ? 'Création en cours...' : 'Créer mon compte'}</span>
                <svg
                  className="w-4 h-4 relative z-10 transform group-hover:translate-x-1 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>

                {/* Effet de brillance au survol */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
              </button>

              {/* Lien retour login */}
              <div className="text-center pt-3 border-t border-slate-200">
                <p className="text-xs text-slate-600 mb-1.5">Vous avez déjà un compte ?</p>
                <a
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0052cc] hover:text-[#8B5CF6] transition-colors duration-300 group px-3 py-1.5 rounded-lg hover:bg-[#0052cc]/10"
                >
                  <svg
                    className="w-3.5 h-3.5 transform group-hover:-translate-x-1 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                  </svg>
                  Se connecter
                </a>
              </div>
            </form>
          </div>

          {/* Footer text */}
          <p className="mt-4 text-center text-xs text-white/90 drop-shadow-md">
            En créant un compte, vous acceptez nos{' '}
            <a href="/terms" className="text-white font-semibold hover:text-[#8B5CF6] transition-colors duration-300 underline">
              Conditions
            </a>
            {' '}et{' '}
            <a href="/privacy" className="text-white font-semibold hover:text-[#8B5CF6] transition-colors duration-300 underline">
              Politique de confidentialité
            </a>
          </p>
        </div>
      </div>

      {/* Styles CSS pour les animations */}
      <style jsx>{`
        @keyframes blob-slow {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          25% {
            transform: translate(30px, -40px) scale(1.05);
          }
          50% {
            transform: translate(-25px, 30px) scale(0.95);
          }
          75% {
            transform: translate(35px, 20px) scale(1.02);
          }
        }
        .animate-blob-slow {
          animation: blob-slow 15s ease-in-out infinite;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </ClientOnly>
  );
}