"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, Download } from "lucide-react";

interface GameData {
  title: string;
  downloadUrl?: string;
}

export default function DownloadPage({ params }: { params: { slug: string } }) {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Step 1: Initialize secure session (sets cookie)
  useEffect(() => {
    const initSession = async () => {
      try {
        const response = await fetch(`/api/games/download/${params.slug}/start`, {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error(`Failed to prepare download: ${response.statusText}`);
        }

        const data = (await response.json()) as GameData & { success: boolean };
        setGameData(data);
        setSessionReady(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to prepare download");
      } finally {
        setIsLoading(false);
      }
    };

    initSession();
  }, [params.slug]);

  // Step 2: Countdown timer
  useEffect(() => {
    if (sessionReady && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [sessionReady, countdown]);

  // Step 3: When countdown reaches 0, fetch the download URL and trigger download
  useEffect(() => {
    const triggerDownload = async () => {
      if (countdown === 0 && sessionReady && !isDownloading) {
        setIsDownloading(true);
        try {
          // Fetch the JSON response from /file
          const response = await fetch(`/api/games/download/${params.slug}/file`);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Download failed (${response.status})`);
          }

          const data = (await response.json()) as GameData & { downloadUrl: string };

          if (!data.downloadUrl) {
            throw new Error("No download URL received from server");
          }

          // Trigger download from the external URL using an invisible iframe
          const iframe = document.createElement("iframe");
          iframe.style.display = "none";
          iframe.src = data.downloadUrl;
          document.body.appendChild(iframe);

          // Clean up the iframe after a few seconds
          setTimeout(() => {
            iframe.remove();
          }, 5000);

          // Optionally update game title if not already set
          if (!gameData?.title && data.title) {
            setGameData((prev) => ({ ...prev, title: data.title }));
          }
        } catch (err) {
          console.error("Download error:", err);
          setError(err instanceof Error ? err.message : "Failed to start download");
        } finally {
          setIsDownloading(false);
        }
      }
    };

    triggerDownload();
  }, [countdown, sessionReady, params.slug, isDownloading, gameData?.title]);

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
          {isDownloading ? (
            <>
              <Loader2 className="h-12 w-12 mx-auto animate-spin text-g-purple mb-4" />
              <p className="text-g-muted">Fetching download link...</p>
            </>
          ) : (
            <>
              <p className="text-2xl text-green-400 mb-8 flex items-center gap-2 justify-center">
                <Download size={32} className="animate-bounce" />
                Download Started!
              </p>
              <p className="text-g-muted mb-8">
                If the download doesn't start automatically, click the button below.
              </p>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch(`/api/games/download/${params.slug}/file`);
                    const data = await res.json();
                    if (data.downloadUrl) {
                      const iframe = document.createElement("iframe");
                      iframe.style.display = "none";
                      iframe.src = data.downloadUrl;
                      document.body.appendChild(iframe);
                      setTimeout(() => iframe.remove(), 5000);
                    }
                  } catch (err) {
                    console.error(err);
                  }
                }}
                className="bg-g-purple hover:bg-g-purple-dark text-white font-bold py-4 px-8 rounded-xl text-lg flex items-center gap-3 shadow-lg hover:shadow-xl transition-all"
              >
                <Download size={24} />
                Download Manually
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
