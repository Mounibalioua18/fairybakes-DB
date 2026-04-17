
import React from 'react';

export const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 custom-glass border-b border-rose-100/30 h-24 flex items-center justify-center md:justify-between px-6 md:px-12 transition-all duration-500">
      <div className="flex flex-col items-center md:items-start group cursor-default">
        <div className="flex items-baseline space-x-1">
          <span className="text-2xl md:text-3xl font-serif tracking-[0.15em] uppercase text-stone-800 font-bold">
            Fairy
          </span>
          <span className="text-3xl md:text-4xl font-signature text-rose-400 -ml-2 -rotate-6 transform translate-y-1">
            bakes
          </span>
        </div>
      </div>
      
      <div className="hidden md:flex space-x-6 md:space-x-12 text-[9px] md:text-[11px] uppercase tracking-[0.2em] md:tracking-[0.3em] font-semibold text-stone-500">
        <a href="#gallery" className="hover:text-rose-400 transition-all hover:tracking-[0.4em]">The Garden</a>
        <a href="#order" className="hover:text-rose-400 transition-all hover:tracking-[0.4em]">Reserve your date</a>
      </div>
    </nav>
  );
};