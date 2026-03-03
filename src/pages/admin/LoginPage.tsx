// src/pages/admin/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../supabase/auth';
import { useTheme } from '../../context/ThemeContext';
import { logger } from '../../utils/logger';

const LoginPage: React.FC = () => {
  const LOGIN_ATTEMPTS_KEY = 'admin_login_attempts';
  const LOGIN_BLOCKED_UNTIL_KEY = 'admin_login_blocked_until';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [blockedUntilMs, setBlockedUntilMs] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const checkAuth = async () => {
      const user = await authService.getCurrentUser();
      if (user) {
        navigate('/admin/dashboard');
      }
    };

    checkAuth();

    const savedEmail = localStorage.getItem('admin_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }

    const savedAttempts = Number(sessionStorage.getItem(LOGIN_ATTEMPTS_KEY) ?? '0');
    if (Number.isFinite(savedAttempts) && savedAttempts > 0) {
      setLoginAttempts(savedAttempts);
    }
    const savedBlockedUntil = Number(sessionStorage.getItem(LOGIN_BLOCKED_UNTIL_KEY) ?? '0');
    if (Number.isFinite(savedBlockedUntil) && savedBlockedUntil > Date.now()) {
      setBlockedUntilMs(savedBlockedUntil);
    } else {
      sessionStorage.removeItem(LOGIN_BLOCKED_UNTIL_KEY);
    }
  }, [navigate]);

  useEffect(() => {
    if (blockedUntilMs === null) return;
    if (Date.now() >= blockedUntilMs) {
      setBlockedUntilMs(null);
      sessionStorage.removeItem(LOGIN_BLOCKED_UNTIL_KEY);
      return;
    }

    const intervalId = window.setInterval(() => setNowMs(Date.now()), 250);
    const timeoutId = window.setTimeout(() => {
      setBlockedUntilMs(null);
      sessionStorage.removeItem(LOGIN_BLOCKED_UNTIL_KEY);
    }, blockedUntilMs - Date.now());

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [blockedUntilMs]);

  const isBlocked = blockedUntilMs !== null && nowMs < blockedUntilMs;
  const remainingSeconds = isBlocked ? Math.ceil((blockedUntilMs - nowMs) / 1000) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError('');

      if (isBlocked) {
        setError(`Troppi tentativi falliti. Riprova tra ${remainingSeconds}s.`);
        return;
      }

      setLoading(true);

      if (rememberMe) {
        localStorage.setItem('admin_email', email);
      } else {
        localStorage.removeItem('admin_email');
      }

      await authService.login(email, password);

      const now = new Date().toISOString();
      sessionStorage.setItem('last_login_time', now);

      setLoginAttempts(0);
      sessionStorage.removeItem(LOGIN_ATTEMPTS_KEY);
      setBlockedUntilMs(null);
      sessionStorage.removeItem(LOGIN_BLOCKED_UNTIL_KEY);

      navigate('/admin/dashboard');
    } catch (error: any) {
      const nextAttempts = loginAttempts + 1;
      setLoginAttempts(nextAttempts);
      sessionStorage.setItem(LOGIN_ATTEMPTS_KEY, String(nextAttempts));

      if (nextAttempts >= 3) {
        const delayMs = Math.min(15 * 60 * 1000, 30 * 1000 * Math.pow(2, nextAttempts - 3));
        const untilMs = Date.now() + delayMs;
        setBlockedUntilMs(untilMs);
        sessionStorage.setItem(LOGIN_BLOCKED_UNTIL_KEY, String(untilMs));
        setError(`Troppi tentativi falliti. Riprova tra ${Math.ceil(delayMs / 1000)}s o reimposta la password.`);
      } else {
        setError('Credenziali non valide. Riprova.');
      }
      logger.error("Auth error", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      await authService.resetPassword(resetEmail);

      setResetSent(true);
    } catch (error: any) {
      setError('Impossibile inviare l\'email di reset. Verifica l\'indirizzo inserito.');
      logger.error("Auth error", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-black relative overflow-hidden">
      {/* Theme toggle */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={toggleTheme}
          className="p-3 border border-black/10 dark:border-white/10 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>

      <div className="w-full max-w-md z-10">
        {!forgotPassword ? (
            <div className="w-full animate-fade-in">
              <div className="border border-black/10 dark:border-white/10 p-10">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-primary flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-black uppercase tracking-tight text-black dark:text-white">Admin Panel</h1>
                  <p className="text-xs font-medium text-black/60 dark:text-white/60 mt-2 uppercase tracking-widest">Accedi per gestire i contenuti</p>
                </div>

                {error && (
                  <div className="bg-red-600 text-white p-4 mb-6 border border-red-600 animate-fade-in">
                    <div className="flex">
                      <svg className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span className="text-xs font-black uppercase tracking-wider">{error}</span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-xs font-black uppercase tracking-widest text-black dark:text-white mb-2">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-transparent border border-black/10 dark:border-white/10 focus:border-primary transition-all focus:outline-none text-black dark:text-white placeholder-black/30 dark:placeholder-white/30"
                      placeholder="admin@esempio.com"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-xs font-black uppercase tracking-widest text-black dark:text-white mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-transparent border border-black/10 dark:border-white/10 focus:border-primary transition-all focus:outline-none text-black dark:text-white placeholder-black/30 dark:placeholder-white/30"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
                      >
                        {showPassword ? (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={() => setRememberMe(!rememberMe)}
                        className="w-4 h-4 border-2 border-black/20 dark:border-white/20 checked:bg-primary checked:border-primary"
                      />
                      <span className="ml-2 text-xs font-black uppercase tracking-widest text-black dark:text-white">Ricordami</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => setForgotPassword(true)}
                      className="text-xs font-black uppercase tracking-widest text-primary hover:underline"
                    >
                      Password dimenticata?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || isBlocked}
                    className="w-full px-6 py-4 bg-primary hover:bg-primary-dark text-white font-black uppercase tracking-widest transition-all flex items-center justify-center disabled:opacity-50 border border-primary"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Accesso...</span>
                      </>
                    ) : isBlocked ? (
                      <span>Riprova tra {remainingSeconds}s</span>
                    ) : (
                      <span>Accedi</span>
                    )}
                  </button>
                </form>
              </div>

              <p className="text-center text-[10px] font-black uppercase tracking-widest text-black/50 dark:text-white/40 mt-6">
                © {new Date().getFullYear()} Scandellari Admin
              </p>
            </div>
          ) : (
            <div className="w-full animate-fade-in">
              <div className="border border-black/10 dark:border-white/10 p-10">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-primary flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-black uppercase tracking-tight text-black dark:text-white">Reimposta Password</h1>
                  <p className="text-xs font-medium text-black/60 dark:text-white/60 mt-2 uppercase tracking-widest">
                    {resetSent ? "Email inviata!" : "Inserisci la tua email"}
                  </p>
                </div>

                {error && (
                  <div className="bg-red-600 text-white p-4 mb-6 border border-red-600 animate-fade-in">
                    <span className="text-xs font-black uppercase tracking-wider">{error}</span>
                  </div>
                )}

                {resetSent ? (
                  <div className="bg-green-600 text-white p-4 mb-6 border border-green-600">
                    <span className="text-xs font-black uppercase tracking-wider">Controlla la tua email per le istruzioni</span>
                  </div>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-5">
                    <div>
                      <label htmlFor="reset-email" className="block text-xs font-black uppercase tracking-widest text-black dark:text-white mb-2">
                        Email
                      </label>
                      <input
                        id="reset-email"
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-transparent border border-black/10 dark:border-white/10 focus:border-primary transition-all focus:outline-none text-black dark:text-white placeholder-black/30 dark:placeholder-white/30"
                        placeholder="admin@esempio.com"
                        required
                      />
                    </div>

                    <div className="flex space-x-4 mt-6">
                      <button
                        type="button"
                        className="flex-1 px-6 py-4 border border-black/10 dark:border-white/10 text-black dark:text-white font-black uppercase tracking-widest hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all"
                        onClick={() => setForgotPassword(false)}
                      >
                        Annulla
                      </button>

                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-6 py-4 bg-primary hover:bg-primary-dark text-white font-black uppercase tracking-widest transition-all disabled:opacity-50 border border-primary"
                      >
                        {loading ? 'Invio...' : 'Invia'}
                      </button>
                    </div>
                  </form>
                )}

                {resetSent && (
                  <button
                    type="button"
                    className="w-full px-6 py-4 mt-6 border border-black/10 dark:border-white/10 text-black dark:text-white font-black uppercase tracking-widest hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all"
                    onClick={() => {
                      setForgotPassword(false);
                      setResetSent(false);
                    }}
                  >
                    Torna al login
                  </button>
                )}
              </div>

              <p className="text-center text-[10px] font-black uppercase tracking-widest text-black/50 dark:text-white/40 mt-6">
                © {new Date().getFullYear()} Scandellari Admin
              </p>
            </div>
          )}
      </div>
    </div>
  );
};

export default LoginPage;
