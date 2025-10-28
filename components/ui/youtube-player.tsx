"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
    __youtubeIframeReadyQueue?: Array<() => void>;
  }
}

interface YouTubePlayerProps {
  videoId?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  containerClassName?: string;
  ariaLabel?: string;
}

export function YouTubePlayer({
  videoId,
  autoplay = true,
  muted = true,
  loop = true,
  containerClassName = "group relative aspect-video w-full max-h-[220px] sm:max-h-[260px] md:max-h-none overflow-hidden rounded-xl border border-gray-200 bg-gray-900 shadow-[0_8px_40px_-10px_rgba(0,0,0,0.25)] before:absolute before:-inset-4 before:rounded-xl before:bg-gradient-to-r before:from-indigo-500/20 before:to-purple-500/10 before:blur-2xl before:-z-10",
  ariaLabel = "Video player",
}: YouTubePlayerProps) {
  const ytPlayerRef = useRef<any>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!videoId) return;

    const initPlayer = () => {
      if (playerRef.current && !ytPlayerRef.current) {
        ytPlayerRef.current = new window.YT.Player(playerRef.current, {
          videoId,
          host: "https://www.youtube.com",
          playerVars: {
            autoplay: autoplay ? 1 : 0,
            mute: muted ? 1 : 0,
            controls: 1,
            loop: loop ? 1 : 0,
            playlist: loop ? videoId : undefined,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event: any) => {
              if (autoplay) {
                event.target.playVideo();
              }
            },
            onStateChange: (event: any) => {
              if (event.data === window.YT.PlayerState.ENDED && loop) {
                event.target.playVideo();
              }
            },
          },
        });
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      if (!window.__youtubeIframeReadyQueue) {
        window.__youtubeIframeReadyQueue = [];
      }

      window.__youtubeIframeReadyQueue.push(initPlayer);

      if (!window.onYouTubeIframeAPIReady) {
        const existingScript = document.querySelector(
          'script[src*="youtube.com/iframe_api"]'
        );

        if (!existingScript) {
          const tag = document.createElement("script");
          tag.src = "https://www.youtube.com/iframe_api";
          const firstScriptTag = document.getElementsByTagName("script")[0];
          firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        }

        window.onYouTubeIframeAPIReady = () => {
          window.__youtubeIframeReadyQueue?.forEach((callback) => callback());
        };
      }
    }

    return () => {
      if (window.__youtubeIframeReadyQueue) {
        const index = window.__youtubeIframeReadyQueue.indexOf(initPlayer);
        if (index > -1) {
          window.__youtubeIframeReadyQueue.splice(index, 1);
        }
      }

      if (ytPlayerRef.current) {
        ytPlayerRef.current.destroy();
        ytPlayerRef.current = null;
      }
    };
  }, [videoId, autoplay, muted, loop]);

  return (
    <div className={containerClassName} role="region" aria-label={ariaLabel}>
      {videoId ? (
        <div ref={playerRef} className="absolute inset-0 h-full w-full" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="text-center px-4">
            <div className="mb-4">
              <svg
                className="w-16 h-16 mx-auto text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-300 mb-1">
              וידאו לא זמין
            </p>
            <p className="text-sm text-gray-500">הווידאו לא הוגדר</p>
          </div>
        </div>
      )}
    </div>
  );
}
