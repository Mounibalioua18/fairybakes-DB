import React, { useState, useRef } from 'react';
import { Send, CheckCircle2, AlertCircle, Info, Upload, X } from 'lucide-react';
import { FormStatus, CakeOrder } from '../types';
import { supabase } from '../lib/supabase';

export const OrderForm: React.FC = () => {
  const [status, setStatus] = useState<FormStatus>(FormStatus.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch form status setting
  React.useEffect(() => {
    const fetchFormStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('portfolio')
          .select('description')
          .eq('title', 'SYSTEM_SETTING_ORDER_FORM')
          .maybeSingle();

        // Debug log to ensure fetching works properly
        console.log('Fetched Form Status:', data?.description);
        
        if (data && data.description === 'false') {
          setIsFormOpen(false);
        } else {
          setIsFormOpen(true);
        }
      } catch (err) {
        console.log('Using default form setting due to error', err);
      }
    };
    fetchFormStatus();
  }, []);

  // Calculate next month's boundaries
  const now = new Date();
  const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const lastDayNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
  
  const monthName = nextMonthDate.toLocaleString('default', { month: 'long' });
  const year = nextMonthDate.getFullYear();
  
  const minDate = nextMonthDate.toISOString().split('T')[0];
  const maxDate = lastDayNextMonth.toISOString().split('T')[0];

  const [formData, setFormData] = useState<CakeOrder>({
    customerName: '',
    phoneNumber: '',
    instagramHandle: '',
    eventDate: minDate,
    cakeSize: '15cm',
    flavor: 'Vanille',
    inspiration: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(FormStatus.SUBMITTING);
    setErrorMessage(null);

    try {
      let finalFileUrl: string | null = null;

      // 1. Upload Image to Storage if exists
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('inspirations')
          .upload(filePath, selectedFile);
          
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('inspirations')
          .getPublicUrl(filePath);

        finalFileUrl = publicUrl;
      }

      // 2. Create the main Order Document
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            customer_name: formData.customerName,
            phone_number: formData.phoneNumber,
            instagram_handle: formData.instagramHandle,
            event_date: formData.eventDate,
            cake_size: formData.cakeSize,
            flavor: formData.flavor,
            inspiration_image_url: finalFileUrl
          }
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      setStatus(FormStatus.SUCCESS);
      setPreviewUrl(null);
      setSelectedFile(null);
      setFormData({
        customerName: '',
        phoneNumber: '',
        instagramHandle: '',
        eventDate: minDate,
        cakeSize: '15cm',
        flavor: 'Vanille',
        inspiration: ''
      });
    } catch (error: any) {
      console.error('Supabase error:', error);
      setStatus(FormStatus.ERROR);
      setErrorMessage(error.message || 'Something went wrong. Please check your connection.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        alert("File is too large. Max 50MB.");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDateClick = (e: React.MouseEvent<HTMLInputElement>) => {
    try {
      if ('showPicker' in e.currentTarget) {
        (e.currentTarget as any).showPicker();
      }
    } catch (error) {
      console.debug('Native picker not supported');
    }
  };

  return (
    <section id="order" className="py-24 px-6 md:px-12 bg-white scroll-mt-24 relative">
      {/* Success Modal */}
      {status === FormStatus.SUCCESS && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-2xl text-center max-w-xl w-full flex flex-col items-center animate-in zoom-in-95 duration-300">
            <CheckCircle2 className="w-20 h-20 text-green-400 mb-6" />
            <h2 className="text-3xl md:text-4xl font-serif mb-4 text-stone-900">Commande Reçue !</h2>
            <p className="text-stone-500 mb-8 leading-relaxed">
              Merci de votre confiance. Nous vous contacterons via Instagram sous 48 heures pour confirmer votre créneau pour {monthName} et discuter des détails.
            </p>
            <button 
              onClick={() => setStatus(FormStatus.IDLE)}
              className="bg-stone-900 text-white px-8 py-4 rounded-xl font-medium tracking-[0.2em] uppercase text-xs hover:bg-rose-400 transition-colors w-full"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <h2 className="text-4xl md:text-6xl font-serif text-stone-900 mb-6">Créneaux de Réservation</h2>
            <div className="inline-flex items-center space-x-2 bg-stone-900 text-white px-4 py-2 rounded-full text-xs uppercase tracking-widest mb-8">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span>Commandes ouvertes pour {monthName} {year}</span>
            </div>
            <p className="text-stone-500 text-lg mb-8 leading-relaxed font-light">
              Nous recueillons les commandes une fois par mois. Cela nous permet de sélectionner les fleurs de saison les plus fraîches et de planifier méticuleusement chaque design.
            </p>
            <div className="space-y-6">
              <div className="flex items-start space-x-4 p-6 bg-rose-50 rounded-2xl border border-rose-100">
                <AlertCircle className="text-rose-400 flex-shrink-0" size={24} />
                <p className="text-sm text-stone-600 leading-relaxed italic">
                  Note : Un acompte de 50% via Baridimob ou CCP est requis sous 48h pour bloquer votre date. Premier payé, premier servi.
                </p>
              </div>
              <div className="flex items-start space-x-4 p-4">
                <Info className="text-stone-300 flex-shrink-0" size={20} />
                <p className="text-xs text-stone-400">La livraison est disponible uniquement à Alger.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-stone-50 p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-stone-100 relative overflow-hidden">
            {!isFormOpen && (
              <div className="absolute inset-0 z-10 backdrop-blur-md bg-stone-50/80 flex flex-col items-center justify-center p-8 text-center border border-stone-200/50 rounded-[2.5rem]">
                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-rose-100">
                  <AlertCircle className="text-rose-400" size={32} />
                </div>
                <h3 className="text-2xl font-serif text-stone-900 mb-4">Les commandes sont fermées</h3>
                <p className="text-stone-600 leading-relaxed max-w-sm mx-auto">
                  Les commandes ouvriront vers la fin du mois. Gardez un œil sur notre Instagram pour être informé(e) !
                </p>
              </div>
            )}
            
            <div className={`transition-opacity duration-300 ${!isFormOpen ? 'opacity-30 blur-sm pointer-events-none' : ''}`}>
              <fieldset disabled={!isFormOpen} className="w-full">
            {status === FormStatus.ERROR && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-3">
                <AlertCircle size={18} />
                {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2 font-bold">Nom</label>
                <input 
                  required
                  type="text" 
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="Votre Nom"
                  className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2 font-bold">Téléphone</label>
                <input 
                  required
                  type="tel" 
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="0..."
                  className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2 font-bold">Compte Instagram</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-400 font-bold select-none">@</span>
                <input 
                  required
                  type="text" 
                  name="instagramHandle"
                  value={formData.instagramHandle}
                  onChange={handleChange}
                  placeholder="votre_compte"
                  className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex flex-col justify-end h-full">
                <div className="flex justify-between items-end mb-2 gap-2 mt-auto">
                  <label className="block text-xs uppercase tracking-widest text-stone-500 font-bold leading-tight pb-0.5">Date de l'événement</label>
                  <span className="text-[9px] sm:text-[10px] text-rose-400 font-semibold uppercase text-right leading-tight pb-0.5 whitespace-nowrap">{monthName} Uniquement</span>
                </div>
                <div className="relative">
                  <input 
                    required
                    type="date" 
                    name="eventDate"
                    min={minDate}
                    max={maxDate}
                    value={formData.eventDate}
                    onChange={handleChange}
                    onClick={handleDateClick}
                    onKeyDown={(e) => e.preventDefault()}
                    className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all cursor-pointer hover:border-rose-300"
                  />
                </div>
              </div>
              <div className="flex flex-col justify-end h-full">
                <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2 font-bold leading-tight mt-auto pb-0.5">Taille</label>
                <select 
                  name="cakeSize"
                  value={formData.cakeSize}
                  onChange={handleChange}
                  className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all appearance-none cursor-pointer"
                >
                  <option value="12cm">12cm (Petit)</option>
                  <option value="15cm">15cm (Standard)</option>
                  <option value="20cm">20cm (Grand)</option>
                  <option value="custom">Sur mesure (Mariage/Fiançailles)</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2 font-bold">Saveur</label>
              <select 
                name="flavor"
                value={formData.flavor}
                onChange={handleChange}
                className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all appearance-none cursor-pointer"
              >
                <option value="Vanille">Vanille</option>
                <option value="Chocolat">Chocolat</option>
                <option value="Vanille Fraise">Vanille Fraise</option>
                <option value="Pistache Framboise">Pistache Framboise</option>
                <option value="Other">Autre (À discuter)</option>
              </select>
            </div>

            <div className="mb-8">
              <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2 font-bold">Inspiration</label>
              <div 
                onClick={() => !previewUrl && fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl transition-all flex flex-col items-center justify-center p-4 cursor-pointer overflow-hidden ${
                  previewUrl ? 'border-rose-200 bg-white h-48' : 'border-stone-200 bg-white hover:border-rose-300 hover:bg-rose-50/30 h-32'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                
                {previewUrl ? (
                  <div className="relative w-full h-full group">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeImage(); }}
                      className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 transition-colors z-20"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-400 mb-2">
                      <Upload size={20} />
                    </div>
                    <p className="text-[11px] text-stone-400 uppercase tracking-widest font-semibold text-center px-4">joindre votre image</p>
                    <p className="text-[9px] text-stone-300 mt-1">JPEG, PNG jusqu'à 50MB</p>
                  </>
                )}
              </div>
            </div>

            <button 
              disabled={status === FormStatus.SUBMITTING || !isFormOpen}
              type="submit" 
              className="w-full bg-rose-400 text-white rounded-full py-4 uppercase tracking-[0.2em] text-sm font-semibold hover:bg-rose-500 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === FormStatus.SUBMITTING ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Envoi de la Commande...
                </span>
              ) : (
                <>
                  <span>Pré-commander pour {monthName}</span>
                  <Send size={16} />
                </>
              )}
            </button>
            <p className="mt-4 text-[10px] text-center text-stone-400 uppercase tracking-widest">Livraison sur Alger Uniquement • 50% d'Acompte Requis</p>
            </fieldset>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
