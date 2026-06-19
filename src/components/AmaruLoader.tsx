"use client";

type AmaruLoaderProps = {
  label?: string;
  fullScreen?: boolean;
  isLight?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: "h-14 w-14",
  md: "h-20 w-20",
  lg: "h-24 w-24 md:h-28 md:w-28",
};

export default function AmaruLoader({
  label,
  fullScreen = false,
  isLight = false,
  size = "md",
  className = "",
}: AmaruLoaderProps) {
  const background = isLight ? "bg-[#FAFAFA]" : "bg-[#010101]";
  const textColor = isLight ? "text-[#171716]" : "text-[#D8C9B6]";
  const shell = fullScreen ? `min-h-screen ${background}` : "";

  return (
    <div className={`flex flex-col items-center justify-center ${shell} ${className}`}>
      <style jsx>{`
        @keyframes amaru-breathe {
          0%,
          100% {
            transform: scale(0.96);
            opacity: 0.82;
          }
          50% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes amaru-shimmer {
          0% {
            transform: translateX(-150%) rotate(18deg);
          }
          48%,
          100% {
            transform: translateX(170%) rotate(18deg);
          }
        }

        @keyframes amaru-line {
          0%,
          100% {
            transform: scaleX(0.35);
            opacity: 0.4;
          }
          50% {
            transform: scaleX(1);
            opacity: 1;
          }
        }

        .amaru-loader-mark {
          animation: amaru-breathe 2.4s ease-in-out infinite;
          transform-origin: center;
        }

        .amaru-loader-shimmer {
          animation: amaru-shimmer 2.4s ease-in-out infinite;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(250, 250, 250, 0.08),
            rgba(216, 201, 182, 0.5),
            rgba(250, 250, 250, 0.08),
            transparent
          );
        }

        .amaru-loader-line {
          animation: amaru-line 2.4s ease-in-out infinite;
          transform-origin: center;
        }
      `}</style>

      <div className={`amaru-loader-mark relative ${sizeMap[size]} overflow-hidden`}>
        <img
          src="/images/brand/amaru-loader.png"
          alt=""
          className="h-full w-full object-contain"
          draggable={false}
        />
        <span className="amaru-loader-shimmer pointer-events-none absolute -inset-y-6 left-0 w-1/2" />
      </div>

      <div className="mt-6 h-px w-20 overflow-hidden bg-[#D8C9B6]/20">
        <div className="amaru-loader-line h-full w-full bg-[#D8C9B6]" />
      </div>

      {label && (
        <span className={`mt-5 text-center text-[10px] font-black uppercase tracking-[0.32em] ${textColor}`}>
          {label}
        </span>
      )}
    </div>
  );
}
