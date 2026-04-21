
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CakeOrder } from '../types';
import { Trash2, User, Search, RefreshCw, Package, X, Calendar, LogOut, ChevronDown, Instagram, Maximize2, Filter, Check, Image as ImageIcon, ExternalLink, Mail, Lock, StickyNote, Save, Edit3, Plus, ImagePlus, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { PortfolioManager } from './PortfolioManager';

interface AdminDashboardProps {
  onClose: () => void;
}

type FilterType = 'all' | 'pending' | 'confirmed' | 'paid' | 'delivered';

interface NoteData {
  text: string;
  images: string[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const [orders, setOrders] = useState<CakeOrder[]>([]);
  const [activeTab, setActiveTab] = useState<'schedule' | 'taob' | 'portfolio'>('schedule');
  const [taobSignUps, setTaobSignUps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Note editing state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState<NoteData>({ text: '', images: [] });
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const noteEditorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getCurrentMonthStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const saved = localStorage.getItem('fairy_admin_selected_month');
    return saved || getCurrentMonthStr();
  });

  const [selectedOrder, setSelectedOrder] = useState<CakeOrder | null>(null);
  const [selectedTaob, setSelectedTaob] = useState<any | null>(null);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const monthPickerRef = useRef<HTMLDivElement>(null);
  
  // Settings State
  const [isFormOpen, setIsFormOpen] = useState<boolean>(true);
  const [isTogglingForm, setIsTogglingForm] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio')
        .select('description')
        .eq('title', 'SYSTEM_SETTING_ORDER_FORM')
        .maybeSingle(); // Prevents throwing if it doesn't exist yet
      if (data && data.description) {
        setIsFormOpen(data.description === 'true');
      }
    } catch (e) {
      console.log('Settings fetch error');
    }
  };

  const toggleFormState = async () => {
    setIsTogglingForm(true);
    const newVal = !isFormOpen;
    setIsFormOpen(newVal);
    
    try {
      const stringVal = newVal ? 'true' : 'false';
      
      const { data, error } = await supabase
         .from('portfolio')
         .select('id')
         .eq('title', 'SYSTEM_SETTING_ORDER_FORM')
         .maybeSingle(); // Prevents throwing if it doesn't exist yet
         
      if (data) {
         await supabase
           .from('portfolio')
           .update({ description: stringVal })
           .eq('title', 'SYSTEM_SETTING_ORDER_FORM');
      } else {
         await supabase
           .from('portfolio')
           .insert([{
              title: 'SYSTEM_SETTING_ORDER_FORM',
              description: stringVal,
              type: 'gallery', // Use gallery to avoid type constraints
              position: 9999
           }]);
      }
    } catch (e) {
      console.error('Save toggle error:', e);
    }
    setIsTogglingForm(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
      loadSettings();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (monthPickerRef.current && !monthPickerRef.current.contains(event.target as Node)) {
        setIsMonthPickerOpen(false);
      }
      if (noteEditorRef.current && !noteEditorRef.current.contains(event.target as Node)) {
        if (editingNoteId) {
          saveNote(editingNoteId, noteContent);
          setEditingNoteId(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [editingNoteId, noteContent]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .order('eventDate', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(100);
        
      if (orderError) throw orderError;
      
      const fetchedOrders = (orderData || []).map((o: any) => ({
        id: o.id,
        created_at: o.created_at,
        customerName: o.costumer_name || o.customer_name || o.costumerName || o.customerName || o.Name || o.name || '',
        phoneNumber: o['phone number'] || o.phone_number || o.phoneNumber || '',
        instagramHandle: o.instagram_handle || o.instagramHandle || o.instagram || '',
        eventDate: o.event_date || o.eventDate || '',
        cakeSize: o.cake_size || o.cakeSize || '',
        flavor: o.flavor || '',
        designNotes: o.designNotes || o.design_notes || '',
        note: o.note || '',
        inspirationId: o.inspirationId || o.inspiration_id || '',
        inspirationImageUrl: o.inspiration_image_url || o.inspirationImageUrl || '',
        status: o.status || 'pending',
        timestamp: o.timestamp || Date.now()
      })) as CakeOrder[];
      
      setOrders(fetchedOrders);
      
      // Load TAOB Signups
      try {
        const { data: taobData, error: taobError } = await supabase
          .from('taob_signups')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);
        if (!taobError && taobData) {
          const mappedTaob = taobData.map((o: any) => ({
            id: o.id,
            created_at: o.created_at,
            customerName: o.name || o.costumer_name || o.customer_name || o.customerName || '',
            phoneNumber: o.phone || o['phone number'] || o.phone_number || o.phoneNumber || '',
            instagramHandle: o.instagram || o.instagram_handle || o.instagramHandle || '',
            paymentProofUrl: o.proof_image_url || o.paymentProofUrl || o.payment_proof_url || '',
            status: o.status || 'pending',
            note: o.note || '',
            timestamp: o.timestamp || Date.now()
          }));
          setTaobSignUps(mappedTaob);
        }
      } catch (err) {
        // Ignore if 'taob' table doesn't exist yet
      }

    } catch (error: any) {
      console.error('Fetch error:', error);
      alert(`Error reading from Supabase: ${error.message || 'Check database permissions'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const parseNote = (raw: string | undefined): NoteData => {
    if (!raw) return { text: '', images: [] };
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && 'text' in parsed) {
        return { 
          text: parsed.text || '', 
          images: Array.isArray(parsed.images) ? parsed.images : [] 
        };
      }
    } catch (e) {
      // Not JSON, return as plain text
    }
    return { text: raw, images: [] };
  };

  const openNoteEditor = (e: React.MouseEvent, order: CakeOrder) => {
    e.stopPropagation();
    setEditingNoteId(order.id);
    setNoteContent(parseNote(order.note));
  };

  const saveNote = async (id: string, content: NoteData) => {
    const originalOrder = orders.find(o => o.id === id);
    const serialized = JSON.stringify(content);
    
    if (!originalOrder || serialized === originalOrder.note) {
      setEditingNoteId(null);
      return;
    }
    
    setIsSavingNote(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ note: serialized })
        .eq('id', id);
        
      if (error) throw error;
      
      setOrders(prev => prev.map(o => o.id === id ? { ...o, note: serialized } : o));
      if (selectedOrder?.id === id) {
        setSelectedOrder(prev => prev ? { ...prev, note: serialized } : null);
      }
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingNoteId) return;

    setIsUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('inspirations')
        .upload(fileName, file);
        
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('inspirations')
        .getPublicUrl(fileName);
      
      const newContent = {
        ...noteContent,
        images: [...noteContent.images, publicUrl]
      };
      setNoteContent(newContent);
    } catch (error: any) {
      console.error('Upload failed:', error);
      alert(`Failed to upload image: ${error.message || 'Please try again.'}`);
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeNoteImage = (index: number) => {
    const newImages = [...noteContent.images];
    newImages.splice(index, 1);
    setNoteContent({ ...noteContent, images: newImages });
  };

  const handleMonthChange = (val: string) => {
    setSelectedMonth(val);
    localStorage.setItem('fairy_admin_selected_month', val);
    setIsMonthPickerOpen(false);
  };

  const updateStatus = async (id: string, newStatus: CakeOrder['status'] | '') => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus as any } : o));
    if (selectedOrder?.id === id) {
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus as any } : null);
    }
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus || null })
        .eq('id', id);
        
      if (error) throw error;
    } catch (error) {
      console.error('Failed to persist status change:', error);
    }
  };

  const deleteOrder = async (id: string) => {
    if (window.confirm('Confirm permanent deletion from database?')) {
      try {
        const { error: deleteOrderError } = await supabase
          .from('orders')
          .delete()
          .eq('id', id);
          
        if (deleteOrderError) throw deleteOrderError;
        
        await supabase
          .from('galleries')
          .delete()
          .eq('propertyId', id);

        setOrders(prev => prev.filter(o => o.id !== id));
        if (selectedOrder?.id === id) setSelectedOrder(null);
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const updateTaobStatus = async (id: string, newStatus: string) => {
    setTaobSignUps(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    if (selectedTaob?.id === id) {
      setSelectedTaob(prev => prev ? { ...prev, status: newStatus } : null);
    }
    try {
      const { error } = await supabase
        .from('taob_signups')
        .update({ status: newStatus || null })
        .eq('id', id);
        
      if (error) throw error;
    } catch (error) {
      console.error('Failed to persist taob status change:', error);
    }
  };

  const deleteTaobSignUp = async (id: string) => {
    if (window.confirm('Confirm permanent deletion from database?')) {
      try {
        const { error } = await supabase
          .from('taob_signups')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        setTaobSignUps(prev => prev.filter(o => o.id !== id));
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setIsAuthenticated(true);
    } catch (error: any) {
      alert(`Login failed: ${error.message === 'Failed to fetch' ? 'Failed to fetch (Check if Supabase Environment Variables are correctly entered!)' : error.message}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Logout error:', error);
      setIsAuthenticated(false);
    }
  };

  const monthOptions = useMemo(() => {
    const options = [];
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 12; i++) {
      const d = new Date(currentYear, i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('fr-FR', { month: 'long' });
      const year = d.getFullYear();
      options.push({ val, label, year });
    }
    return options;
  }, []);

  const selectedMonthLabel = useMemo(() => {
    if (selectedMonth === 'all') return 'Tous les mois';
    const opt = monthOptions.find(o => o.val === selectedMonth);
    return opt ? `${opt.label} ${opt.year}` : 'Tous les mois';
  }, [selectedMonth, monthOptions]);

  const filteredOrders = useMemo(() => {
    const query = searchQuery.toLowerCase();
    let filtered = orders.filter(o => {
      const nameMatch = (o.customerName || '').toLowerCase().includes(query);
      const handleMatch = (o.instagramHandle || '').toLowerCase().includes(query);
      const dateMatch = (o.eventDate || '').includes(query);
      return nameMatch || handleMatch || dateMatch;
    });
    if (activeFilter !== 'all') filtered = filtered.filter(o => o.status === activeFilter);
    if (selectedMonth !== 'all') filtered = filtered.filter(o => o.eventDate && o.eventDate.startsWith(selectedMonth));
    return filtered;
  }, [orders, searchQuery, activeFilter, selectedMonth]);

  const filteredTaobSignUps = useMemo(() => {
    const query = searchQuery.toLowerCase();
    let filtered = taobSignUps.filter(signup => {
      const nameMatch = (signup.customerName || '').toLowerCase().includes(query);
      const handleMatch = (signup.instagramHandle || '').toLowerCase().includes(query);
      const phoneMatch = (signup.phoneNumber || '').toLowerCase().includes(query);
      return nameMatch || handleMatch || phoneMatch;
    });
    if (activeFilter !== 'all') filtered = filtered.filter(o => o.status === activeFilter);
    // TAOB doesn't use selectedMonth
    return filtered;
  }, [taobSignUps, searchQuery, activeFilter]);

  const groupedOrders = useMemo(() => {
    const groups: Record<string, CakeOrder[]> = {};
    filteredOrders.forEach(order => {
      const safeEventDate = order.eventDate || new Date().toISOString();
      const dateKey = safeEventDate.includes('T') ? safeEventDate.split('T')[0] : safeEventDate;
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(order);
    });
    return Object.entries(groups).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());
  }, [filteredOrders]);

  const getRowBgColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-50/80 hover:bg-amber-100/90';
      case 'confirmed': return 'bg-emerald-50/80 hover:bg-emerald-100/90';
      case 'paid': return 'bg-rose-50/80 hover:bg-rose-100/90';
      case 'delivered': return 'bg-stone-100/80 hover:bg-stone-200/90';
      default: return 'bg-white hover:bg-stone-50/50';
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfaf6] pt-4 md:pt-8 pb-10 px-2 md:px-12 relative">
      {/* Note Editor Modal */}
      {editingNoteId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div 
            ref={noteEditorRef}
            className="w-full max-w-lg bg-white/95 backdrop-blur-2xl shadow-2xl rounded-3xl p-6 md:p-8 relative border border-stone-200/50 max-h-[90vh] flex flex-col transform transition-all animate-in zoom-in-95"
          >
             <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100">
                    <StickyNote size={14} className="text-amber-500" />
                  </div>
                  <h3 className="text-lg font-serif font-bold text-stone-800">Studio Note</h3>
                </div>
                <button 
                  onClick={() => { saveNote(editingNoteId, noteContent); setEditingNoteId(null); }}
                  className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                >
                  <X size={16} />
                </button>
             </div>

             <div className="flex-1 overflow-y-auto scrollbar-hide py-2 flex flex-col gap-6">
               <textarea
                 autoFocus
                 value={noteContent.text}
                 onChange={(e) => setNoteContent({ ...noteContent, text: e.target.value })}
                 placeholder="Type your private studio note here..."
                 className="w-full min-h-[160px] bg-stone-50/50 border border-stone-100 rounded-2xl p-5 text-stone-700 text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-200/50 resize-none font-serif placeholder:text-stone-300 transition-all shadow-inner"
               />

               {/* Note Photos Grid */}
               {(noteContent.images.length > 0 || isUploadingImage || noteContent.images.length < 4) && (
                 <div>
                   <h4 className="text-xs uppercase tracking-widest font-bold text-stone-400 mb-3 ml-1">Reference Images</h4>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                     {noteContent.images.map((url, idx) => (
                       <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden bg-stone-100 shadow-sm border border-stone-200/50">
                         <img src={url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Note attachment" />
                         <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/20 transition-colors pointer-events-none" />
                         <button 
                           onClick={() => removeNoteImage(idx)}
                           className="absolute top-2 right-2 bg-white/90 text-red-500 rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                         >
                           <X size={12} />
                         </button>
                         <a 
                           href={url} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="absolute inset-0 z-0"
                         />
                       </div>
                     ))}
                     
                     {isUploadingImage ? (
                       <div className="aspect-square rounded-2xl border-2 border-dashed border-amber-200 flex flex-col items-center justify-center bg-amber-50/30 gap-2">
                         <Loader2 size={18} className="text-amber-500 animate-spin" />
                         <span className="text-[10px] uppercase font-bold text-amber-500/70">Uploading</span>
                       </div>
                     ) : noteContent.images.length < 4 ? (
                       <button 
                         onClick={() => fileInputRef.current?.click()}
                         className="aspect-square rounded-2xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center gap-1.5 text-stone-400 hover:text-amber-500 hover:border-amber-200 hover:bg-amber-50/30 transition-all group"
                       >
                         <ImagePlus size={20} className="group-hover:scale-110 transition-transform" />
                         <span className="text-[9px] uppercase font-bold tracking-wider">Add Photo</span>
                       </button>
                     ) : null}
                   </div>
                 </div>
               )}
             </div>

             <input 
               type="file" 
               ref={fileInputRef} 
               onChange={handleImageUpload} 
               accept="image/*" 
               className="hidden" 
             />

             <div className="flex justify-between items-center mt-6 pt-4 border-t border-stone-100">
               <div className="text-[10px] text-stone-400 flex items-center gap-1.5">
                 {isSavingNote ? (
                   <>
                     <Loader2 size={12} className="animate-spin text-amber-500" />
                     <span className="uppercase font-bold text-amber-600">Syncing...</span>
                   </>
                 ) : (
                   <span className="italic">Auto-saves on close</span>
                 )}
               </div>
               <button 
                 onClick={() => { saveNote(editingNoteId, noteContent); setEditingNoteId(null); }}
                 disabled={isSavingNote}
                 className="bg-stone-900 text-white px-6 py-2.5 rounded-xl text-xs uppercase tracking-widest font-semibold hover:bg-rose-500 transition-colors shadow-md disabled:opacity-50"
               >
                 Done
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Modal Detail View */}
      {selectedOrder && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md transition-all duration-300 animate-in fade-in"
          onClick={() => setSelectedOrder(null)}
        >
          <div 
            className="bg-white w-full max-w-2xl rounded-[2.5rem] md:rounded-[3rem] shadow-2xl overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full bg-stone-50 text-stone-400 hover:text-stone-900 transition-colors z-10"
            >
              <X size={20} />
            </button>

            <div className="p-6 md:p-14 max-h-[90vh] overflow-y-auto scrollbar-hide">
              {/* PROFILE HEADER */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 md:w-20 md:h-20 bg-rose-50 rounded-2xl md:rounded-[2rem] flex items-center justify-center text-rose-400 border border-rose-100 flex-shrink-0">
                  <User size={selectedOrder.customerName ? 28 : 36} />
                </div>
                <div className="min-w-0 flex-1 relative flex flex-col justify-center">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 items-start">
                    <h2 className="text-xl md:text-3xl font-serif text-stone-900 font-bold break-words leading-tight">
                      {selectedOrder.customerName}
                    </h2>
                    <button 
                      onClick={(e) => openNoteEditor(e, selectedOrder)}
                      className={`mt-1 md:mt-0 flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold transition-all ${selectedOrder.note ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-stone-50 text-stone-400 border border-stone-100 hover:bg-amber-50 hover:text-amber-600'}`}
                    >
                      <Edit3 size={10} />
                      {selectedOrder.note ? 'See Note' : 'note'}
                    </button>
                  </div>
                  <a 
                    href={`https://instagram.com/${selectedOrder.instagramHandle}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-rose-400 flex items-center gap-1.5 font-bold text-xs md:text-base hover:text-rose-600 transition-colors truncate mt-1 w-fit"
                  >
                    <Instagram size={14} className="flex-shrink-0" /> @{selectedOrder.instagramHandle}
                  </a>
                </div>
              </div>

              {/* DETAILS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-10">
                <DetailBox label="Event Date" value={new Date(selectedOrder.eventDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} />
                <DetailBox label="Phone Number" value={selectedOrder.phoneNumber} />
                <DetailBox label="Cake Size" value={selectedOrder.cakeSize} />
                <DetailBox label="Flavor" value={selectedOrder.flavor} />
              </div>

              {/* INSPIRATION IMAGE */}
              <div className="mb-8 md:mb-10 p-5 md:p-8 bg-stone-50 rounded-2xl md:rounded-[2rem] border border-stone-100">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Design Inspiration</span>
                  {selectedOrder.inspirationImageUrl && (
                    <a 
                      href={selectedOrder.inspirationImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-stone-400 hover:text-rose-400 transition-colors flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold"
                    >
                      <ExternalLink size={12} /> Open Full
                    </a>
                  )}
                </div>
                
                {selectedOrder.inspirationImageUrl ? (
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-inner border border-stone-200 bg-white group">
                    <img 
                      src={selectedOrder.inspirationImageUrl} 
                      className="w-full h-full object-contain" 
                      alt="Design Reference"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/fff/rose?text=Image+Not+Found';
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-stone-300 gap-2 italic text-sm">
                    <ImageIcon size={32} />
                    <span>No synced inspiration found.</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex flex-col gap-1 w-full md:w-auto">
                  <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Production Status</span>
                  <StatusDropdown 
                    status={selectedOrder.status} 
                    onChange={(s) => updateStatus(selectedOrder.id, s)} 
                    className="w-full md:w-48"
                  />
                </div>
                <button 
                  onClick={() => deleteOrder(selectedOrder.id)}
                  className="flex items-center gap-2 text-stone-300 hover:text-red-400 transition-colors text-[10px] font-bold uppercase tracking-widest md:pt-4"
                >
                  <Trash2 size={16} /> Delete Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail View for TAOB */}
      {selectedTaob && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md transition-all duration-300 animate-in fade-in"
          onClick={() => setSelectedTaob(null)}
        >
          <div 
            className="bg-white w-full max-w-2xl rounded-[2.5rem] md:rounded-[3rem] shadow-2xl overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedTaob(null)}
              className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full bg-stone-50 text-stone-400 hover:text-stone-900 transition-colors z-10"
            >
              <X size={20} />
            </button>

            <div className="p-6 md:p-14 max-h-[90vh] overflow-y-auto scrollbar-hide">
              {/* PROFILE HEADER */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 md:w-20 md:h-20 bg-rose-50 rounded-2xl md:rounded-[2rem] flex items-center justify-center text-rose-400 border border-rose-100 flex-shrink-0">
                  <User size={selectedTaob.customerName ? 28 : 36} />
                </div>
                <div className="min-w-0 flex-1 relative flex flex-col justify-center">
                  <h2 className="text-xl md:text-3xl font-serif text-stone-900 font-bold break-words leading-tight mb-1">
                    {selectedTaob.customerName || 'No Name'}
                  </h2>
                  <a 
                    href={`https://instagram.com/${selectedTaob.instagramHandle}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-rose-400 flex items-center gap-1.5 font-bold text-xs md:text-base hover:text-rose-600 transition-colors truncate mt-1 w-fit"
                  >
                    <Instagram size={14} className="flex-shrink-0" /> @{selectedTaob.instagramHandle}
                  </a>
                </div>
              </div>

              {/* DETAILS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-10">
                <DetailBox label="Phone Number" value={selectedTaob.phoneNumber || 'N/A'} />
                <DetailBox label="Sign-up Date" value={new Date(selectedTaob.timestamp || selectedTaob.created_at || Date.now()).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })} />
              </div>

              {/* PAYMENT PROOF */}
              <div className="mb-8 md:mb-10 p-5 md:p-8 bg-stone-50 rounded-2xl md:rounded-[2rem] border border-stone-100">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Proof of Payment</span>
                  {selectedTaob.paymentProofUrl && (
                    <a 
                      href={selectedTaob.paymentProofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-stone-400 hover:text-rose-400 transition-colors flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold"
                    >
                      <ExternalLink size={12} /> Open Full
                    </a>
                  )}
                </div>
                
                {selectedTaob.paymentProofUrl ? (
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-inner border border-stone-200 bg-white group">
                    <img 
                      src={selectedTaob.paymentProofUrl} 
                      className="w-full h-full object-contain" 
                      alt="Payment Proof"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/fff/rose?text=Image+Not+Found';
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-stone-300 gap-2 italic text-sm">
                    <ImageIcon size={32} />
                    <span>No payment proof attached.</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex flex-col gap-1 w-full md:w-auto">
                  <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Registration Status</span>
                  <StatusDropdown 
                    type="taob"
                    status={selectedTaob.status} 
                    onChange={(s) => updateTaobStatus(selectedTaob.id, s)} 
                    className="w-full md:w-48"
                  />
                </div>
                <button 
                  onClick={() => {
                    deleteTaobSignUp(selectedTaob.id);
                    setSelectedTaob(null);
                  }}
                  className="flex items-center gap-2 text-stone-300 hover:text-red-400 transition-colors text-[10px] font-bold uppercase tracking-widest md:pt-4"
                >
                  <Trash2 size={16} /> Delete Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Screen */}
      {!isAuthenticated ? (
         <div className="min-h-screen flex items-center justify-center bg-[#fdfaf6] p-4">
         <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-stone-100 text-center relative overflow-hidden">
           <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-50 rounded-full blur-2xl"></div>
           <div className="relative z-10">
             <div className="mb-8">
               <div className="flex items-baseline justify-center space-x-1 mb-2">
                 <span className="text-2xl md:text-3xl font-serif tracking-[0.1em] uppercase text-stone-800 font-bold">Fairy</span>
                 <span className="text-3xl md:text-4xl font-signature text-rose-400 -ml-1 -rotate-6 transform translate-y-1">bakes</span>
               </div>
               <p className="text-stone-400 text-[9px] uppercase tracking-[0.3em] font-bold">Studio Manager Access</p>
             </div>
             <form onSubmit={handleLogin} className="space-y-4">
               <div className="space-y-2 text-left">
                 <label className="block text-[9px] uppercase tracking-widest text-stone-400 font-bold ml-2">Email Address</label>
                 <div className="relative">
                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={16} />
                   <input 
                     type="email" 
                     required
                     placeholder="manager@fairybakes.com"
                     className="w-full bg-stone-50 border border-stone-200 rounded-2xl pl-12 pr-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                   />
                 </div>
               </div>
               <div className="space-y-2 text-left">
                 <label className="block text-[9px] uppercase tracking-widest text-stone-400 font-bold ml-2">Pass Key</label>
                 <div className="relative">
                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={16} />
                   <input 
                     type="password" 
                     required
                     placeholder="••••••••"
                     className="w-full bg-stone-50 border border-stone-200 rounded-2xl pl-12 pr-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                   />
                 </div>
               </div>
               <button 
                 type="submit" 
                 disabled={isLoggingIn}
                 className="w-full bg-stone-900 text-white rounded-full py-4 uppercase tracking-[0.2em] text-[10px] md:text-[11px] font-bold hover:bg-stone-800 transition-all shadow-xl disabled:opacity-50 mt-4"
               >
                 {isLoggingIn ? "Authenticating..." : "Access Orders"}
               </button>
             </form>
           </div>
         </div>
       </div>
      ) : (
        <div className="max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 md:mb-8 bg-white/80 backdrop-blur-sm p-3 md:p-4 rounded-3xl shadow-sm border border-stone-100 gap-3 md:gap-4 sticky top-2 md:top-4 z-50">
            <div className="flex flex-col md:flex-row w-full md:w-auto gap-3 md:gap-4">
              <div className="flex items-center justify-between w-full md:w-auto">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-rose-50 rounded-lg md:rounded-xl flex items-center justify-center text-rose-400 shadow-sm border border-rose-100 shrink-0">
                    {activeTab === 'portfolio' ? <ImageIcon size={18} /> : <Package size={18} />}
                  </div>
                  {activeTab !== 'portfolio' && (
                    <span className="bg-stone-900 text-white text-[9px] md:text-[11px] px-2 md:px-2.5 py-0.5 md:py-1 rounded-full font-bold shadow-sm">
                      {activeTab === 'schedule' ? filteredOrders.length : filteredTaobSignUps.length}
                    </span>
                  )}
                </div>
                
                {/* Mobile Refresh/Logout */}
                <div className="flex md:hidden items-center gap-2">
                  {activeTab === 'schedule' && (
                    <button
                      onClick={toggleFormState}
                      disabled={isTogglingForm}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm ${
                        isFormOpen 
                          ? 'bg-rose-50 text-rose-600 border border-rose-200'
                          : 'bg-stone-100 text-stone-500 border border-stone-200'
                      } ${isTogglingForm ? 'opacity-50 cursor-wait' : ''}`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${isFormOpen ? 'bg-rose-500 animate-pulse' : 'bg-stone-400'}`} />
                      {isFormOpen ? 'ON' : 'OFF'}
                    </button>
                  )}
                  <button onClick={loadOrders} className={`p-2 bg-stone-50 rounded-lg text-stone-500 hover:text-stone-700 shadow-sm border border-stone-100 ${isLoading ? 'animate-spin' : ''}`}>
                    <RefreshCw size={16} />
                  </button>
                  <button onClick={handleLogout} className="p-2 bg-rose-50 rounded-lg text-rose-500 hover:text-rose-600 shadow-sm border border-rose-100">
                    <LogOut size={16} />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center space-x-1 bg-stone-100 rounded-full p-1 overflow-x-auto scrollbar-hide w-full md:w-auto">
                <button 
                  onClick={() => setActiveTab('schedule')}
                  className={`flex-1 md:flex-none px-3 md:px-4 py-1.5 flex items-center justify-center text-[10px] md:text-[11px] font-bold rounded-full transition-all whitespace-nowrap ${activeTab === 'schedule' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                >
                  Studio Schedule
                </button>
                <button 
                  onClick={() => setActiveTab('taob')}
                  className={`flex-1 md:flex-none px-3 md:px-4 py-1.5 flex items-center justify-center text-[10px] md:text-[11px] font-bold rounded-full transition-all whitespace-nowrap ${activeTab === 'taob' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                >
                  TAOB Sign Up's
                </button>
                <button 
                  onClick={() => setActiveTab('portfolio')}
                  className={`flex-1 md:flex-none px-3 md:px-4 py-1.5 flex items-center justify-center text-[10px] md:text-[11px] font-bold rounded-full transition-all whitespace-nowrap ${activeTab === 'portfolio' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                >
                  Portfolio
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto flex-wrap md:flex-nowrap">
              {activeTab === 'schedule' && (
                <div className="relative flex-1 md:flex-none md:w-60" ref={monthPickerRef}>
                  <button 
                    onClick={() => setIsMonthPickerOpen(!isMonthPickerOpen)}
                    className={`w-full flex items-center justify-between bg-white border border-stone-200 rounded-[1.25rem] px-4 py-2 text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-stone-700 transition-all shadow-sm hover:border-rose-200 hover:bg-stone-50/50 ${isMonthPickerOpen ? 'ring-2 ring-rose-100 border-rose-300' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <Calendar size={14} className="text-rose-400" />
                      <span className="truncate">{selectedMonthLabel}</span>
                    </div>
                    <ChevronDown size={14} className={`text-stone-300 transition-transform duration-300 ${isMonthPickerOpen ? 'rotate-180' : 'rotate-0'}`} />
                  </button>

                  {isMonthPickerOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[1.5rem] shadow-2xl border border-stone-100 overflow-hidden z-[60] animate-in fade-in zoom-in-95 duration-200">
                      <div className="max-h-80 overflow-y-auto scrollbar-hide py-2">
                        <button 
                          onClick={() => handleMonthChange('all')}
                          className={`w-full px-4 py-3 text-left text-[9px] md:text-[10px] uppercase tracking-widest font-bold flex items-center justify-between transition-colors ${selectedMonth === 'all' ? 'bg-rose-50 text-rose-600' : 'text-stone-500 hover:bg-stone-50'}`}
                        >
                          Tous les mois
                          {selectedMonth === 'all' && <Check size={12} />}
                        </button>
                        <div className="h-px bg-stone-100 mx-3 my-1" />
                        {monthOptions.map((opt) => (
                          <button 
                            key={opt.val}
                            onClick={() => handleMonthChange(opt.val)}
                            className={`w-full px-4 py-3 text-left text-[9px] md:text-[10px] uppercase tracking-widest font-bold flex items-center justify-between transition-colors ${selectedMonth === opt.val ? 'bg-rose-50 text-rose-600' : 'text-stone-500 hover:bg-stone-50'}`}
                          >
                            {opt.label} {opt.year}
                            {selectedMonth === opt.val && <Check size={12} />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab !== 'portfolio' && (
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" size={12} />
                  <input 
                    type="text" 
                    placeholder="Search..."
                    className={`w-full bg-stone-50/50 border border-stone-100 rounded-[1.25rem] pl-8 ${searchQuery ? 'pr-8' : 'pr-4'} py-2 text-[11px] md:text-xs focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              )}
              {activeTab === 'schedule' && (
                <button
                  onClick={toggleFormState}
                  disabled={isTogglingForm}
                  className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                    isFormOpen 
                      ? 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100'
                      : 'bg-stone-100 text-stone-500 border border-stone-200 hover:bg-stone-200'
                  } ${isTogglingForm ? 'opacity-50 cursor-wait' : ''}`}
                  title={isFormOpen ? "Orders are OPEN" : "Orders are CLOSED"}
                >
                  <div className={`w-2 h-2 rounded-full ${isFormOpen ? 'bg-rose-500 animate-pulse' : 'bg-stone-400'}`} />
                  {isFormOpen ? 'Form ON' : 'Form OFF'}
                </button>
              )}
              <button onClick={loadOrders} className={`hidden md:block p-2 text-stone-400 hover:bg-rose-50 rounded-lg transition-all ${isLoading ? 'animate-spin' : ''}`}>
                <RefreshCw size={18} />
              </button>
              <button onClick={handleLogout} className="hidden md:block p-2 text-stone-400 hover:text-rose-400 transition-all">
                <LogOut size={18} />
              </button>
            </div>
          </div>

          {/* Spreadsheet Body */}
          {activeTab !== 'portfolio' ? (
            <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-stone-100 overflow-hidden">
              {activeTab === 'schedule' ? (
              <>
                <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-2 bg-stone-50 border-b border-stone-100 text-[10px] uppercase tracking-widest font-bold text-stone-400">
                  <div className="col-span-2">Event Date</div>
                  <div className="col-span-3">Customer Profile</div>
                  <div className="col-span-1">Size</div>
                  <div className="col-span-2">Flavor</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>

                <div className="max-h-[calc(100vh-220px)] md:max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-hide">
                  {groupedOrders.length === 0 ? (
                    <div className="p-10 md:p-20 text-center text-stone-400 italic font-serif text-base md:text-lg flex flex-col items-center gap-4">
                      <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center text-stone-200">
                        <Filter size={24} />
                      </div>
                      No active records.
                    </div>
                  ) : (
                    groupedOrders.map(([date, dateOrders], groupIdx) => (
                      <div key={date}>
                        {groupIdx > 0 && <div className="w-full h-1 md:h-1.5 bg-stone-900 shadow-sm" />}
                        {dateOrders.map((order) => {
                          const noteData = parseNote(order.note);
                          const hasNoteContent = noteData.text.length > 0 || noteData.images.length > 0;
                          
                          return (
                            <div 
                              key={order.id} 
                              className={`grid grid-cols-2 md:grid-cols-12 gap-2 md:gap-4 px-4 md:px-8 py-1.5 items-center border-b border-stone-50/50 transition-all cursor-pointer group ${getRowBgColor(order.status)}`}
                              onClick={() => setSelectedOrder(order)}
                            >
                              <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row md:items-center gap-1">
                                <div className="flex items-center gap-1.5">
                                  <Calendar size={10} className="text-rose-400 flex-shrink-0" />
                                  <span className="text-[10px] md:text-[11px] font-bold text-stone-600 whitespace-nowrap">
                                    {order.eventDate ? new Date(order.eventDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) : 'N/A'}
                                  </span>
                                </div>
                                <div className="md:hidden flex items-start gap-2 mt-0.5 overflow-hidden">
                                   <span className="text-xs font-serif font-bold text-stone-900 line-clamp-2 max-w-[140px] leading-tight">{order.customerName}</span>
                                   <div className="flex items-center gap-1.5 mt-0.5">
                                     {order.inspirationImageUrl && <ImageIcon size={10} className="text-rose-400 flex-shrink-0" />}
                                     {hasNoteContent && <StickyNote size={10} className="text-amber-500 flex-shrink-0" />}
                                   </div>
                                 </div>
                              </div>

                              <div className="hidden md:flex col-span-3 items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 text-[9px] font-bold border border-stone-200 flex-shrink-0">
                                  {order.customerName ? order.customerName.charAt(0) : '?'}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <div className="flex items-start gap-2">
                                    <span className="text-xs font-serif font-bold text-stone-900 line-clamp-2 leading-tight py-0.5">{order.customerName}</span>
                                    <button 
                                      onClick={(e) => openNoteEditor(e, order)}
                                      className={`text-[8px] uppercase tracking-widest font-black transition-all pt-1 ${hasNoteContent ? 'text-amber-600' : 'text-stone-300 opacity-0 group-hover:opacity-100 hover:text-amber-500'}`}
                                    >
                                      {hasNoteContent ? <StickyNote size={10} /> : 'note'}
                                    </button>
                                  </div>
                                  <a 
                                    href={`https://instagram.com/${order.instagramHandle}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-[9px] text-rose-400 font-bold truncate hover:text-rose-600 transition-colors w-fit"
                                  >
                                    @{order.instagramHandle}
                                  </a>
                                </div>
                                {order.inspirationImageUrl && <ImageIcon size={12} className="text-rose-400 flex-shrink-0" />}
                              </div>

                              <div className="hidden md:block col-span-1 text-[11px] text-stone-500">{order.cakeSize}</div>
                              <div className="hidden md:block col-span-2 text-[11px] text-stone-500 truncate">{order.flavor}</div>

                              <div className="col-span-1 md:col-span-2 py-1" onClick={(e) => e.stopPropagation()}>
                                <StatusDropdown status={order.status} onChange={(s) => updateStatus(order.id, s)} />
                              </div>

                              <div className="hidden md:flex col-span-2 text-right items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                                <button onClick={() => setSelectedOrder(order)} className="text-stone-300 hover:text-rose-400 transition-colors p-1">
                                  <Maximize2 size={13} />
                                </button>
                                <button onClick={() => deleteOrder(order.id)} className="text-stone-200 hover:text-red-400 transition-colors p-1">
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : activeTab === 'taob' ? (
              <>
                <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-2 bg-stone-50 border-b border-stone-100 text-[10px] uppercase tracking-widest font-bold text-stone-400">
                  <div className="col-span-3">Customer</div>
                  <div className="col-span-2">Instagram @</div>
                  <div className="col-span-2">Preuve de paiement</div>
                  <div className="col-span-2">Phone</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-1 text-right">Actions</div>
                </div>

                <div className="max-h-[calc(100vh-220px)] md:max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-hide">
                  {filteredTaobSignUps.length === 0 ? (
                    <div className="p-10 md:p-20 text-center text-stone-400 italic font-serif text-base md:text-lg flex flex-col items-center gap-4">
                      <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center text-stone-200">
                        <Filter size={24} />
                      </div>
                      No TAOB sign-ins yet.
                    </div>
                  ) : (
                    filteredTaobSignUps.map((signup) => (
                      <div 
                        key={signup.id} 
                        className={`grid grid-cols-2 md:grid-cols-12 gap-2 md:gap-4 px-4 md:px-8 py-1.5 items-center border-b border-stone-50/50 transition-all cursor-pointer group ${getRowBgColor(signup.status)}`}
                        onClick={() => setSelectedTaob(signup)}
                      >
                        <div className="col-span-1 md:col-span-3 flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 text-[9px] font-bold border border-stone-200 flex-shrink-0">
                            {signup.customerName ? signup.customerName.charAt(0) : '?'}
                          </div>
                          <span className="text-xs font-serif font-bold text-stone-900 line-clamp-2 leading-tight">{signup.customerName}</span>
                        </div>
                        
                        <div className="hidden md:flex col-span-2 items-center">
                          <a 
                            href={`https://instagram.com/${signup.instagramHandle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[11px] text-rose-400 font-bold truncate hover:text-rose-600 transition-colors w-fit flex items-center gap-1.5"
                          >
                            <Instagram size={11} />
                            @{signup.instagramHandle}
                          </a>
                        </div>

                        <div className="hidden md:flex flex-col col-span-2 items-start justify-center">
                          {signup.paymentProofUrl ? (
                            <a 
                              href={signup.paymentProofUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              onClick={(e) => e.stopPropagation()} 
                              className="group relative w-10 h-10 rounded-lg border border-stone-200 overflow-hidden shadow-sm hover:border-rose-300 transition-colors"
                            >
                              <img src={signup.paymentProofUrl} alt="Preuve" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-stone-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <ExternalLink size={12} className="text-white" />
                              </div>
                            </a>
                          ) : (
                            <span className="text-[10px] italic text-stone-300">Aucune preuve</span>
                          )}
                        </div>
                        <div className="hidden md:block col-span-2 text-[11px] text-stone-500">{signup.phoneNumber}</div>

                        <div className="col-span-1 md:col-span-2 py-1" onClick={(e) => e.stopPropagation()}>
                          <StatusDropdown type="taob" status={signup.status} onChange={(s) => updateTaobStatus(signup.id, s)} />
                        </div>

                        <div className="hidden md:flex col-span-1 text-right items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => setSelectedTaob(signup)} className="text-stone-300 hover:text-rose-400 transition-colors p-1">
                            <Maximize2 size={13} />
                          </button>
                          <button onClick={() => deleteTaobSignUp(signup.id)} className="text-stone-200 hover:text-red-400 transition-colors p-1">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : null}
            </div>
          ) : (
            <div className="-mx-4 md:-mx-8">
              <PortfolioManager />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const DetailBox = ({ label, value }: { label: string, value: string }) => (
  <div className="p-4 bg-stone-50 rounded-2xl md:rounded-[1.2rem] border border-stone-100">
    <span className="block text-[8px] uppercase tracking-widest text-stone-400 font-bold mb-1">{label}</span>
    <span className="text-xs font-bold text-stone-800">{value}</span>
  </div>
);

const StatusDropdown = ({ status, type = 'order', onChange, className = "" }: { status: string, type?: 'order' | 'taob', onChange: (s: any) => void, className?: string }) => {
  const themes: any = {
    pending: 'bg-amber-400 text-amber-950 border-amber-600 shadow-sm',
    confirmed: 'bg-emerald-500 text-white border-emerald-700 shadow-sm',
    paid: 'bg-rose-500 text-white border-rose-700 shadow-sm',
    delivered: 'bg-stone-600 text-white border-stone-800 shadow-sm',
    none: 'bg-white text-stone-400 border-stone-200'
  };

  const currentTheme = themes[status] || themes.none;

  return (
    <div className={`relative ${className}`}>
      <select 
        value={status || ''} 
        onChange={(e) => onChange(e.target.value)}
        className={`w-full appearance-none text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2 md:px-3 py-0.5 md:py-0.5 rounded-full border transition-all cursor-pointer focus:outline-none ${currentTheme}`}
      >
        <option value="" className="bg-white text-stone-400 font-bold italic">No Status</option>
        {type === 'order' && <option value="pending" className="bg-amber-100 text-amber-900 font-bold">Pending</option>}
        <option value="confirmed" className="bg-emerald-100 text-emerald-900 font-bold">Confirmed</option>
        {type === 'order' && <option value="paid" className="bg-rose-100 text-rose-900 font-bold">Paid</option>}
        <option value="delivered" className="bg-stone-200 text-stone-900 font-bold">Delivered</option>
      </select>
      <div className={`absolute right-2 md:right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-90 ${status && status !== 'none' && status !== 'pending' ? 'text-white' : 'text-stone-400'}`}>
        <ChevronDown size={10} />
      </div>
    </div>
  );
};
