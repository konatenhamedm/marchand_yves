'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Eye, EyeOff, Loader2, Mail, Lock, LogIn, Fingerprint,
} from 'lucide-react';
import { signIn } from 'next-auth/react';
import { AuthWrapper } from '@/components/auth/AuthWrapper';
import Link from 'next/link';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ login: '', password: '' });
  const [focused, setFocused] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.login || !formData.password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        login: formData.login,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Identifiants incorrects. Veuillez réessayer.');
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        toast.success('Connexion établie. Bienvenue sur Moomen.');
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      toast.error('Une erreur système est survenue.');
      setIsLoading(false);
    }
  };

  return (
    <AuthWrapper
      title="Accès Moomen"
    /*   subtitle={
        <span className="flex items-center justify-center gap-1.5 flex-wrap">
          Pas encore de compte ?{' '}
          <Link
            href="/new_account"
            className="login-register-link"
          >
            Inscription gratuite →
          </Link>
        </span>
      } */
      imageTitle="Pilotage. Commerce. Intelligent."
      imageSubtitle="La plateforme B2B nouvelle génération pour la gestion complète de votre activité commerciale."
    >
      <form onSubmit={handleSubmit} className="login-form">

        {/* Email Field */}
        <div className={`login-field ${focused === 'login' ? 'login-field-focused' : ''}`}>
          <label className="auth-label">Identifiant de Connexion</label>
          <div className="login-input-wrap">
            <Mail className="login-icon" />
            <input
              name="login"
              type="email"
              required
              value={formData.login}
              onChange={handleInputChange}
              onFocus={() => setFocused('login')}
              onBlur={() => setFocused(null)}
              className="auth-input"
              placeholder="votre@email.com"
              autoComplete="email"
            />
            {formData.login && (
              <span className="login-check-dot" />
            )}
          </div>
        </div>

        {/* Password Field */}
        <div className={`login-field ${focused === 'password' ? 'login-field-focused' : ''}`}>
          <div className="login-label-row">
            <label className="auth-label">Mot de Passe</label>
            <Link href="/reset" className="login-forgot-link">
              Mot de passe oublié ?
            </Link>
          </div>
          <div className="login-input-wrap">
            <Lock className="login-icon" />
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={handleInputChange}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused(null)}
              className="auth-input pr-12"
              placeholder="••••••••••••"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="login-eye-btn"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
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
              <LogIn size={16} />
              Se Connecter
            </>
          )}
        </button>

        {/* Security note */}
        <div className="login-security">
          <Fingerprint size={12} className="login-security-icon" />
          <span>Connexion sécurisée · Chiffrement TLS 1.3</span>
        </div>
      </form>

      <style jsx global>{`
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .login-register-link {
          color: #0052CC;
          font-weight: 700;
          font-size: 13px;
          text-decoration: none;
          transition: color 0.2s, letter-spacing 0.2s;
        }
        .login-register-link:hover {
          color: #5C8FFF;
          letter-spacing: 0.01em;
        }

        .login-field {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
          transition: transform 0.2s;
        }
        .login-field-focused { transform: scale(1.005); }

        .login-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .login-forgot-link {
          font-size: 11px;
          font-weight: 600;
          color: rgba(255,255,255,0.35);
          text-decoration: none;
          transition: color 0.2s;
          letter-spacing: 0.02em;
        }
        .login-forgot-link:hover { color: #0052CC; }

        .login-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .login-icon {
          position: absolute;
          left: 1rem;
          width: 1.0625rem;
          height: 1.0625rem;
          color: rgba(255,255,255,0.25);
          pointer-events: none;
          transition: color 0.3s;
          z-index: 1;
        }
        .login-field-focused .login-icon { color: #0052CC; }

        .login-check-dot {
          position: absolute;
          right: 1rem;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #0052CC;
          box-shadow: 0 0 8px #0052CC;
        }

        .login-eye-btn {
          position: absolute;
          right: 1rem;
          color: rgba(255,255,255,0.3);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }
        .login-eye-btn:hover { color: #0052CC; }

        .auth-input.pr-12 { padding-right: 3rem; }

        .login-security {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.375rem;
          font-size: 10px;
          color: rgba(255,255,255,0.18);
          font-weight: 500;
          letter-spacing: 0.04em;
          padding-top: 0.25rem;
        }
        .login-security-icon { color: rgba(0, 82, 204, 0.35); }
      `}</style>
    </AuthWrapper>
  );
}