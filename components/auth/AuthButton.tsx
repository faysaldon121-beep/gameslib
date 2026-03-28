// components/auth/AuthButton.tsx
"use client";
import { useSession, signIn, signOut } from 'next-auth/react';
import { User, LogIn, LogOut } from 'lucide-react';

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2 text-g-muted text-sm">
        <div className="w-4 h-4 animate-spin border border-g-purple border-t-transparent rounded-full"></div>
        Loading...
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {session ? (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-g-card-alpha px-3 py-2 rounded-lg">
            <User size={16} className="text-g-purple" />
            <span className="text-white text-sm font-medium">
              {session.user?.name?.split(' ')[0] || session.user?.email?.split('@')[0]}
            </span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-2 text-g-muted hover:text-white text-sm transition-colors"
            title="Sign Out"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      ) : (
        <button
          onClick={() => signIn()}
          className="flex items-center gap-2 bg-g-purple hover:bg-g-purple-dark text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
        >
          <LogIn size={16} />
          Sign In
        </button>
      )}
    </div>
  );
}
