"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

const INTRO_STORAGE_KEY = "amaru_intro_seen";

export default function IntroGate() {
  const [isReady, setIsReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isGone, setIsGone] = useState(false);

  const openIntro = useCallback(() => {
    if (isOpen) return;
    setIsOpen(true);
    sessionStorage.setItem(INTRO_STORAGE_KEY, "true");
    window.setTimeout(() => setIsGone(true), 3200);
  }, [isOpen]);

  useEffect(() => {
    if (sessionStorage.getItem(INTRO_STORAGE_KEY) === "true") {
      setIsGone(true);
    }
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady || isGone) return;

    const autoOpenTimer = window.setTimeout(openIntro, 3000);

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 8) return;
      event.preventDefault();
      openIntro();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (["Enter", " ", "ArrowDown", "PageDown"].includes(event.key)) {
        event.preventDefault();
        openIntro();
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0]?.clientY ?? 0;
    };

    const handleTouchMove = (event: TouchEvent) => {
      const currentY = event.touches[0]?.clientY ?? touchStartY;
      if (touchStartY - currentY > 18) {
        event.preventDefault();
        openIntro();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.clearTimeout(autoOpenTimer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [isReady, isGone, openIntro]);

  if (!isReady || isGone) return null;

  return (
    <button
      type="button"
      aria-label="Entrer sur le site Amaru Homes"
      onClick={openIntro}
      className={`fixed inset-0 z-[999] block h-screen w-screen cursor-pointer overflow-hidden bg-transparent text-white ${
        isOpen ? "pointer-events-none" : ""
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute left-0 top-0 h-full w-[50.2vw] origin-left bg-black shadow-2xl transition-transform duration-[3000ms] ease-[cubic-bezier(0.83,0,0.17,1)] motion-reduce:duration-200 ${
          isOpen ? "-translate-x-full" : "translate-x-0"
        }`}
      />
      <span
        aria-hidden="true"
        className={`absolute right-0 top-0 h-full w-[50.2vw] origin-right bg-black shadow-2xl transition-transform duration-[3000ms] ease-[cubic-bezier(0.83,0,0.17,1)] motion-reduce:duration-200 ${
          isOpen ? "translate-x-full" : "translate-x-0"
        }`}
      />

      <span
        className={`relative z-10 flex h-full w-full items-center justify-center transition-all duration-[1200ms] motion-reduce:duration-200 ${
          isOpen ? "scale-90 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        <Image
          src="/amaru-intro-logo.png"
          alt="Amaru Homes"
          width={640}
          height={640}
          priority
          className="h-auto w-[min(58vw,560px)] max-w-[82vw] object-contain"
        />
      </span>

      <span className="sr-only">Cliquez ou faites defiler pour ouvrir le site.</span>
    </button>
  );
}
