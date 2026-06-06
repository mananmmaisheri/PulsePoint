import { useEffect, useState } from "react";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    // Check if device supports fine pointers (mice)
    const mediaQuery = window.matchMedia("(pointer: fine)");
    setIsMobile(!mediaQuery.matches);

    const handleResize = () => {
      setIsMobile(!mediaQuery.matches);
    };

    mediaQuery.addEventListener("change", handleResize);

    const moveMouse = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const detectHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "BUTTON" ||
          target.tagName === "A" ||
          target.closest("button") ||
          target.closest("a") ||
          target.classList.contains("interactive-hover"))
      ) {
        setHovering(true);
      } else {
        setHovering(false);
      }
    };

    if (mediaQuery.matches) {
      window.addEventListener("mousemove", moveMouse);
      window.addEventListener("mouseover", detectHover);
    }

    return () => {
      mediaQuery.removeEventListener("change", handleResize);
      window.removeEventListener("mousemove", moveMouse);
      window.removeEventListener("mouseover", detectHover);
    };
  }, []);

  if (isMobile) return null;

  return (
    <>
      {/* Outer Glow tracker */}
      <div
        className="pointer-events-none fixed top-0 left-0 z-50 -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-500/40 bg-violet-500/5 transition-all duration-300 ease-out"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: hovering ? "52px" : "28px",
          height: hovering ? "52px" : "28px",
          boxShadow: hovering
            ? "0 0 20px rgba(139, 92, 246, 0.4)"
            : "0 0 8px rgba(139, 92, 246, 0.1)",
        }}
      />
      {/* Inner precise dot */}
      <div
        className="pointer-events-none fixed top-0 left-0 z-50 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-400 mix-blend-screen transition-transform duration-100 ease-out"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: `translate(-50%, -50%) scale(${hovering ? 1.5 : 1})`,
        }}
      />
    </>
  );
}
