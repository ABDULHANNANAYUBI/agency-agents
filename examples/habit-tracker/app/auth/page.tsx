'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Zap } from 'lucide-react';
import { useStore } from '@/lib/store';

type Tab = 'signin' | 'signup';

export default function AuthPage() {
  const router = useRouter();
  const signIn = useStore((s) => s.signIn);
  const signUp = useStore((s) => s.signUp);

  const [tab, setTab] = useState<Tab>('signin');

  // Sign-in state
  const [siEmail, setSiEmail] = useState('');
  const [siPassword, setSiPassword] = useState('');
  const [siShowPw, setSiShowPw] = useState(false);
  const [siErrors, setSiErrors] = useState<Record<string, string>>({});
  const [siServerError, setSiServerError] = useState('');

  // Sign-up state
  const [suName, setSuName] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPassword, setSuPassword] = useState('');
  const [suConfirm, setSuConfirm] = useState('');
  const [suShowPw, setSuShowPw] = useState(false);
  const [suShowConfirm, setSuShowConfirm] = useState(false);
  const [suErrors, setSuErrors] = useState<Record<string, string>>({});
  const [suServerError, setSuServerError] = useState('');

  const [loading, setLoading] = useState(false);

  function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!siEmail.trim()) errors.email = 'Email is required';
    else if (!validateEmail(siEmail)) errors.email = 'Enter a valid email address';
    if (!siPassword) errors.password = 'Password is required';
    setSiErrors(errors);
    setSiServerError('');
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      await signIn(siEmail.trim(), siPassword);
      router.push('/');
    } catch (err) {
      setSiServerError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!suName.trim()) errors.name = 'Full name is required';
    if (!suEmail.trim()) errors.email = 'Email is required';
    else if (!validateEmail(suEmail)) errors.email = 'Enter a valid email address';
    if (!suPassword) errors.password = 'Password is required';
    else if (suPassword.length < 8) errors.password = 'Password must be at least 8 characters';
    if (!suConfirm) errors.confirm = 'Please confirm your password';
    else if (suPassword !== suConfirm) errors.confirm = 'Passwords do not match';
    setSuErrors(errors);
    setSuServerError('');
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      await signUp(suName.trim(), suEmail.trim(), suPassword);
      router.push('/');
    } catch (err) {
      setSuServerError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <title>HabitForge – Sign In</title>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-3 shadow-lg">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">HabitForge</h1>
            <p className="text-indigo-200 text-sm mt-1">Build lasting habits, one day at a time</p>
          </div>

          {/* Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden">
            {/* Tab switcher */}
            <div className="flex border-b border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => {
                  setTab('signin');
                  setSiErrors({});
                  setSiServerError('');
                }}
                className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                  tab === 'signin'
                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('signup');
                  setSuErrors({});
                  setSuServerError('');
                }}
                className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                  tab === 'signup'
                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                Sign Up
              </button>
            </div>

            <div className="p-8">
              {/* ---- SIGN IN ---- */}
              {tab === 'signin' && (
                <form onSubmit={handleSignIn} noValidate className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      Welcome back
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Sign in to continue your habit journey
                    </p>
                  </div>

                  {siServerError && (
                    <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 text-sm text-red-600 dark:text-red-400">
                      {siServerError}
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="si-email"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                    >
                      Email address
                    </label>
                    <input
                      id="si-email"
                      type="email"
                      autoComplete="email"
                      value={siEmail}
                      onChange={(e) => setSiEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={`w-full px-4 py-3 rounded-xl border text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                        siErrors.email
                          ? 'border-red-400 dark:border-red-500'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    />
                    {siErrors.email && (
                      <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">
                        {siErrors.email}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      htmlFor="si-password"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="si-password"
                        type={siShowPw ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={siPassword}
                        onChange={(e) => setSiPassword(e.target.value)}
                        placeholder="Your password"
                        className={`w-full px-4 py-3 pr-11 rounded-xl border text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                          siErrors.password
                            ? 'border-red-400 dark:border-red-500'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setSiShowPw(!siShowPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        aria-label={siShowPw ? 'Hide password' : 'Show password'}
                      >
                        {siShowPw ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {siErrors.password && (
                      <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">
                        {siErrors.password}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    {loading && (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    {loading ? 'Signing in…' : 'Sign In'}
                  </button>

                  <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                    Don&apos;t have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setTab('signup')}
                      className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                    >
                      Sign up
                    </button>
                  </p>
                </form>
              )}

              {/* ---- SIGN UP ---- */}
              {tab === 'signup' && (
                <form onSubmit={handleSignUp} noValidate className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      Create your account
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Start building better habits today
                    </p>
                  </div>

                  {suServerError && (
                    <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 text-sm text-red-600 dark:text-red-400">
                      {suServerError}
                    </div>
                  )}

                  {/* Full name */}
                  <div>
                    <label
                      htmlFor="su-name"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                    >
                      Full name
                    </label>
                    <input
                      id="su-name"
                      type="text"
                      autoComplete="name"
                      value={suName}
                      onChange={(e) => setSuName(e.target.value)}
                      placeholder="Jane Doe"
                      className={`w-full px-4 py-3 rounded-xl border text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                        suErrors.name
                          ? 'border-red-400 dark:border-red-500'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    />
                    {suErrors.name && (
                      <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">
                        {suErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="su-email"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                    >
                      Email address
                    </label>
                    <input
                      id="su-email"
                      type="email"
                      autoComplete="email"
                      value={suEmail}
                      onChange={(e) => setSuEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={`w-full px-4 py-3 rounded-xl border text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                        suErrors.email
                          ? 'border-red-400 dark:border-red-500'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    />
                    {suErrors.email && (
                      <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">
                        {suErrors.email}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      htmlFor="su-password"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                    >
                      Password
                      <span className="ml-1 text-xs font-normal text-gray-400">
                        (min 8 characters)
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        id="su-password"
                        type={suShowPw ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={suPassword}
                        onChange={(e) => setSuPassword(e.target.value)}
                        placeholder="Create a password"
                        className={`w-full px-4 py-3 pr-11 rounded-xl border text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                          suErrors.password
                            ? 'border-red-400 dark:border-red-500'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setSuShowPw(!suShowPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        aria-label={suShowPw ? 'Hide password' : 'Show password'}
                      >
                        {suShowPw ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {suErrors.password && (
                      <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">
                        {suErrors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label
                      htmlFor="su-confirm"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                    >
                      Confirm password
                    </label>
                    <div className="relative">
                      <input
                        id="su-confirm"
                        type={suShowConfirm ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={suConfirm}
                        onChange={(e) => setSuConfirm(e.target.value)}
                        placeholder="Repeat your password"
                        className={`w-full px-4 py-3 pr-11 rounded-xl border text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                          suErrors.confirm
                            ? 'border-red-400 dark:border-red-500'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setSuShowConfirm(!suShowConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        aria-label={suShowConfirm ? 'Hide password' : 'Show password'}
                      >
                        {suShowConfirm ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {suErrors.confirm && (
                      <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">
                        {suErrors.confirm}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    {loading && (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    {loading ? 'Creating account…' : 'Create Account'}
                  </button>

                  <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setTab('signin')}
                      className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
