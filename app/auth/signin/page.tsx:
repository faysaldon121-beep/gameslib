// app/auth/signin/page.tsx (minor fix: client signIn)
"use client";
import { signIn, getProviders } from 'next-auth/react';  // ✅ Client-side
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function SignInPage() {
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
        <p className="text-g-muted text-center mb-6 text-sm">Optional login for favorites & download history</p>
        
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
