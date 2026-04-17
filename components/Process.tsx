
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Calendar, Heart, Palette } from 'lucide-react';

const STEPS = [
  {
    icon: Calendar,
    title: 'Monthly Selection',
    description: 'Orders open towards the end of each month for the upcoming month. Slots are limited to ensure artful precision.'
  },
  {
    icon: Palette,
    title: 'The Design Consultation',
    description: 'We discuss your vision, color palettes, and floral preferences to create a truly one-of-a-kind center-piece.'
  },
  {
    icon: Heart,
    title: 'Handcrafted With Love',
    description: 'Premium ingredients sourced locally and prepared fresh. Our signature buttercream is light, silky, and balanced.'
  }
];

export const Process: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 70%',
      }
    });

    tl.fromTo('.process-step',
      { x: -50, opacity: 0 },
      { x: 0, opacity: 1, duration: 1.5, ease: 'expo.out', stagger: 0.3 }
    )
    .fromTo('.process-image',
      { scale: 0.8, opacity: 0, rotate: -5 },
      { scale: 1, opacity: 1, rotate: 0, duration: 2, ease: 'power4.out' },
      "-=1.5"
    );
  }, []);

  return (
    <section id="process" className="py-24 bg-stone-50 px-6 md:px-12 overflow-hidden">
      <div className="max-w-7xl mx-auto" ref={containerRef}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-rose-400 uppercase tracking-[0.3em] text-xs font-semibold mb-4 block">The Fairy Way</span>
            <h2 className="text-4xl md:text-5xl font-serif text-stone-900 mb-12">How We Fairy Bake</h2>
            <div className="space-y-12">
              {STEPS.map((step, index) => (
                <div key={index} className="process-step flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 shadow-inner">
                    <step.icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-stone-800 mb-2">{step.title}</h3>
                    <p className="text-stone-500 leading-relaxed font-light">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <img 
                src="https://i.imgur.com/JEliXn0.jpg" 
                className="process-image rounded-2xl shadow-2xl mt-12 w-full aspect-[3/4] object-cover"
                alt="Artisan cake preparation"
              />
              <img 
                src="https://i.imgur.com/RFffE8J.jpg" 
                className="process-image rounded-2xl shadow-2xl w-full aspect-[3/4] object-cover"
                alt="Detailed cake decoration"
              />
            </div>
            {/* Soft decorative glow background */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-rose-200/20 rounded-full blur-[100px]"></div>
          </div>
        </div>
      </div>
    </section>
  );
};
