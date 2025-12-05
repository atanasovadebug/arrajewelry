import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Sparkle {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
  rotation: number;
}

export function SparkleEffect() {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    // Generate initial sparkles
    const generateSparkles = () => {
      const newSparkles: Sparkle[] = [];
      for (let i = 0; i < 25; i++) {
        newSparkles.push({
          id: i,
          x: Math.random() * 100,
          delay: Math.random() * 8,
          duration: 6 + Math.random() * 6,
          size: 4 + Math.random() * 12,
          opacity: 0.3 + Math.random() * 0.5,
          rotation: Math.random() * 360,
        });
      }
      setSparkles(newSparkles);
    };

    generateSparkles();
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute"
          style={{
            left: `${sparkle.x}%`,
            width: sparkle.size,
            height: sparkle.size,
          }}
          initial={{ 
            y: -20, 
            opacity: 0,
            rotate: sparkle.rotation 
          }}
          animate={{
            y: ["0vh", "100vh"],
            opacity: [0, sparkle.opacity, sparkle.opacity, 0],
            rotate: [sparkle.rotation, sparkle.rotation + 180],
          }}
          transition={{
            duration: sparkle.duration,
            delay: sparkle.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {/* Diamond shape */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-full h-full"
            style={{
              filter: `drop-shadow(0 0 ${sparkle.size / 2}px hsl(36 45% 70% / 0.6))`,
            }}
          >
            <path
              d="M12 2L4 8L12 22L20 8L12 2Z"
              fill="url(#diamond-gradient)"
              stroke="hsl(36 45% 80%)"
              strokeWidth="0.5"
            />
            <path
              d="M4 8H20M12 2L8 8L12 22M12 2L16 8L12 22"
              stroke="hsl(36 45% 90% / 0.6)"
              strokeWidth="0.3"
            />
            <defs>
              <linearGradient id="diamond-gradient" x1="12" y1="2" x2="12" y2="22">
                <stop offset="0%" stopColor="hsl(36 20% 98%)" />
                <stop offset="30%" stopColor="hsl(36 30% 90%)" />
                <stop offset="70%" stopColor="hsl(36 40% 85%)" />
                <stop offset="100%" stopColor="hsl(36 45% 75%)" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      ))}

      {/* Additional sparkle points */}
      {sparkles.slice(0, 15).map((sparkle) => (
        <motion.div
          key={`point-${sparkle.id}`}
          className="absolute rounded-full bg-white"
          style={{
            left: `${(sparkle.x + 30) % 100}%`,
            width: sparkle.size / 3,
            height: sparkle.size / 3,
            boxShadow: `0 0 ${sparkle.size}px ${sparkle.size / 2}px hsl(36 50% 85% / 0.5)`,
          }}
          initial={{ 
            y: -10, 
            opacity: 0,
            scale: 0.5 
          }}
          animate={{
            y: ["0vh", "100vh"],
            opacity: [0, 0.8, 0.8, 0],
            scale: [0.5, 1, 1, 0.5],
          }}
          transition={{
            duration: sparkle.duration * 0.8,
            delay: sparkle.delay + 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* Glowing orbs for extra shimmer */}
      {sparkles.slice(0, 8).map((sparkle) => (
        <motion.div
          key={`glow-${sparkle.id}`}
          className="absolute"
          style={{
            left: `${(sparkle.x + 60) % 100}%`,
            width: sparkle.size * 2,
            height: sparkle.size * 2,
          }}
          initial={{ 
            y: -30, 
            opacity: 0 
          }}
          animate={{
            y: ["0vh", "100vh"],
            opacity: [0, 0.4, 0.4, 0],
          }}
          transition={{
            duration: sparkle.duration * 1.2,
            delay: sparkle.delay + 4,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div 
            className="w-full h-full rounded-full"
            style={{
              background: "radial-gradient(circle, hsl(36 50% 95% / 0.6) 0%, transparent 70%)",
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}
