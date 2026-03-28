// app/download/[slug]/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, Download } from "lucide-react";

interface GameData {
  title: string;
}

export default function DownloadPage({ params }: { params: { slug: string } }) {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    // Step 1: Init secure session via API (sets HttpOnly cookie)
    const initSession = async () => {
      try {
        const response = await fetch(`/api/games/download/${params.slug}/start`, {
          method: 'POST',
        });

        if (!response.ok) {
          throw new Error(`Failed to prepare download: ${response.statusText}`);
        }

        const data = await response.json() as GameData & { success: boolean };
        setGameData(data);
        setSessionReady(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to prepare download');
      } finally {
        setIsLoading(false);
      }
    };

    initSession();
  }, [params.slug]);

  useEffect(() => {
    if (sessionReady && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [sessionReady, countdown]);

  useEffect(() => {
    // Step 2: After countdown, trigger proxy download
    if (countdown === 0 && sessionReady) {
      window.location.href = `/api/games/download/${params.slug}/file`;
    }
  }, [countdown, sessionReady, params.slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-g-background text-white p-8">
        <Loader2 className="h-12 w-12 animate-spin text-g-purple mr-4" />
        <div>
          <h2 className="text-2xl font-bold mb-2">Preparing Secure Download...</h2>
          <p className="text-g-muted">Setting up your session (expires in 1 hour).</p>
        </div>
      </div>
    );
  }

  if (error || !gameData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-g-background text-white p-8 text-center">
        <h1 className="text-3xl font-bold text-red-400 mb-4">Download Error</h1>
        <p className="text-g-muted mb-8 max-w-md">{error}</p>
        <Link 
          href={`/games/${params.slug}`} 
          className="bg-g-purple hover:bg-g-purple-dark text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2"
        >
          <Download size={20} />
          Try Again
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-g-background text-white p-8 text-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-g-purple to-g-purple-dark bg-clip-text text-transparent">
        {gameData.title}
      </h1>
      
      {countdown > 0 ? (
        <>
          <p className="text-xl text-g-muted mb-4">Your secure download will begin in...</p>
          <div className="text-6xl md:text-7xl font-black text-g-purple mb-8 animate-pulse">
            {countdown}
          </div>
          <Loader2 className="h-12 w-12 mx-auto animate-spin text-g-purple mb-4" />
          <p className="text-sm text-g-muted">Session expires in 1 hour • Single-use only</p>
        </>
      ) : (
        <>
          <p className="text-2xl text-green-400 mb-8 flex items-center gap-2 justify-center">
            <Download size={32} className="animate-bounce" />
            Download Started!
          </p>
          <p className="text-g-muted mb-8">If it didn't start, click below (session expires soon).</p>
          <a
            href={`/api/games/download/${params.slug}/file`}
            className="bg-g-purple hover:bg-g-purple-dark text-white font-bold py-4 px-8 rounded-xl text-lg flex items-center gap-3 shadow-lg hover:shadow-xl transition-all"
          >
            <Download size={24} />
            Download Manually
          </a>
        </>
      )}
    </div>
  );
}
