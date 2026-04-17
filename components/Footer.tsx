
import React from 'react';
import { Instagram, MapPin, Database, ChevronLeft } from 'lucide-react';

interface FooterProps {
  onAdminClick?: () => void;
  isAdminMode?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ onAdminClick, isAdminMode }) => {
  const currentYear = new Date().getFullYear();
  const instagramUrl = "https://www.instagram.com/fairybakes?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==";

  return (
    <footer className="bg-stone-950 text-white py-24 px-6 md:px-12 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 border-b border-stone-800 pb-20">
        <div className="flex flex-col items-start">
          <div className="flex items-baseline space-x-1 mb-6">
            <span className="text-4xl font-serif tracking-[0.15em] uppercase text-white font-bold">
              Fairy
            </span>
            <span className="text-5xl font-signature text-rose-400 -ml-2 -rotate-6 transform translate-y-1">
              bakes
            </span>
          </div>
          <p className="text-stone-400 font-light leading-relaxed mb-8 max-w-sm">
            Crafting edible art for those who believe in magic. Based in Algiers, serving beauty one cake at a time.
          </p>
          <button 
            onClick={onAdminClick}
            className="flex items-center space-x-2 text-[10px] uppercase tracking-[0.3em] text-stone-600 hover:text-rose-400 transition-colors"
          >
            {isAdminMode ? (
              <>
                <ChevronLeft size={14} />
                <span>Return to Shop</span>
              </>
            ) : (
              <>
                <Database size={14} />
                <span>Database Access</span>
              </>
            )}
          </button>
        </div>
        
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold mb-8 text-stone-500">Contact</h4>
          <ul className="space-y-6">
            <li className="flex items-start space-x-4 text-stone-300">
              <MapPin size={22} className="text-rose-400 mt-1 flex-shrink-0" />
              <span className="font-light leading-relaxed">Algiers, Algeria</span>
            </li>
            <li className="flex items-center space-x-4 text-stone-300">
              <Instagram size={22} className="text-rose-400 flex-shrink-0" />
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="font-light hover:text-rose-400 transition-colors">@fairybakes</a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold mb-8 text-stone-500">Links</h4>
          <ul className="space-y-6 text-stone-300 uppercase tracking-[0.2em] text-[10px] font-medium">
            <li><a href="#gallery" className="hover:text-rose-400 transition-colors">The Garden</a></li>
            <li><a href="#order" className="hover:text-rose-400 transition-colors">Order Policy</a></li>
            <li><a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-rose-400 transition-colors">Follow us</a></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto pt-10 flex flex-col md:flex-row justify-between items-center text-stone-600 text-[9px] uppercase tracking-[0.5em]">
        <p>&copy; {currentYear} FAIRYBAKES STUDIO. ALL RIGHTS RESERVED.</p>
        <p className="mt-6 md:mt-0 italic font-signature text-2xl normal-case text-stone-400 tracking-normal opacity-60">"Where sugar meets soul."</p>
      </div>
    </footer>
  );
};