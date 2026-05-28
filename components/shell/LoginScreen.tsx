import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Mail, KeyRound, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

type Mode = 'sign-in' | 'sign-up';

export const LoginScreen = () => {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result =
      mode === 'sign-in'
        ? await signIn(email, password)
        : await signUp(email, password, name || undefined);
    if (result.error) setError(result.error);
    setLoading(false);
  };

  return (
    <div className="min-h-screen ambient-bg flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-brand/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        <div className="surface-elevated p-8 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-xl bg-brand/20 border border-brand/30 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-brand" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold tracking-tight">
                <span className="text-gradient-brand">Channel OS</span>
              </h1>
              <p className="text-xs text-fg-muted -mt-0.5">sistema operacional para canais</p>
            </div>
          </div>

          <p className="text-sm text-fg-secondary mt-6 mb-6">
            {mode === 'sign-in'
              ? 'Bem-vindo de volta. Entre pra continuar de onde parou.'
              : 'Crie sua conta. Email/senha local, dados ficam no seu Supabase.'}
          </p>

          <form onSubmit={onSubmit} className="space-y-3">
            {mode === 'sign-up' && (
              <label className="block">
                <span className="text-xs font-medium text-fg-secondary mb-1.5 block">Nome</span>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Como Hermes deve te chamar"
                  autoComplete="name"
                />
              </label>
            )}

            <label className="block">
              <span className="text-xs font-medium text-fg-secondary mb-1.5 block">Email</span>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-muted pointer-events-none" />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  placeholder="voce@email.com"
                  autoComplete="email"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-xs font-medium text-fg-secondary mb-1.5 block">Senha</span>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-muted pointer-events-none" />
                <Input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  placeholder="mínimo 6 caracteres"
                  autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
                />
              </div>
            </label>

            {error && (
              <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
              {!loading && (mode === 'sign-in' ? 'Entrar' : 'Criar conta')}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-fg-muted">
            {mode === 'sign-in' ? (
              <>
                Não tem conta?{' '}
                <button onClick={() => setMode('sign-up')} className="text-brand hover:underline font-medium">
                  Criar conta
                </button>
              </>
            ) : (
              <>
                Já tem conta?{' '}
                <button onClick={() => setMode('sign-in')} className="text-brand hover:underline font-medium">
                  Entrar
                </button>
              </>
            )}
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] text-fg-muted">
          Supabase local em <code className="font-mono text-fg-secondary">localhost:54321</code> — rode{' '}
          <code className="font-mono text-fg-secondary">supabase start</code>
        </p>
      </motion.div>
    </div>
  );
};
