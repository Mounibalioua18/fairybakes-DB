import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Image as ImageIcon, Upload, Loader2, Save, Trash2, Edit3, X, Check, ImagePlus } from 'lucide-react';

interface PortfolioItem {
  id?: string;
  type: 'main' | 'gallery';
  title: string;
  description: string;
  image_url: string;
  position: number;
}

export const PortfolioManager: React.FC = () => {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPosition, setUploadingPosition] = useState<number | null>(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('portfolio')
        .select('*')
        .order('position', { ascending: true });
        
      if (error) {
        // If table doesn't exist, this might fail, so we catch it
        if (error.code === '42P01') {
          // Table doesn't exist yet, we can mock it for now
          console.warn('Portfolio table does not exist yet. Using empty state.');
          setItems([]);
        } else {
          throw error;
        }
      } else {
        setItems(data || []);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to load portfolio items. Will allow you to create new ones.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, position: number, type: 'main' | 'gallery') => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setUploadingPosition(position);
    setError(null);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(fileName, file, { upsert: false }); // No compress requested
        
      if (uploadError) {
        if (uploadError.message.includes('Bucket not found')) {
            throw new Error('Supabase bucket "assets" does not exist yet. Please create it.');
        }
        throw uploadError;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(fileName);
        
      // Update local state and save
      const existingItem = items.find(i => i.position === position);
      
      const newItem: PortfolioItem = {
        ...(existingItem || { title: '', description: '', type }),
        image_url: publicUrl,
        position,
        type
      };
      
      await saveItem(newItem);
      
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(`Upload failed: ${err.message || 'Unknown error'}`);
    } finally {
      setUploadingPosition(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const saveItem = async (item: PortfolioItem) => {
    setIsSaving(true);
    try {
      // First check if an item with this position exists
      const existingItem = items.find(i => i.position === item.position);
      
      let res;
      if (existingItem?.id) {
        // Update
        res = await supabase
          .from('portfolio')
          .update({
            title: item.title,
            description: item.description,
            image_url: item.image_url,
            type: item.type,
            position: item.position
          })
          .eq('id', existingItem.id)
          .select();
      } else {
        // Insert
        res = await supabase
          .from('portfolio')
          .insert({
            title: item.title,
            description: item.description,
            image_url: item.image_url,
            type: item.type,
            position: item.position
          })
          .select();
      }
      
      if (res.error) throw res.error;
      
      const savedItem = res.data[0];
      setItems(prev => {
        const next = [...prev];
        const idx = next.findIndex(i => i.position === item.position);
        if (idx >= 0) next[idx] = savedItem;
        else next.push(savedItem);
        return next;
      });
      
    } catch (err: any) {
      console.error('Save error:', err);
      // Fallback for UI visualization if DB goes wrong
      setError(`Save failed: ${err.message || 'Unknown error'}`);
      setItems(prev => {
         const next = [...prev];
         const idx = next.findIndex(i => i.position === item.position);
         if (idx >= 0) next[idx] = item;
         else next.push(item);
         return next;
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateItemDetails = (position: number, field: 'title' | 'description', value: string) => {
    setItems(prev => {
      const next = [...prev];
      const idx = next.findIndex(i => i.position === position);
      if (idx >= 0) {
        next[idx] = { ...next[idx], [field]: value };
      } else {
        // Find if it's main or gallery
        const type = position === 0 ? 'main' : 'gallery';
        next.push({
          type,
          title: field === 'title' ? value : '',
          description: field === 'description' ? value : '',
          image_url: '',
          position
        });
      }
      return next;
    });
  };

  const triggerUpload = (position: number) => {
    // Hacky way to pass position to file input
    if (fileInputRef.current) {
        fileInputRef.current.dataset.position = position.toString();
        fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const posStr = e.target.dataset.position;
      if (posStr !== undefined) {
          const pos = parseInt(posStr, 10);
          const type = pos === 0 ? 'main' : 'gallery';
          handleFileUpload(e, pos, type);
      }
  };

  const renderCard = (position: number, title: string, type: 'main' | 'gallery', showTitle: boolean = true, showDescription: boolean = true) => {
    const item = items.find(i => i.position === position);
    const isUploading = uploadingPosition === position;

    return (
      <div key={position} className={`bg-white border rounded-[2rem] p-5 md:p-6 flex flex-col gap-4 w-full max-w-[280px] md:max-w-none mx-auto shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-stone-100 hover:shadow-[0_8px_30px_rgb(225,29,72,0.08)] hover:border-rose-100 transition-all duration-500 group/card`}>
        <div className="flex justify-between items-center px-1">
            <h3 className="text-sm font-serif font-bold text-stone-700 tracking-wide">{title}</h3>
            {isUploading && <Loader2 size={16} className="animate-spin text-rose-400" />}
        </div>
        
        <div 
            onClick={() => triggerUpload(position)}
            className={`w-full aspect-[4/5] rounded-2xl border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden transition-all relative group bg-stone-50 ${item?.image_url ? 'border-transparent shadow-inner' : 'border-stone-200 hover:border-rose-300 hover:bg-rose-50/30'}`}
        >
            {item?.image_url ? (
                <>
                    <img src={item.image_url} alt={title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="text-white font-bold text-xs flex items-center gap-2"><Edit3 size={14} /> Change Image</span>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center gap-2 text-stone-400 group-hover:text-rose-400 transition-colors">
                    <ImagePlus size={24} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Upload Image</span>
                </div>
            )}
        </div>

        {(showTitle || showDescription) && (
            <div className="space-y-2 mt-2">
                {showTitle && (
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-2">Title</label>
                        <input 
                            type="text" 
                            value={item?.title || ''} 
                            onChange={(e) => updateItemDetails(position, 'title', e.target.value)}
                            onBlur={() => item && saveItem(item)}
                            placeholder="Enter title..."
                            className="w-full text-sm font-bold text-stone-800 bg-stone-50/50 border border-stone-100 rounded-xl px-4 py-3 mt-1 focus:outline-none focus:ring-2 focus:ring-rose-100 focus:bg-white transition-all shadow-sm"
                        />
                    </div>
                )}
                {showDescription && (
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-2">Description</label>
                        <textarea 
                            value={item?.description || ''} 
                            onChange={(e) => updateItemDetails(position, 'description', e.target.value)}
                            onBlur={() => item && saveItem(item)}
                            placeholder="Small description..."
                            rows={2}
                            className="w-full text-xs text-stone-600 bg-stone-50/50 border border-stone-100 rounded-xl px-4 py-3 mt-1 focus:outline-none focus:ring-2 focus:ring-rose-100 focus:bg-white transition-all shadow-sm resize-none"
                        />
                    </div>
                )}
            </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full pb-20">
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
        />
        
        <div className="flex flex-col items-center justify-center text-center gap-4 mb-16 mt-8">
            <div>
                <h2 className="text-3xl md:text-5xl font-serif font-bold text-stone-900 tracking-tight">Portfolio & Assets</h2>
                <p className="text-xs md:text-sm text-stone-500 max-w-lg mx-auto mt-4 leading-relaxed">
                    Upload images that will be displayed on the client side. Includes 1 main picture, 6 garden pictures, 2 fairy way pictures, and 3 TAOB pictures.
                </p>
            </div>
            
            <div className="h-4">
                {isSaving && <span className="text-xs font-medium text-rose-400 flex items-center justify-center gap-2 bg-rose-50 px-3 py-1.5 rounded-full"><Loader2 size={14} className="animate-spin" /> Saving...</span>}
            </div>
        </div>

        {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 flex flex-col gap-1">
                <strong>Notice:</strong> {error}
            </div>
        )}

        <div className="w-full mt-8">
            {isLoading ? (
                <div className="py-20 flex justify-center">
                    <Loader2 className="animate-spin text-stone-300" size={32} />
                </div>
            ) : (
                <div className="flex flex-col items-center">
                    {/* Main Picture */}
                    <div className="w-full max-w-7xl px-4 md:px-8 mb-24 flex flex-col items-center">
                        <h2 className="text-2xl md:text-4xl font-serif font-bold text-stone-800 mb-8 flex items-center justify-center gap-3">
                            <ImageIcon size={28} className="text-rose-400" />
                            Main Highlight Picture
                        </h2>
                        <div className="w-full max-w-lg lg:max-w-2xl mx-auto">
                            {renderCard(0, "Main Graphic", "main", true, false)}
                        </div>
                    </div>
                    
                    {/* The Fairies' Garden Header */}
                    <div className="w-full max-w-7xl px-4 md:px-8 mt-8 mb-8">
                        <h2 className="text-2xl md:text-4xl font-serif font-bold text-stone-800 flex items-center justify-center gap-3">
                            <ImageIcon size={24} className="text-rose-400" />
                            The Fairies' Garden
                        </h2>
                    </div>

                    {/* 6 Fairies Garden Pictures */}
                    <div className="w-full max-w-7xl px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-14 mb-24">
                        {[1, 2, 3, 4, 5, 6].map((num) => renderCard(num, `Garden Image ${num}`, "gallery"))}
                    </div>

                    {/* The Fairy Way Header */}
                    <div className="w-full max-w-7xl px-4 md:px-8 mt-6 mb-8">
                        <h2 className="text-2xl md:text-4xl font-serif font-bold text-stone-800 flex items-center justify-center gap-3">
                            <ImageIcon size={24} className="text-rose-400" />
                            The Fairy Way
                        </h2>
                    </div>

                    {/* 2 Fairy Way Pictures */}
                    <div className="w-full max-w-5xl lg:max-w-6xl px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 mb-24">
                        {[7, 8].map((num, i) => renderCard(num, `Fairy Way Image ${i + 1}`, "gallery", false, false))}
                    </div>

                    {/* TAOB Header */}
                    <div className="w-full max-w-7xl px-4 md:px-8 mt-6 mb-8">
                        <h2 className="text-2xl md:text-4xl font-serif font-bold text-stone-800 flex items-center justify-center gap-3">
                            <ImageIcon size={24} className="text-rose-400" />
                            TAOB
                        </h2>
                    </div>

                    {/* 3 TAOB Pictures */}
                    <div className="w-full max-w-7xl px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-14">
                        {[9, 10, 11].map((num, i) => renderCard(num, `TAOB Image ${i + 1}`, "gallery", false, false))}
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};
