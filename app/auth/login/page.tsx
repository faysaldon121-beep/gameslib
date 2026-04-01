// app/auth/login/page.tsx
"use client";
import { signIn, getProviders } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';

// Loading component
function SignInLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-g-background p-8">
      <div className="bg-g-card p-8 rounded-2xl shadow-2xl max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-8 text-white">GamesLib</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-g-muted/20 rounded-xl"></div>
          <div className="h-12 bg-g-muted/20 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}

// Actual sign-in component that uses useSearchParams
function SignInContent() {
  const [providers, setProviders] = useState<Record<string, any>>({});
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  useEffect(() => {
    (async () => {
      const res = await getProviders();
      if (res) setProviders(res);
    })();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-g-background p-8">
      <div className="bg-g-card p-8 rounded-2xl shadow-2xl max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-8 text-white">GamesLib</h1>
        <p className="text-g-muted text-center mb-6 text-sm">
          Optional login for favorites & download history
        </p>
        
        <div className="space-y-3">
          {Object.values(providers).map((provider: any) => (
            <button
              key={provider.id}
              onClick={() => signIn(provider.id, { callbackUrl })}
              className="w-full bg-g-purple hover:bg-g-purple-dark text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
            >
              {provider.id === 'google' ? '🟢 Continue with Google' : '📧 Email & Password'}
            </button>
          ))}
        </div>
        
        <div className="text-center mt-6 pt-6 border-t border-g-muted/30">
          <Link href="/auth/register" className="text-g-muted hover:text-white font-medium">
            Create new account →
          </Link>
        </div>
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function SignInPage() {
  return (
    <Suspense fallback={<SignInLoading />}>
      <SignInContent />
    </Suspense>
  );
}
