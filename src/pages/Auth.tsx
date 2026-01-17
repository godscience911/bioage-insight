import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Sparkles } from 'lucide-react';

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

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (user && !authLoading) {
      navigate(from, { replace: true });
    }
  }, [user, authLoading, navigate, from]);

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
      console.error(`${provider} login error:`, error);
      toast({
        title: '로그인 실패',
        description: error.message || '로그인 중 오류가 발생했습니다. 다시 시도해주세요.',
        variant: 'destructive',
      });
      setLoading(null);
    }
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
          onClick={() => navigate('/')}
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
              소셜 계정으로 간편하게 시작하세요
            </p>
          </div>

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
          </div>

          {/* Terms */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-sm text-muted-foreground mt-8"
          >
            계속 진행하면{' '}
            <a href="#" className="text-primary hover:underline">
              서비스 이용약관
            </a>
            {' '}및{' '}
            <a href="#" className="text-primary hover:underline">
              개인정보 처리방침
            </a>
            에 동의하게 됩니다.
          </motion.p>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="p-4 text-center text-sm text-muted-foreground">
        © 2024 BioAge Insight. All rights reserved.
      </div>
    </div>
  );
}
