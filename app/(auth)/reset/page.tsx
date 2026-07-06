'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, Send, ShieldAlert } from 'lucide-react';
import { BASE_URL_LAMBDA } from '@/lib/axios';
import { AuthWrapper } from '@/components/auth/AuthWrapper';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Veuillez renseigner votre email de connexion');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL_LAMBDA}/auth/resetPassword/init/${encodeURIComponent(email)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Identifiant inconnu');

      setSent(true);
      toast.success('Code de restauration transmis. Vérifiez votre boîte mail.');
      setTimeout(() => {
        router.push(`/otp?email=${encodeURIComponent(email)}&mode=reset`);
      }, 2000);

    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthWrapper
      title="Restauration"
      subtitle={
        <span className="reset-subtitle">
          Saisissez votre e-mail pour recevoir un code de récupération sécurisé.
        </span>
      }
      imageTitle="Souveraineté. Sécurité. Reprise."
      imageSubtitle="Protocoles de sécurité avancés pour la protection intégrale de vos informations de connexion Moomen Pro."
      showBack={true}
    >
      {sent ? (
        <div className="reset-success-box">
          <div className="reset-success-icon">
            <Mail className="w-7 h-7 text-[#0052CC]" />
          </div>
          <h3 className="reset-success-title">Email envoyé !</h3>
          <p className="reset-success-text">
            Vérifiez votre boîte{' '}
            <strong className="text-[#0052CC]">{email}</strong>
            {' '}et suivez les instructions.
          </p>
          <div className="reset-success-progress">
            <div className="reset-success-bar" />
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="reset-form">
          {/* Alert box */}
          <div className="reset-alert">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
            <p>
              Une vérification sera envoyée à votre adresse email enregistrée. Le code expire après <strong>10 minutes</strong>.
            </p>
          </div>

          {/* Email Field */}
          <div className={`reset-field ${focused ? 'reset-field-focused' : ''}`}>
            <label className="auth-label">Adresse E-mail de Récupération</label>
            <div className="reset-input-wrap">
              <Mail className="reset-icon" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="auth-input"
                placeholder="votre@email.com"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="auth-btn-primary"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send size={15} />
                Envoyer le Code de Récupération
              </>
            )}
          </button>
        </form>
      )}

      <style jsx global>{`
        .reset-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .reset-subtitle {
          color: rgba(255,255,255,0.38);
          font-size: 13px;
          font-weight: 450;
          line-height: 1.55;
        }

        .reset-alert {
          display: flex;
          align-items: flex-start;
          gap: 0.625rem;
          padding: 0.875rem 1rem;
          background: rgba(251,191,36,0.06);
          border: 1px solid rgba(251,191,36,0.18);
          border-radius: 12px;
          color: rgba(251,191,36,0.75);
          font-size: 12px;
          font-weight: 500;
          line-height: 1.5;
        }
        .reset-alert strong { font-weight: 700; color: rgba(251,191,36,0.9); }

        .reset-field {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
          transition: transform 0.2s;
        }
        .reset-field-focused { transform: scale(1.005); }

        .reset-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .reset-icon {
          position: absolute;
          left: 1rem;
          width: 1rem;
          height: 1rem;
          color: rgba(255,255,255,0.25);
          pointer-events: none;
          transition: color 0.3s;
          z-index: 1;
        }
        .reset-field-focused .reset-icon { color: #0052CC; }

        /* Success State */
        .reset-success-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 2rem 1rem;
          text-align: center;
          animation: fadeIn 0.5s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .reset-success-icon {
          width: 64px; height: 64px;
          border-radius: 50%;
          background: rgba(0, 82, 204, 0.12);
          border: 1px solid rgba(0, 82, 204, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes bounceIn {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
        .reset-success-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.02em;
        }
        .reset-success-text {
          font-size: 13px;
          color: rgba(255,255,255,0.45);
          line-height: 1.55;
          max-width: 280px;
        }
        .reset-success-progress {
          width: 100%;
          height: 3px;
          border-radius: 100px;
          background: rgba(255,255,255,0.07);
          overflow: hidden;
        }
        .reset-success-bar {
          height: 100%;
          background: linear-gradient(90deg, #0052CC, #5C8FFF);
          border-radius: 100px;
          animation: progress 2s linear forwards;
        }
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </AuthWrapper>
  );
}