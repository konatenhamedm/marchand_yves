'use client';

import React, { useRef, useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BASE_URL_LAMBDA } from '@/lib/axios';
import { signIn } from 'next-auth/react';
import {
  Clock, Loader2, MailCheck, Lock, Eye, EyeOff,
  CheckCircle2, ShieldCheck, RefreshCw,
} from 'lucide-react';
import { AuthWrapper } from '@/components/auth/AuthWrapper';
import { toast } from 'sonner';

function ResetPasswordOTPContent() {
  const inputsRef = useRef<HTMLInputElement[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get('email') || '';
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'otp' | 'newPassword'>('otp');
  const [token, setToken] = useState('');
  const [filledCount, setFilledCount] = useState(0);
  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });

  useEffect(() => {
    const expiry = localStorage.getItem('reset_password_expiry');
    if (expiry) {
      const diff = Math.floor((+expiry - Date.now()) / 1000);
      if (diff > 0) setTimeLeft(diff);
      else {
        localStorage.setItem('reset_password_expiry', (Date.now() + 600 * 1000).toString());
        setTimeLeft(600);
      }
    } else {
      localStorage.setItem('reset_password_expiry', (Date.now() + 600 * 1000).toString());
      setTimeLeft(600);
    }
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { localStorage.removeItem('reset_password_expiry'); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const updateFilledCount = () => {
    setFilledCount(inputsRef.current.filter(i => i?.value).length);
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/\D/g, '');
    e.target.value = value;
    updateFilledCount();
    if (value && index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !e.currentTarget.value && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    pasted.split('').forEach((ch, i) => {
      if (inputsRef.current[i]) inputsRef.current[i].value = ch;
    });
    updateFilledCount();
    inputsRef.current[Math.min(pasted.length, 3)]?.focus();
  };

  const verifyTokenExpired = async (token: string) => {
    try {
      const response = await fetch(`${BASE_URL_LAMBDA}/auth/resetPassword/confirmOTP/${encodeURIComponent(email)}/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      return { ok: response.ok };
    } catch (error) {
      console.error('Erreur vérification token:', error);
      return { ok: false };
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = inputsRef.current.map(i => i.value).join('');
    if (otpCode.length !== 4) { toast.error('Saisissez le code complet à 4 chiffres'); return; }

    setIsLoading(true);
    try {
      const { ok } = await verifyTokenExpired(otpCode);
      if (!ok) throw new Error('Code expiré ou invalide');

      setToken(otpCode);
      setStep('newPassword');
      toast.success('Code validé ! Configurez votre nouveau mot de passe.');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (formData.newPassword.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Appel de l'API de reset finalize
      const resetResponse = await fetch(`${BASE_URL_LAMBDA}/auth/resetPassword/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          login: email,
          password: formData.newPassword,
          confirmation: formData.confirmPassword
        })
      });

      if (!resetResponse.ok) {
        throw new Error('Échec lors de la réinitialisation');
      }

      toast.success('Mot de passe mis à jour ! Redirection...');
      
      // 2. Connexion directe
      const result = await signIn('credentials', {
        login: email,
        password: formData.newPassword,
        redirect: false,
      });

      if (result?.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        router.push('/login');
      }

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const progress = (filledCount / 4) * 100;

  return (
    <AuthWrapper
      title={step === 'otp' ? 'Vérification' : 'Nouveau Mot de Passe'}
      subtitle={
        step === 'otp' ? (
          <span className="otp-subtitle">
            Code envoyé à{' '}
            <strong className="otp-email">{email || 'votre email'}</strong>
          </span>
        ) : (
          <span className="otp-subtitle">
            Choisissez un mot de passe robuste d'au moins 8 caractères.
          </span>
        )
      }
      imageTitle={step === 'otp' ? 'Identité. Vérifiée.' : 'Sécurisé. Renforcé.'}
      imageSubtitle="L'accès à votre espace Moomen Pro est protégé par authentification sécurisée."
      showBack={true}
    >
      {step === 'otp' ? (
        <form onSubmit={handleOtpSubmit} className="otp-form">

          {/* OTP Digits */}
          <div className="otp-inputs-section">
            <div className="otp-inputs" onPaste={handleOtpPaste}>
              {[...Array(4)].map((_, i) => (
                <input
                  key={i}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="otp-digit"
                  ref={(el) => { if (el) inputsRef.current[i] = el; }}
                  onChange={(e) => handleOtpChange(e, i)}
                  onKeyDown={(e) => handleOtpKeyDown(e, i)}
                  required
                />
              ))}
            </div>

            {/* Progress bar */}
            <div className="otp-progress">
              <div
                className="otp-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="otp-hint">
              {filledCount === 0
                ? 'Saisissez ou collez votre code'
                : filledCount < 4
                  ? `${4 - filledCount} chiffre${4 - filledCount > 1 ? 's' : ''} restant${4 - filledCount > 1 ? 's' : ''}`
                  : '✓ Code complet — prêt à valider'}
            </p>
          </div>

          {/* Timer */}
          <div className={`otp-timer ${timeLeft < 60 ? 'otp-timer-urgent' : ''}`}>
            <Clock size={15} className="otp-timer-icon" />
            <span className="otp-timer-label">Expire dans</span>
            <span className="otp-timer-value">{formatTime(timeLeft)}</span>
          </div>

          {/* Resend */}
          <div className="otp-resend">
            <p className="otp-resend-text">Code non reçu ?</p>
            <button type="button" className="otp-resend-btn" onClick={() => {
              // Optionnel: ajouter la logique de renvoi ici
              toast.info('Procédure de renvoi en cours...');
            }}>
              <RefreshCw size={13} />
              Renvoyer le code
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || timeLeft <= 0 || filledCount < 4}
            className="auth-btn-primary"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <ShieldCheck size={16} />
                Valider le Code
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handlePasswordSubmit} className="otp-pw-form">
          {/* Success indicator */}
          <div className="otp-verified-badge">
            <CheckCircle2 className="w-4 h-4 text-[#0052CC]" />
            <span>Identité vérifiée — définissez votre nouveau mot de passe</span>
          </div>

          {/* New Password */}
          <div className="otp-pw-field">
            <label className="auth-label">Nouveau Mot de Passe</label>
            <div className="otp-pw-input-wrap">
              <Lock className="otp-pw-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="auth-input"
                placeholder="Min. 8 caractères"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="otp-pw-eye"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="otp-pw-field">
            <label className="auth-label">Confirmer le Mot de Passe</label>
            <div className="otp-pw-input-wrap">
              <Lock className="otp-pw-icon" />
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="auth-input"
                placeholder="Répétez votre mot de passe"
                autoComplete="new-password"
              />
              {formData.confirmPassword && (
                <span className={`otp-match-dot ${
                  formData.newPassword === formData.confirmPassword ? 'match-ok' : 'match-no'
                }`} />
              )}
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={isLoading} className="auth-btn-primary">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <ShieldCheck size={16} />
                Sécuriser mon Compte
              </>
            )}
          </button>
        </form>
      )}

      <style jsx global>{`
        .otp-form, .otp-pw-form {
          display: flex;
          flex-direction: column;
          gap: 1.375rem;
        }

        .otp-subtitle { font-size: 13px; color: rgba(255,255,255,0.4); font-weight: 450; }
        .otp-email { color: #0052CC; font-weight: 700; }

        /* OTP Inputs Section */
        .otp-inputs-section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .otp-inputs {
          display: flex;
          gap: 0.625rem;
          justify-content: center;
        }
        .otp-digit {
          width: 100%;
          max-width: 52px;
          height: 60px;
          text-align: center;
          font-size: 1.5rem;
          font-weight: 900;
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          color: #0052CC;
          outline: none;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: 'Inter', monospace;
          letter-spacing: 0;
          caret-color: #0052CC;
        }
        .otp-digit:focus {
          border-color: #0052CC;
          background: rgba(0, 82, 204, 0.08);
          box-shadow: 0 0 0 3px rgba(0, 82, 204, 0.15), 0 4px 12px rgba(0,0,0,0.2);
          transform: scale(1.06) translateY(-2px);
        }
        .otp-digit:not(:placeholder-shown) {
          border-color: rgba(0, 82, 204, 0.4);
          background: rgba(0, 82, 204, 0.05);
        }

        /* Progress */
        .otp-progress {
          height: 3px;
          border-radius: 100px;
          background: rgba(255,255,255,0.06);
          overflow: hidden;
        }
        .otp-progress-fill {
          height: 100%;
          border-radius: 100px;
          background: linear-gradient(90deg, #0052CC, #5C8FFF);
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .otp-hint {
          text-align: center;
          font-size: 11px;
          color: rgba(255,255,255,0.25);
          font-weight: 500;
          font-style: italic;
        }

        /* Timer */
        .otp-timer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          border-radius: 100px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          font-size: 12px;
          color: rgba(255,255,255,0.6);
          font-weight: 600;
          transition: all 0.3s;
        }
        .otp-timer-urgent {
          background: rgba(239,68,68,0.08);
          border-color: rgba(239,68,68,0.2);
          color: #ef4444;
        }
        .otp-timer-icon { color: #0052CC; }
        .otp-timer-urgent .otp-timer-icon {
          color: #ef4444;
          animation: pulse 1s ease-in-out infinite;
        }
        .otp-timer-label { color: rgba(255,255,255,0.35); }
        .otp-timer-value {
          font-variant-numeric: tabular-nums;
          font-weight: 800;
          font-size: 1rem;
          letter-spacing: -0.02em;
          color: inherit;
        }

        /* Resend */
        .otp-resend {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.375rem;
        }
        .otp-resend-text {
          font-size: 11px;
          color: rgba(255,255,255,0.25);
          font-style: italic;
        }
        .otp-resend-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 12px;
          font-weight: 700;
          color: rgba(0, 82, 204, 0.7);
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.2s, gap 0.2s;
          padding: 0;
          font-family: inherit;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .otp-resend-btn:hover { color: #0052CC; gap: 0.5rem; }

        /* Verified Badge */
        .otp-verified-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          background: rgba(0, 82, 204, 0.07);
          border: 1px solid rgba(0, 82, 204, 0.2);
          color: rgba(0, 82, 204, 0.8);
          font-size: 12px;
          font-weight: 600;
        }

        /* PW Fields */
        .otp-pw-field {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }
        .otp-pw-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .otp-pw-icon {
          position: absolute;
          left: 1rem;
          width: 1rem;
          height: 1rem;
          color: rgba(255,255,255,0.25);
          pointer-events: none;
          z-index: 1;
        }
        .otp-pw-eye {
          position: absolute;
          right: 1rem;
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.3);
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }
        .otp-pw-eye:hover { color: #0052CC; }

        /* Match dot */
        .otp-match-dot {
          position: absolute;
          right: 1rem;
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .match-ok { background: #0052CC; box-shadow: 0 0 8px #0052CC; }
        .match-no { background: #ef4444; box-shadow: 0 0 8px #ef4444; }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
      `}</style>
    </AuthWrapper>
  );
}

export default function ResetPasswordOTPPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A1628]" />}>
      <ResetPasswordOTPContent />
    </Suspense>
  );
}