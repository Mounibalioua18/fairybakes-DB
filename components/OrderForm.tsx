
import React, { useState, useRef } from 'react';
import { CheckCircle2, AlertCircle, Upload, X, Image as ImageIcon } from 'lucide-react';
import { FormStatus, CakeOrder } from '../types';
import { supabase } from '../lib/supabase';

export const OrderForm: React.FC = () => {
  const [status, setStatus] = useState<FormStatus>(FormStatus.IDLE);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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
          .single();
        
        if (data && data.description === 'false') {
          setIsFormOpen(false);
        }
      } catch (err) {
        console.log('Using default form setting');
      }
    };
    fetchFormStatus();
  }, []);

  const now = new Date();
  const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const lastDayNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
  
  const monthName = nextMonthDate.toLocaleString('default', { month: 'long' });
  const year = nextMonthDate.getFullYear();
  
  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const minDate = formatDate(nextMonthDate);
  const maxDate = formatDate(lastDayNextMonth);

  const [formData, setFormData] = useState<Partial<CakeOrder>>({
    customerName: '',
    phoneNumber: '',
    instagramHandle: '',
    eventDate: minDate,
    cakeSize: '15cm',
    flavor: 'Vanille',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(FormStatus.SUBMITTING);
    
    try {
      const orderUniqueId = crypto.randomUUID();
      let inspirationId = '';
      
      // 1. Upload image if selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('inspirations')
          .upload(fileName, selectedFile);
          
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('inspirations')
          .getPublicUrl(fileName);
        
        // 2. Create entry in 'galleries' collection
        inspirationId = orderUniqueId;
        const { error: galleryError } = await supabase
          .from('galleries')
          .insert({
            order_id: inspirationId,
            propertyId: inspirationId,
            images: [publicUrl]
          });
          
        if (galleryError) throw galleryError;
      }

      // 3. Create final Order in 'orders' collection
      const orderData = {
        id: orderUniqueId,
        costumer_name: formData.customerName || '',
        "phone number": formData.phoneNumber || '',
        instagram_handle: formData.instagramHandle?.replace('@', '') || '',
        event_date: formData.eventDate || '',
        cake_size: formData.cakeSize || '',
        flavor: formData.flavor || '',
        designNotes: 'Inspiration Synced',
        inspirationId: inspirationId,
        status: 'pending',
        timestamp: Date.now()
      };

      const { error: orderError } = await supabase
        .from('orders')
        .insert(orderData);
        
      if (orderError) throw orderError;

      setStatus(FormStatus.SUCCESS);
      setFormData({
        customerName: '',
        phoneNumber: '',
        instagramHandle: '',
        eventDate: minDate,
        cakeSize: '15cm',
        flavor: 'Vanille'
      });
      removeFile();
    } catch (error) {
      console.error('Failed to submit order:', error);
      setStatus(FormStatus.ERROR);
      alert('Erreur lors de la soumission. Veuillez vérifier votre connexion.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateClick = (e: React.MouseEvent<HTMLInputElement>) => {
    try {
      if ('showPicker' in e.currentTarget) {
        (e.currentTarget as any).showPicker();
      }
    } catch (error) {}
  };

  if (status === FormStatus.SUCCESS) {
    return (
      <section id="order" className="py-24 px-6 md:px-12 bg-rose-50 text-center">
        <div className="max-w-2xl mx-auto py-20 bg-white rounded-[3rem] shadow-xl px-10">
          <CheckCircle2 className="w-20 h-20 text-green-400 mx-auto mb-6" />
          <h2 className="text-4xl font-serif mb-4">Commande Reçue!</h2>
          <p className="text-stone-500 mb-8">
            Thank you for trusting Fairybakes. We will reach out via Instagram within 48 hours to confirm your {monthName} slot.
          </p>
          <button 
            onClick={() => setStatus(FormStatus.IDLE)}
            className="text-rose-500 font-semibold uppercase tracking-widest text-sm hover:underline"
          >
            Submit another order
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="order" className="py-24 px-6 md:px-12 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <h2 className="text-4xl md:text-6xl font-serif text-stone-900 mb-6">Reservation Window</h2>
            <div className="inline-flex items-center space-x-2 bg-stone-900 text-white px-4 py-2 rounded-full text-xs uppercase tracking-widest mb-8">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span>Accepting Orders for {monthName} {year}</span>
            </div>
            <p className="text-stone-500 text-lg mb-8 leading-relaxed font-light">
              We gather orders once a month. This ensures we can source the freshest seasonal florals and plan each design meticulously.
            </p>
            <div className="space-y-6">
              <div className="flex items-start space-x-4 p-6 bg-rose-50 rounded-2xl border border-rose-100">
                <AlertCircle className="text-rose-400 flex-shrink-0" size={24} />
                <p className="text-sm text-stone-600 leading-relaxed italic">
                  Note: A 50% deposit via Baridimob or CCP is required within 48h to secure your date.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-stone-50 p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-stone-100 relative overflow-hidden">
            {!isFormOpen && (
              <div className="absolute inset-0 z-10 backdrop-blur-md bg-stone-50/80 flex flex-col items-center justify-center p-8 text-center border border-stone-200/50 rounded-[2.5rem]">
                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-rose-100">
                  <AlertCircle className="text-rose-400" size={32} />
                </div>
                <h3 className="text-2xl font-serif text-stone-900 mb-4">Orders are currently closed</h3>
                <p className="text-stone-600 leading-relaxed max-w-sm mx-auto">
                  The orders will open towards the end of the month. Keep an eye on Instagram for the update!
                </p>
              </div>
            )}
            
            <div className={`transition-opacity duration-300 ${!isFormOpen ? 'opacity-30 blur-sm pointer-events-none' : ''}`}>
              <fieldset disabled={!isFormOpen}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2 font-bold">Name</label>
                <input 
                  required
                  type="text" 
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="Your Name"
                  className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2 font-bold">Phone</label>
                <input 
                  required
                  type="tel" 
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="+213 ..."
                  className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2 font-bold">Instagram Handle</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-400 font-bold select-none">@</span>
                <input 
                  required
                  type="text" 
                  name="instagramHandle"
                  value={formData.instagramHandle}
                  onChange={handleChange}
                  placeholder="username"
                  className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2 font-bold">Event Date</label>
                <input 
                  required
                  type="date" 
                  name="eventDate"
                  min={minDate}
                  max={maxDate}
                  value={formData.eventDate}
                  onChange={handleChange}
                  onClick={handleDateClick}
                  className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2 font-bold">Size</label>
                <select 
                  name="cakeSize"
                  value={formData.cakeSize}
                  onChange={handleChange}
                  className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all appearance-none cursor-pointer"
                >
                  <option value="12cm">12cm</option>
                  <option value="15cm">15cm</option>
                  <option value="20cm">20cm</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2 font-bold">Flavor</label>
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
              </select>
            </div>

            <div className="mb-8">
              <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2 font-bold">Upload Inspiration</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`w-full bg-white border-2 border-dashed border-stone-200 rounded-2xl p-6 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 hover:border-rose-200 hover:bg-rose-50/30 ${previewUrl ? 'border-rose-200 bg-rose-50/20' : ''}`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                
                {previewUrl ? (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-md">
                    <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeFile(); }}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-400">
                      <ImageIcon size={24} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-stone-800 font-bold">Click to select image</p>
                      <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-1">PNG, JPG or JPEG</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <button 
              disabled={status === FormStatus.SUBMITTING || !isFormOpen}
              type="submit" 
              className="w-full bg-rose-400 text-white rounded-full py-4 uppercase tracking-[0.2em] text-sm font-semibold hover:bg-rose-500 transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Upload size={18} className={status === FormStatus.SUBMITTING ? "animate-bounce" : ""} />
              <span>{status === FormStatus.SUBMITTING ? "Envoi en cours..." : "Submit Order"}</span>
            </button>
            </fieldset>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
