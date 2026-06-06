import { useEffect, useRef } from "react";

interface BackgroundVideoProps {
  url: string;
}

export default function BackgroundVideo({ url }: BackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let animId: number;
    let timeoutId: any;

    const tick = () => {
      if (!video) return;
      
      const duration = video.duration;
      const current = video.currentTime;

      if (duration && !isNaN(duration)) {
        let op = 1.0;
        const FADE_TIME = 0.5; // 0.5 seconds

        if (current < FADE_TIME) {
          // Fade-in at early stage
          op = current / FADE_TIME;
        } else if (duration - current < FADE_TIME) {
          // Fade-out at tail stage
          op = Math.max(0, (duration - current) / FADE_TIME);
        }

        // Direct DOM update for top performance 60fps
        video.style.opacity = op.toString();
      }

      animId = requestAnimationFrame(tick);
    };

    const handleEnded = () => {
      // Verbatim specs: On ended, opacity resets to 0, waits 100ms, then replays from 0
      video.style.opacity = "0";
      video.pause();

      timeoutId = setTimeout(() => {
        if (video) {
          video.currentTime = 0;
          video.play().catch((err) => {
            console.log("Autoplay context check:", err);
          });
        }
      }, 100); // 100ms wait
    };

    // Initialize state
    video.style.opacity = "0";
    video.muted = true;
    video.playsInline = true;
    
    video.addEventListener("ended", handleEnded);
    
    // Auto initiate playback safely
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => console.log("Video auto play ready:", err));
    }

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(timeoutId);
      if (video) {
        video.removeEventListener("ended", handleEnded);
      }
    };
  }, [url]);

  return (
    <video
      ref={videoRef}
      src={url}
      className="absolute inset-0 w-full h-full object-cover transition-opacity duration-100 ease-linear"
      style={{ opacity: 0 }}
      muted
      playsInline
      loop={false} // Managed by JS loop onended
    />
  );
}
