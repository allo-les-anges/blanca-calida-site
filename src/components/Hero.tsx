"use client";

export default function Hero() {
  return (
    <section className="relative h-[90vh] w-full flex items-center justify-center overflow-hidden">
      <video 
        key="hero-video-fixed" 
        autoPlay 
        muted 
        loop 
        playsInline 
        className="absolute inset-0 w-full h-full object-cover brightness-[0.5]"
      >
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>

      <div className="relative z-10 text-center px-4">
        <h1 className="text-white text-4xl md:text-7xl font-serif mb-6 tracking-tight leading-tight">
          Villas de Luxe & <br/> Propriétés d'Exception
        </h1>
        <p className="text-white/80 text-sm md:text-base uppercase tracking-[0.4em] font-light">
          COSTA BLANCA | ALICANTE | VALENCIA
        </p>
      </div>
    </section>
  );
}