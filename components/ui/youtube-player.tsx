"use client";

import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YouTubePlayerProps {
  videoId?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  showControls?: boolean;
  containerClassName?: string;
  ariaLabel?: string;
  onReady?: (player: any) => void;
  onStateChange?: (state: number) => void;
}

export function YouTubePlayer({
  videoId,
  autoplay = true,
  muted = true,
  loop = true,
  showControls = true,
  containerClassName = "group relative aspect-video w-full max-h-[220px] sm:max-h-[260px] md:max-h-none overflow-hidden rounded-xl border border-gray-200 bg-gray-900 shadow-[0_8px_40px_-10px_rgba(0,0,0,0.25)] before:absolute before:-inset-4 before:rounded-xl before:bg-gradient-to-r before:from-indigo-500/20 before:to-purple-500/10 before:blur-2xl before:-z-10",
  ariaLabel = "Video player",
  onReady,
  onStateChange,
}: YouTubePlayerProps) {
  const ytPlayerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isMuted, setIsMuted] = useState(muted);
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!videoId) return;

    const initPlayer = () => {
      if (playerRef.current && !ytPlayerRef.current) {
        ytPlayerRef.current = new window.YT.Player(playerRef.current, {
          videoId,
          host: "https://www.youtube-nocookie.com",
          playerVars: {
            autoplay: autoplay ? 1 : 0,
            mute: muted ? 1 : 0,
            controls: 0,
            loop: loop ? 1 : 0,
            playlist: loop ? videoId : undefined,
            rel: 0,
            showinfo: 0,
            modestbranding: 1,
            playsinline: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event: any) => {
              if (autoplay) {
                event.target.playVideo();
              }
              onReady?.(event.target);
            },
            onStateChange: (event: any) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
              } else if (event.data === window.YT.PlayerState.PAUSED) {
                setIsPlaying(false);
              } else if (event.data === window.YT.PlayerState.ENDED && loop) {
                event.target.playVideo();
              }
              onStateChange?.(event.data);
            },
          },
        });
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
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
        initPlayer();
      };
    }

    return () => {
      if (ytPlayerRef.current) {
        ytPlayerRef.current.destroy();
        ytPlayerRef.current = null;
      }
    };
  }, [videoId, autoplay, muted, loop, onReady, onStateChange]);

  const togglePlayPause = () => {
    if (!ytPlayerRef.current) return;

    if (isPlaying) {
      ytPlayerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      ytPlayerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!ytPlayerRef.current) return;

    if (isMuted) {
      ytPlayerRef.current.unMute();
      setIsMuted(false);
    } else {
      ytPlayerRef.current.mute();
      setIsMuted(true);
    }
  };

  return (
    <div className={containerClassName}>
      {videoId ? (
        <>
          <div
            ref={playerRef}
            className="absolute inset-0 h-full w-full"
            role="img"
            aria-label={ariaLabel}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          {showControls && (
            <>
              <button
                onClick={togglePlayPause}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center h-14 w-14 rounded-full bg-white/80 ring-1 ring-purple-500/30 backdrop-blur-sm shadow-lg hover:bg-white transition-all duration-200 opacity-0 group-hover:opacity-100 pointer-events-auto cursor-pointer"
                aria-label={isPlaying ? "השהה וידאו" : "נגן וידאו"}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5 text-gray-900" />
                ) : (
                  <Play className="h-5 w-5 text-gray-900 ml-0.5" />
                )}
              </button>

              <button
                onClick={toggleMute}
                className="absolute bottom-3 right-3 flex items-center justify-center h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white transition-all duration-200 pointer-events-auto cursor-pointer"
                aria-label={isMuted ? "בטל השתקה" : "השתק"}
              >
                {isMuted ? (
                  <VolumeX className="h-3.5 w-3.5 text-gray-700" />
                ) : (
                  <Volume2 className="h-3.5 w-3.5 text-gray-900" />
                )}
              </button>
            </>
          )}
        </>
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
