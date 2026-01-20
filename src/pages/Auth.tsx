import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Sparkles, Mail, Lock, User, UserCircle } from 'lucide-react';
import { z } from 'zod';

// Social provider icons
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
  </svg>
);

const KakaoIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5">
    <path
      fill="#000000"
      d="M12 3c-5.52 0-10 3.59-10 8 0 2.84 1.84 5.34 4.62 6.77-.15.51-.95 3.27-.98 3.51 0 0-.02.16.08.22.1.06.22.01.22.01.29-.04 3.37-2.2 3.9-2.57.69.1 1.41.16 2.16.16 5.52 0 10-3.59 10-8s-4.48-8-10-8z"
    />
  </svg>
);

// Validation schemas
const emailSchema = z.string().email('올바른 이메일 주소를 입력해주세요');
const passwordSchema = z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다');
const displayNameSchema = z.string().min(2, '이름은 최소 2자 이상이어야 합니다').max(50, '이름은 50자를 초과할 수 없습니다');

type AuthMode = 'social' | 'login' | 'signup';

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [mode, setMode] = useState<AuthMode>('social');
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; displayName?: string }>({});

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (user && !authLoading) {
      navigate(from, { replace: true });
    }
  }, [user, authLoading, navigate, from]);

  const validateForm = (isSignup: boolean): boolean => {
    const newErrors: { email?: string; password?: string; displayName?: string } = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }
    
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }
    
    if (isSignup) {
      const displayNameResult = displayNameSchema.safeParse(displayName);
      if (!displayNameResult.success) {
        newErrors.displayName = displayNameResult.error.errors[0].message;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSocialLogin = async (provider: 'google' | 'apple' | 'kakao') => {
    setLoading(provider);
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error(`${provider} login error:`, error);
      }
      toast({
        title: '로그인 실패',
        description: '로그인 중 오류가 발생했습니다. 다시 시도해주세요.',
        variant: 'destructive',
      });
      setLoading(null);
    }
  };

  const handleGuestLogin = async () => {
    setLoading('guest');
    
    try {
      const { error } = await supabase.auth.signInAnonymously();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: '게스트로 로그인되었습니다',
        description: '일부 기능이 제한될 수 있습니다.',
      });
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('Guest login error:', error);
      }
      toast({
        title: '로그인 실패',
        description: '게스트 로그인 중 오류가 발생했습니다. 다시 시도해주세요.',
        variant: 'destructive',
      });
      setLoading(null);
    }
  };

  const handleEmailLogin = async () => {
    if (!validateForm(false)) return;
    
    setLoading('email-login');
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: '로그인 성공',
        description: '환영합니다!',
      });
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('Email login error:', error);
      }
      toast({
        title: '로그인 실패',
        description: error.message === 'Invalid login credentials' 
          ? '이메일 또는 비밀번호가 올바르지 않습니다.' 
          : '로그인 중 오류가 발생했습니다. 다시 시도해주세요.',
        variant: 'destructive',
      });
      setLoading(null);
    }
  };

  const handleEmailSignup = async () => {
    if (!validateForm(true)) return;
    
    setLoading('email-signup');
    
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            display_name: displayName.trim(),
          },
        },
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: '회원가입 완료',
        description: '환영합니다! 로그인되었습니다.',
      });
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('Email signup error:', error);
      }
      toast({
        title: '회원가입 실패',
        description: error.message === 'User already registered'
          ? '이미 가입된 이메일입니다.'
          : '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.',
        variant: 'destructive',
      });
      setLoading(null);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setErrors({});
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Back button */}
      <div className="absolute top-4 left-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (mode !== 'social') {
              setMode('social');
              resetForm();
            } else {
              navigate('/');
            }
          }}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo and Title */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-hero mb-6 shadow-glow"
            >
              <Sparkles className="h-10 w-10 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              BioAge Insight
            </h1>
            <p className="text-muted-foreground">
              {mode === 'social' && '소셜 계정으로 간편하게 시작하세요'}
              {mode === 'login' && '이메일로 로그인하세요'}
              {mode === 'signup' && '새 계정을 만드세요'}
            </p>
          </div>

          {mode === 'social' && (
            <>
              {/* Social Login Buttons */}
              <div className="space-y-4">
                {/* Google */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    variant="outline"
                    className="w-full h-14 text-base font-medium relative bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
                    onClick={() => handleSocialLogin('google')}
                    disabled={loading !== null}
                  >
                    {loading === 'google' ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <GoogleIcon />
                        <span className="ml-3">Google로 계속하기</span>
                      </>
                    )}
                  </Button>
                </motion.div>

                {/* Apple */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    variant="outline"
                    className="w-full h-14 text-base font-medium relative bg-black hover:bg-gray-900 border-black text-white"
                    onClick={() => handleSocialLogin('apple')}
                    disabled={loading !== null}
                  >
                    {loading === 'apple' ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <AppleIcon />
                        <span className="ml-3">Apple로 계속하기</span>
                      </>
                    )}
                  </Button>
                </motion.div>

                {/* Kakao */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    variant="outline"
                    className="w-full h-14 text-base font-medium relative border-0"
                    style={{ backgroundColor: '#FEE500', color: '#000000' }}
                    onClick={() => handleSocialLogin('kakao')}
                    disabled={loading !== null}
                  >
                    {loading === 'kakao' ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <KakaoIcon />
                        <span className="ml-3">카카오로 계속하기</span>
                      </>
                    )}
                  </Button>
                </motion.div>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-background text-muted-foreground">또는</span>
                  </div>
                </div>

                {/* Email Login/Signup Buttons */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-3"
                >
                  <Button
                    variant="outline"
                    className="w-full h-14 text-base font-medium"
                    onClick={() => setMode('login')}
                    disabled={loading !== null}
                  >
                    <Mail className="h-5 w-5 mr-3" />
                    이메일로 로그인
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full h-14 text-base font-medium"
                    onClick={() => setMode('signup')}
                    disabled={loading !== null}
                  >
                    <User className="h-5 w-5 mr-3" />
                    이메일로 회원가입
                  </Button>
                </motion.div>

                {/* Guest Login */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Button
                    variant="ghost"
                    className="w-full h-12 text-base font-medium text-muted-foreground hover:text-foreground"
                    onClick={handleGuestLogin}
                    disabled={loading !== null}
                  >
                    {loading === 'guest' ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <UserCircle className="h-5 w-5 mr-3" />
                        게스트로 계속하기
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </>
          )}

          {(mode === 'login' || mode === 'signup') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-base">이름</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="displayName"
                      type="text"
                      placeholder="홍길동"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className={`pl-10 h-12 text-base ${errors.displayName ? 'border-destructive' : ''}`}
                      disabled={loading !== null}
                    />
                  </div>
                  {errors.displayName && (
                    <p className="text-sm text-destructive">{errors.displayName}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-base">이메일</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`pl-10 h-12 text-base ${errors.email ? 'border-destructive' : ''}`}
                    disabled={loading !== null}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-base">비밀번호</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="최소 6자 이상"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pl-10 h-12 text-base ${errors.password ? 'border-destructive' : ''}`}
                    disabled={loading !== null}
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <Button
                className="w-full h-14 text-base font-medium"
                onClick={mode === 'login' ? handleEmailLogin : handleEmailSignup}
                disabled={loading !== null}
              >
                {(loading === 'email-login' || loading === 'email-signup') ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  mode === 'login' ? '로그인' : '회원가입'
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => {
                    setMode(mode === 'login' ? 'signup' : 'login');
                    resetForm();
                  }}
                  disabled={loading !== null}
                >
                  {mode === 'login' ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Terms */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-sm text-muted-foreground mt-8"
          >
            계속 진행하면{' '}
            <Link to="/terms" className="text-primary hover:underline">
              서비스 이용약관
            </Link>
            {' '}및{' '}
            <Link to="/privacy" className="text-primary hover:underline">
              개인정보 처리방침
            </Link>
            에 동의하게 됩니다.
          </motion.p>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="p-4 text-center space-y-2">
        <div className="flex items-center justify-center gap-4 text-sm">
          <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
            이용약관
          </Link>
          <span className="text-border">|</span>
          <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
            개인정보처리방침
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">
          © 2024 BioAge Insight. All rights reserved.
        </p>
      </div>
    </div>
  );
}
