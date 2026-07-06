'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Eye, EyeOff, Building2, User, Loader2, Globe, Phone,
  Mail, Lock, CheckCircle2, Sparkles, ShieldCheck, Gift
} from 'lucide-react';
import { apiFetch } from '@/lib/axios';
import { signIn } from 'next-auth/react';
import { AuthWrapper } from '@/components/auth/AuthWrapper';
import Link from 'next/link';
import { toast } from 'sonner';

interface Pays {
  id: number;
  libelle: string;
  indicatif: string;
}

export default function CreateAccountPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [pays, setPays] = useState<Pays[]>([]);
  const [loading, setLoading] = useState(false);
  const [step] = useState<1 | 2>(1); // Step logic can be expanded if needed
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    denominationEntreprise: '',
    emailEntreprise: '',
    numeroEntreprise: '',
    pays: '',
    codeParrain: '',
  });

  useEffect(() => {
    apiFetch('/pays/actif').then(data => setPays(data.data)).catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (formData.password.length < 8) {
      toast.error('Mot de passe trop court (min. 8 caractères)');
      return;
    }

    setLoading(true);
    try {
      await apiFetch('/user/create', {
        method: 'POST',
        data: { ...formData, pays: parseInt(formData.pays) },
      });

      toast.success('Compte entreprise créé avec succès !');
      const result = await signIn('credentials', {
        login: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.ok) {
        toast.info('Initialisation du dashboard...');
        router.push('/dashboard');
        router.refresh();
      } else {
        router.push('/login');
      }
    } catch (err: any) {
      toast.error(err.message || 'Échec lors de la création');
      setLoading(false);
    }
  };

  return (
    <AuthWrapper
      title="Créer un Compte"
      subtitle={
        <span className="na-subtitle">
          Déjà inscrit ?{' '}
          <Link href="/login" className="na-login-link">
            Se connecter →
          </Link>
        </span>
      }
      imageTitle="Inscription. Croissance. Efficacité."
      imageSubtitle="Inscrivez votre entreprise en quelques clics et accédez à une gestion simplifiée et automatisée."
      showBack={true}
      wide={true}
    >
      <div className="na-wrapper">
        {/* Step Indicator */}
        <div className="na-steps">
          <div className={`na-step ${step >= 1 ? 'na-step-active' : ''}`}>
            <div className="na-step-circle">
              {step > 1 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
            </div>
            <span className="na-step-label">Entreprise</span>
          </div>
          <div className={`na-step-line ${step >= 2 ? 'na-step-line-active' : ''}`} />
          <div className={`na-step ${step >= 2 ? 'na-step-active' : ''}`}>
            <div className="na-step-circle">
              <User className="w-3.5 h-3.5" />
            </div>
            <span className="na-step-label">Administrateur</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="na-form">

          {/* ── Section 1: Entreprise ── */}
          <div className="na-section">
            <div className="na-section-header">
              <Building2 className="w-4 h-4" />
              <span>Informations Entreprise</span>
            </div>

            <div className="na-fields">
              {/* Denomination */}
              <div className="na-field">
                <label className="auth-label">Dénomination Sociale</label>
                <div className="na-input-wrap">
                  <Building2 className="na-icon" />
                  <input
                    name="denominationEntreprise"
                    required
                    value={formData.denominationEntreprise}
                    onChange={handleChange}
                    className="auth-input"
                    placeholder="Nom de votre entreprise"
                  />
                </div>
              </div>

              <div className="na-grid-2">
                {/* Phone */}
                <div className="na-field">
                  <label className="auth-label">Téléphone</label>
                  <div className="na-input-wrap">
                    <Phone className="na-icon" />
                    <input
                      name="numeroEntreprise"
                      required
                      value={formData.numeroEntreprise}
                      onChange={handleChange}
                      className="auth-input"
                      placeholder="Numéro de contact"
                    />
                  </div>
                </div>

                {/* Country */}
                <div className="na-field">
                  <label className="auth-label">Pays</label>
                  <div className="na-input-wrap">
                    <Globe className="na-icon" />
                    <select
                      name="pays"
                      required
                      value={formData.pays}
                      onChange={handleChange}
                      className="auth-input na-select"
                    >
                      <option value="" disabled>Sélectionnez</option>
                      {pays.map((p) => (
                        <option key={p.id} value={p.id} className="text-black">
                          {p.libelle}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Code Parrain */}
              <div className="na-field">
                <label className="auth-label">Code Parrain / Marchand (Optionnel)</label>
                <div className="na-input-wrap">
                  <Gift className="na-icon" />
                  <input
                    name="codeParrain"
                    value={formData.codeParrain}
                    onChange={handleChange}
                    className="auth-input"
                    placeholder="Ex: MOO-XXXXXXXX"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="na-divider">
            <span className="na-divider-line" />
            <span className="na-divider-text">
              <User className="w-3 h-3" />
              Accès Administrateur
            </span>
            <span className="na-divider-line" />
          </div>

          {/* ── Section 2: Admin ── */}
          <div className="na-section">
            <div className="na-fields">
              {/* Email */}
              <div className="na-field">
                <label className="auth-label">Identifiant Principal (Email)</label>
                <div className="na-input-wrap">
                  <Mail className="na-icon" />
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="auth-input"
                    placeholder="Email de connexion"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="na-grid-2">
                {/* Password */}
                <div className="na-field">
                  <label className="auth-label">Mot de Passe</label>
                  <div className="na-input-wrap">
                    <Lock className="na-icon" />
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="auth-input na-pr"
                      placeholder="Min. 8 caractères"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="na-eye-btn"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="na-field">
                  <label className="auth-label">Confirmer</label>
                  <div className="na-input-wrap">
                    <ShieldCheck className="na-icon" />
                    <input
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="auth-input"
                      placeholder="Confirmer"
                      autoComplete="new-password"
                    />
                    {formData.confirmPassword && (
                      <span className={`na-match ${
                        formData.password === formData.confirmPassword ? 'na-match-ok' : 'na-match-no'
                      }`} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="na-submit-section">
            <button
              type="submit"
              disabled={loading}
              className="auth-btn-primary"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Sparkles size={15} />
                  Créer mon Compte Moomen Pro
                </>
              )}
            </button>

            <p className="na-terms">
              En créant votre compte, vous acceptez nos{' '}
              <a href="https://moomen.pro/conditionsUtilisation" target='_blank' className="na-terms-link">Conditions Générales</a>
              {' '}et notre{' '}
              <a href="https://moomen.pro/politiqueConfidentialite" target='_blank' className="na-terms-link">Politique de Confidentialité</a>.
            </p>
          </div>
        </form>
      </div>

      <style jsx global>{`
        .na-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .na-subtitle {
          font-size: 13px;
          color: rgba(255,255,255,0.4);
        }
        .na-login-link {
          color: #0052CC;
          font-weight: 700;
          text-decoration: none;
          transition: color 0.2s;
        }
        .na-login-link:hover { color: #5C8FFF; }

        /* Steps */
        .na-steps {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0;
          padding: 0.5rem 0 0.25rem;
        }
        .na-step {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          opacity: 0.35;
          transition: opacity 0.3s;
        }
        .na-step-active { opacity: 1; }
        .na-step-circle {
          width: 28px; height: 28px;
          border-radius: 50%;
          background: rgba(0, 82, 204, 0.12);
          border: 1.5px solid rgba(0, 82, 204, 0.3);
          display: flex; align-items: center; justify-content: center;
          color: #0052CC;
          transition: all 0.3s;
        }
        .na-step-active .na-step-circle {
          background: rgba(0, 82, 204, 0.2);
          border-color: #0052CC;
          box-shadow: 0 0 12px rgba(0, 82, 204, 0.25);
        }
        .na-step-label {
          font-size: 11px;
          font-weight: 700;
          color: rgba(255,255,255,0.5);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .na-step-active .na-step-label { color: rgba(255,255,255,0.8); }
        .na-step-line {
          width: 60px;
          height: 1px;
          background: rgba(255,255,255,0.08);
          margin: 0 0.5rem;
          transition: background 0.3s;
        }
        .na-step-line-active { background: rgba(0, 82, 204, 0.3); }

        /* Form */
        .na-form {
          display: flex;
          flex-direction: column;
          gap: 1.125rem;
        }

        /* Section */
        .na-section {
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
          padding: 1.125rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px;
          transition: border-color 0.3s;
        }
        .na-section:focus-within {
          border-color: rgba(0, 82, 204, 0.18);
        }

        .na-section-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(92, 143, 255, 0.8);
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding-bottom: 0.625rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .na-fields { display: flex; flex-direction: column; gap: 0.875rem; }
        .na-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }
        @media (max-width: 640px) { .na-grid-2 { grid-template-columns: 1fr; } }

        /* Field */
        .na-field { display: flex; flex-direction: column; gap: 0.375rem; }
        .na-input-wrap { position: relative; display: flex; align-items: center; }
        .na-icon {
          position: absolute;
          left: 0.875rem;
          width: 0.9375rem;
          height: 0.9375rem;
          color: rgba(255,255,255,0.25);
          pointer-events: none;
          z-index: 1;
          transition: color 0.3s;
        }
        .na-input-wrap:focus-within .na-icon { color: #0052CC; }
        .na-select { appearance: none; cursor: pointer; }
        .na-pr { padding-right: 3rem; }
        .na-eye-btn {
          position: absolute;
          right: 0.875rem;
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.25);
          display: flex;
          align-items: center;
          transition: color 0.2s;
          padding: 0;
        }
        .na-eye-btn:hover { color: #0052CC; }

        /* Match */
        .na-match {
          position: absolute;
          right: 0.875rem;
          width: 7px; height: 7px;
          border-radius: 50%;
        }
        .na-match-ok { background: #0052CC; box-shadow: 0 0 6px #0052CC; }
        .na-match-no { background: #ef4444; box-shadow: 0 0 6px #ef4444; }

        /* Divider */
        .na-divider {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .na-divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.06);
        }
        .na-divider-text {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 10px;
          font-weight: 700;
          color: rgba(255,255,255,0.25);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          white-space: nowrap;
        }

        /* Submit */
        .na-submit-section {
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
        }
        .na-terms {
          text-align: center;
          font-size: 10px;
          color: rgba(255,255,255,0.22);
          line-height: 1.6;
        }
        .na-terms-link {
          color: rgba(92, 143, 255, 0.55);
          text-decoration: underline;
          text-underline-offset: 2px;
          transition: color 0.2s;
        }
        .na-terms-link:hover { color: #0052CC; }
      `}</style>
    </AuthWrapper>
  );
}