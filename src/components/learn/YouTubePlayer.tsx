import React, { useEffect, useRef, useState } from "react";

// Global declaration for YouTube IFrame API
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YouTubePlayerProps {
  videoId: string;
  onReady?: (player: any) => void;
  onPlay?: (player: any) => void;
  onPause?: (player: any) => void;
  onEnd?: (player: any) => void;
  onProgress?: (progressInfo: { currentTime: number; duration: number; percent: number }, player: any) => void;
  initialTime?: number;
}

export function YouTubePlayer({
  videoId,
  onReady,
  onPlay,
  onPause,
  onEnd,
  onProgress,
  initialTime
}: YouTubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [isApiReady, setIsApiReady] = useState(false);
  const progressIntervalRef = useRef<any>(null);

  useEffect(() => {
    // Load YouTube API if not already loaded
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }

      window.onYouTubeIframeAPIReady = () => {
        setIsApiReady(true);
      };
    } else {
      setIsApiReady(true);
    }

    return () => {
      // Cleanup interval on unmount
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isApiReady && videoId && containerRef.current) {
      // Destroy existing player if present
      if (playerRef.current) {
        playerRef.current.destroy();
      }

      // Initialize new player
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          rel: 0,
          modestbranding: 1,
          start: initialTime ? Math.floor(initialTime) : 0,
        },
        events: {
          onReady: (event: any) => {
            if (onReady) onReady(event.target);
          },
          onStateChange: (event: any) => {
            const player = event.target;
            
            // Handle Play
            if (event.data === window.YT.PlayerState.PLAYING) {
              if (onPlay) onPlay(player);
              
              // Start progress polling
              if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
              progressIntervalRef.current = setInterval(() => {
                if (onProgress && player.getCurrentTime && player.getDuration) {
                  const currentTime = player.getCurrentTime();
                  const duration = player.getDuration();
                  const percent = (currentTime / duration) * 100;
                  onProgress({ currentTime, duration, percent }, player);
                }
              }, 1000);
            }
            
            // Handle Pause
            if (event.data === window.YT.PlayerState.PAUSED) {
              if (onPause) onPause(player);
              if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            }
            
            // Handle End
            if (event.data === window.YT.PlayerState.ENDED) {
              if (onEnd) onEnd(player);
              if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            }
          }
        }
      });
    }

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [isApiReady, videoId]);

  return (
    <div className="w-full h-full">
      <div ref={containerRef} className="w-full h-full border-0" />
    </div>
  );
}
