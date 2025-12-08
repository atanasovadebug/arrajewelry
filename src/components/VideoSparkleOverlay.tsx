import { useEffect, useRef } from "react";

export function VideoSparkleOverlay() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.7;
    }
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-40"
        style={{ filter: "contrast(1.2) brightness(1.3)" }}
      >
        <source
          src="https://cdn.pixabay.com/video/2023/10/02/183279-870457579_large.mp4"
          type="video/mp4"
        />
      </video>
    </div>
  );
}
