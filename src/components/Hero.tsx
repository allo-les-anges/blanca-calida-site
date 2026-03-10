"use client";

export default function Hero() {
  return (
    /* Changement de h-[90vh] à h-screen (ou h-[100vh]) */
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">
      <video 
        key="hero-video-fixed" 
        autoPlay 
        muted 
        loop 
        playsInline 
        /* absolute inset-0 garantit que la vidéo colle aux bords */
        className="absolute inset-0 w-full h-full object-cover brightness-[0.5]"
      >
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>

      <div className="relative z-10 text-center px-4">
        <h1 className="text-white text-4xl md:text-7xl font-serif mb-6 tracking-tight leading-tight">
          Villas de Luxe & <br/> Propriétés d'Exception
        </h1>
        <p className="text-white/80 text-sm md:text-base uppercase tracking-[0.4em] font-light">
          COSTA BLANCA | COSTA DEL SOL
        </p>
      </div>
    </section>
  );
}