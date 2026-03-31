import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, KeyRound, Loader2, LogIn, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/state/auth';
import { authService } from '@/api/auth';
import { toast } from 'sonner';
import hederaLogo from '@/assets/hedera-logo.png';
import { getMultiFactorResolver, TotpMultiFactorGenerator, MultiFactorResolver } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function Login() {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [mfaResolver, setMfaResolver] = useState<MultiFactorResolver | null>(null);
  const [otpCode, setOtpCode] = useState('');

  const handleAuthSuccess = async (user: any) => {
    try {
      const token = await user.getIdToken();
      const authUser = await loginWithToken(token);
      
      toast.success('Authentication successful!');
      if (authUser.role === 'NONE') {
        navigate('/auth/role-selection');
      } else if (authUser.role === 'CLIENT') {
        navigate('/client');
      } else if (authUser.role === 'WEALTH_MANAGER') {
        navigate('/manager');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to sync with backend');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);

    try {
      const user = mode === 'register' 
        ? await authService.registerWithEmail(email, password)
        : await authService.loginWithEmail(email, password);
      await handleAuthSuccess(user);
    } catch (err: any) {
      if (err.code === 'auth/multi-factor-auth-required') {
        const resolver = getMultiFactorResolver(auth, err);
        setMfaResolver(resolver);
        toast.info('Multi-factor authentication required');
      } else {
        toast.error(err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const user = await authService.loginWithGoogle();
      await handleAuthSuccess(user);
    } catch (err: any) {
      if (err.code === 'auth/multi-factor-auth-required') {
        const resolver = getMultiFactorResolver(auth, err);
        setMfaResolver(resolver);
        toast.info('Multi-factor authentication required');
      } else {
        toast.error(err.message || 'Google Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTotpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaResolver || !otpCode) return;
    setLoading(true);
    try {
      const hint = mfaResolver.hints[0]; // use the first hint available (TOTP)
      const assertion = TotpMultiFactorGenerator.assertionForSignIn(hint.uid, otpCode);
      const userCredential = await mfaResolver.resolveSignIn(assertion);
      await handleAuthSuccess(userCredential.user);
    } catch (err: any) {
      toast.error(err.message || 'Invalid MFA code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-block">
            <img src={hederaLogo} alt="Hedera" className="w-16 h-16 rounded-2xl mx-auto mb-4" />
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Welcome to DFNS
          </h1>
          <p className="text-muted-foreground mt-2">
            {mfaResolver ? 'Security Verification' : (mode === 'login' ? 'Sign in to access your platform' : 'Create an account to get started')}
          </p>
        </div>

        <div className="p-8 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl shadow-xl space-y-6">
          {mfaResolver ? (
            <form onSubmit={handleTotpSubmit} className="space-y-4">
              <div className="space-y-2 text-center mb-6">
                 <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-4" />
                 <h2 className="text-xl font-semibold">Two-Factor Authentication</h2>
                 <p className="text-sm text-muted-foreground">Enter the 6-digit code from your authenticator app.</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-muted-foreground" />
                  Authentication Code
                </label>
                <Input
                  type="text"
                  placeholder="000000"
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value)}
                  maxLength={6}
                  required
                  className="bg-background/50 border-border/50 transition-all focus:border-primary/50 text-center text-xl tracking-widest"
                />
              </div>

              <Button type="submit" disabled={loading || otpCode.length < 6} className="w-full h-11 text-base font-medium mt-4">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify Code'}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setMfaResolver(null)}>
                Cancel
              </Button>
            </form>
          ) : (
            <>
              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="bg-background/50 border-border/50 transition-all focus:border-primary/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-muted-foreground" />
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="bg-background/50 border-border/50 transition-all focus:border-primary/50"
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full h-11 text-base font-medium">
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <LogIn className="w-5 h-5 mr-2" />
                  )}
                  {mode === 'login' ? 'Sign In' : 'Sign Up'}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={handleGoogleAuth}
                className="w-full h-11 bg-background/50 border-border/50 hover:bg-accent/10 hover:text-accent transition-all duration-300"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 mr-3" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </Button>

              <div className="pt-2 text-center">
                <button
                  onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setEmail(''); setPassword(''); }}
                  className="text-sm text-accent hover:text-accent/80 font-medium transition-colors"
                >
                  {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
