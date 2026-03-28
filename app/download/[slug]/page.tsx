// app/download/[slug]/page.tsx

"use client"; // This page must be a Client Component

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

// This interface defines the shape of the data we expect from our API
interface GameDownloadData {
  title: string;
  downloadUrl: string;
}

export default function DownloadPage({ params }: { params: { slug: string } }) {
  const [gameData, setGameData] = useState<GameDownloadData | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch the secure download link from our API route
    fetch(`/api/games/download/${params.slug}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to find the game. (Status: ${res.status})`);
        }
        return res.json();
      })
      .then((data: GameDownloadData) => {
        setGameData(data);
      })
      .catch((err) => {
        setError(err.message || "An unknown error occurred.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [params.slug]);

  useEffect(() => {
    // Start countdown only when we have game data and the countdown is active
    if (gameData && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer); // Cleanup timer on unmount
    }
  }, [gameData, countdown]);

  useEffect(() => {
    // Trigger the download when countdown reaches 0
    if (countdown === 0 && gameData?.downloadUrl) {
      window.location.href = gameData.downloadUrl;
    }
  }, [countdown, gameData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-g-background text-white">
        <Loader2 className="animate-spin h-10 w-10 text-g-purple" />
        <span className="ml-4 text-xl">Preparing your download...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-g-background text-white text-center px-4">
        <h1 className="text-3xl font-bold text-red-500 mb-4">Error</h1>
        <p className="text-g-muted mb-8">{error}</p>
        <Link href="/" className="bg-g-purple hover:bg-g-purple-dark text-white font-bold py-2 px-4 rounded">
          Return to Homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-g-background text-white text-center px-4">
      <h1 className="text-4xl font-bold mb-4">{gameData?.title}</h1>
      {countdown > 0 ? (
        <>
          <p className="text-xl text-g-muted mb-2">Your download will begin in...</p>
          <div className="text-6xl font-extrabold text-g-purple mb-8">{countdown}</div>
          <Loader2 className="animate-spin h-8 w-8 text-g-muted" />
        </>
      ) : (
        <>
          <p className="text-xl text-green-400 mb-4">Your download has started!</p>
          <p className="text-sm text-g-muted">If it didn't start automatically, you can use the direct link below.</p>
          <a
            href={gameData?.downloadUrl}
            className="mt-6 bg-g-purple hover:bg-g-purple-dark text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Click here to download manually
          </a>
        </>
      )}
    </div>
  );
}
