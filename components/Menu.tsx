
import React from 'react';
import { Info, Truck, Wallet, Clock } from 'lucide-react';

const PRICES = [
  { flavor: 'Vanille', price: '5000da' },
  { flavor: 'Chocolat', price: '5500da' },
  { flavor: 'Vanille Fraise', price: '6500da' },
  { flavor: 'Pistache Framboise', price: '6000da' },
];

export const Menu: React.FC = () => {
  return (
    <section id="menu" className="py-24 px-6 md:px-12 bg-white border-y border-stone-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <span className="font-signature text-3xl text-rose-300 block mb-2">la carte</span>
          <h2 className="text-4xl md:text-5xl font-serif text-stone-900 mb-4">Availability & Pricing</h2>
          <p className="text-stone-400 uppercase tracking-widest text-[10px]">Base prices for 15cm (5-10 parts)</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20">
          {/* Birthdays */}
          <div className="p-10 rounded-[2rem] bg-rose-50/50 border border-rose-100">
            <h3 className="text-2xl font-serif mb-6 text-stone-800">Anniversaires</h3>
            <ul className="space-y-4 text-stone-600 font-light">
              <li className="flex justify-between items-center border-b border-rose-100 pb-2">
                <span>Shapes</span>
                <span className="font-medium text-stone-900 italic">Round or Heart</span>
              </li>
              <li className="flex justify-between items-center border-b border-rose-100 pb-2">
                <span>Standard Sizes</span>
                <span className="font-medium text-stone-900 italic">12, 15, 20cm</span>
              </li>
              <li className="pt-4 text-xs italic opacity-70">
                * Price varies based on dimensions, flavor, and complex decoration.
              </li>
            </ul>
          </div>

          {/* Pricing List */}
          <div className="p-10 rounded-[2rem] bg-stone-900 text-white shadow-2xl scale-105 relative z-10">
            <h3 className="text-2xl font-serif mb-8 text-rose-200">Base Menu (15cm)</h3>
            <div className="space-y-6">
              {PRICES.map((item, i) => (
                <div key={i} className="flex justify-between items-center border-b border-white/10 pb-3">
                  <span className="font-light tracking-wide">{item.flavor}</span>
                  <span className="font-serif text-xl text-rose-100">{item.price}</span>
                </div>
              ))}
            </div>
            <p className="mt-8 text-[10px] uppercase tracking-widest text-white/40 leading-relaxed">
              Price may vary depending on decoration and extra supplements.
            </p>
          </div>

          {/* Weddings */}
          <div className="p-10 rounded-[2rem] bg-rose-50/50 border border-rose-100">
            <h3 className="text-2xl font-serif mb-6 text-stone-800">Fiançailles & Mariages</h3>
            <p className="text-rose-400 text-xs uppercase tracking-widest mb-4 font-bold">Vintage / Italian Style</p>
            <ul className="space-y-4 text-stone-600 font-light">
              <li className="flex justify-between items-center border-b border-rose-100 pb-2">
                <span>Round</span>
                <span className="font-medium text-stone-900 italic">Up to 50cm</span>
              </li>
              <li className="flex justify-between items-center border-b border-rose-100 pb-2">
                <span>Rectangle</span>
                <span className="font-medium text-stone-900 italic">Custom dimensions</span>
              </li>
              <li className="pt-4 text-xs italic opacity-70">
                * Custom quote provided following design consultation.
              </li>
            </ul>
          </div>
        </div>

        {/* Policies */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-start space-x-4">
            <Clock className="text-rose-400 shrink-0" size={20} />
            <div>
              <h4 className="text-xs uppercase font-bold tracking-widest mb-2">When?</h4>
              <p className="text-xs text-stone-500 leading-relaxed">Orders open once a month. All dates must be reserved in advance.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <Wallet className="text-rose-400 shrink-0" size={20} />
            <div>
              <h4 className="text-xs uppercase font-bold tracking-widest mb-2">Payment</h4>
              <p className="text-xs text-stone-500 leading-relaxed">50% deposit required via Baridimob or CCP within 48h to confirm.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <Truck className="text-rose-400 shrink-0" size={20} />
            <div>
              <h4 className="text-xs uppercase font-bold tracking-widest mb-2">Delivery</h4>
              <p className="text-xs text-stone-500 leading-relaxed">Available in Algiers (Alger) only. Delivery fees apply.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <Info className="text-rose-400 shrink-0" size={20} />
            <div>
              <h4 className="text-xs uppercase font-bold tracking-widest mb-2">Questions?</h4>
              <p className="text-xs text-stone-500 leading-relaxed">Contact us via Instagram message for any specific inquiries.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
