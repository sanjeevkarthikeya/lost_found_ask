import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ItemCategory, CampusLocation, ItemType } from '../types';
import {
  X,
  Upload,
  Image as ImageIcon,
  MapPin,
  Calendar,
  Clock,
  Lock,
  Sparkles,
  HelpCircle,
  Building2,
  Tag,
  FileText,
} from 'lucide-react';

interface PostItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: ItemType;
}

const CATEGORIES: ItemCategory[] = [
  'Electronics & Gadgets',
  'ID Cards & Documents',
  'Keys & Access Cards',
  'Bags & Luggage',
  'Books & Stationery',
  'Clothing & Accessories',
  'Wallets & Money',
  'Bottles & Containers',
  'Medical & Lab Equipment',
  'Sports Equipment',
  'Other Items',
];

const LOCATIONS: CampusLocation[] = [
  'YU Central Library',
  'Yenepoya Medical College & Hospital',
  'Yenepoya Dental College',
  'YIT Campus (Engineering)',
  'Indoor Sports Complex & Gym',
  'Food Court & Cafeteria',
  'Pharmacy & Allied Sciences Lab',
  'Central Bus Bay & Transport',
  'Girls Hostel Complex',
  'Boys Hostel Complex',
  'Administrative Block',
  'YU Auditorium & Greens',
  'Other Campus Location',
];

const SAMPLE_CAMPUS_PRESETS = [
  {
    label: 'Stethoscope',
    url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'AirPods / Earbuds',
    url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Keys / Lanyard',
    url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Backpack / Bag',
    url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Calculator / Electronics',
    url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Water Bottle / Flask',
    url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
  },
];

export const PostItemModal: React.FC<PostItemModalProps> = ({ isOpen, onClose, defaultType = 'lost' }) => {
  const { postItem, currentUser } = useApp();

  const [type, setType] = useState<ItemType>(defaultType);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Electronics & Gadgets');
  const [location, setLocation] = useState<CampusLocation>('YU Central Library');
  const [locationDetails, setLocationDetails] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [secretHint, setSecretHint] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [handoverLocation, setHandoverLocation] = useState<'with_student' | 'physical_desk'>('with_student');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert file to compressed base64 data URL for lightweight storage footprint
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 800;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedData = canvas.toDataURL('image/jpeg', 0.7);
        setImageUrl(compressedData);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);

    try {
      postItem({
        type,
        title: title.trim(),
        category,
        location,
        locationDetails: locationDetails.trim() || undefined,
        date,
        time: time.trim() || undefined,
        description: description.trim(),
        secretHint: secretHint.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        handoverLocation: type === 'found' ? handoverLocation : undefined,
      });

      onClose();
      // Reset
      setTitle('');
      setDescription('');
      setSecretHint('');
      setImageUrl('');
      setLocationDetails('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="post-item-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between z-20">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Post Campus Notice</span>
              <span className="text-xs bg-red-100 text-red-900 px-2 py-0.5 rounded-full font-bold">
                YenFind Official
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Broadcast lost or found property across Yenepoya University campus
            </p>
          </div>
          <button
            id="btn-close-post-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Post Type Selector (Person 1 Lost vs Person 2/3 Found) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Notice Category
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                id="type-lost-btn"
                onClick={() => setType('lost')}
                className={`py-3 px-4 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  type === 'lost'
                    ? 'bg-rose-50 border-rose-600 text-rose-900 ring-2 ring-rose-500/20 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-rose-600" />
                <span>I Lost Something (Person 1)</span>
              </button>

              <button
                type="button"
                id="type-found-btn"
                onClick={() => setType('found')}
                className={`py-3 px-4 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  type === 'found'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-emerald-600" />
                <span>I Found Something (Person 2/3)</span>
              </button>
            </div>
          </div>

          {/* Item Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Item Title &amp; Key Identification <span className="text-rose-500">*</span>
            </label>
            <input
              id="input-item-title"
              type="text"
              required
              placeholder="e.g. 3M Littmann Stethoscope (Burgundy) or Casio FX-991CW Calculator"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-900/20 focus:border-red-900 text-sm font-medium"
            />
          </div>

          {/* Category & Location Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                <span>Item Category</span>
              </label>
              <select
                id="select-item-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-900/20 focus:border-red-900 text-sm bg-white font-medium cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Campus Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>YU Campus Location</span>
              </label>
              <select
                id="select-item-location"
                value={location}
                onChange={(e) => setLocation(e.target.value as CampusLocation)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-900/20 focus:border-red-900 text-sm bg-white font-medium cursor-pointer"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location Specifics & Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Specific Location Details
              </label>
              <input
                id="input-location-details"
                type="text"
                placeholder="e.g. 2nd floor library near desk #14, or OPD ward 3 bench"
                value={locationDetails}
                onChange={(e) => setLocationDetails(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-900/20 focus:border-red-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Date</span>
              </label>
              <input
                id="input-item-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-900/20 focus:border-red-900 bg-white"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span>Detailed Description <span className="text-rose-500">*</span></span>
              <span className="text-[11px] text-slate-400 font-normal">Mention color, brand, condition</span>
            </label>
            <textarea
              id="textarea-item-description"
              required
              rows={3}
              placeholder="Describe the item accurately so the rightful owner or finder can recognize it..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-900/20 focus:border-red-900 text-xs sm:text-sm font-medium"
            />
          </div>

          {/* Anti-Theft Secret Question / Hint */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
              <Lock className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Anti-Theft Ownership Verification Hint (Optional)</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              A private question or hint you will ask in chat to verify true ownership before confirming the match.
            </p>
            <input
              id="input-secret-hint"
              type="text"
              placeholder="e.g. Ask me what sticker is on the back lid, or what engraving is inside..."
              value={secretHint}
              onChange={(e) => setSecretHint(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-xs bg-white"
            />
          </div>

          {/* Image Upload / Stock Presets */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>Reference Image (Optional)</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">Stored with minimal storage footprint</span>
            </label>

            {/* Custom URL or File picker */}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="input-image-url"
                type="text"
                placeholder="Paste direct image URL or pick below..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-red-900/20 focus:border-red-900"
              />

              <label className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 cursor-pointer flex items-center justify-center gap-1.5 transition-colors shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Photo</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {/* Quick Presets for Demo testing */}
            <div className="pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Quick Demo Image Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_CAMPUS_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium border border-slate-200 transition-colors"
                  >
                    + {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {imageUrl && (
              <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 mt-2 group">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Found Item Handover Location Selection */}
          {type === 'found' && (
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Current Custody of Item
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`p-3 rounded-xl border cursor-pointer text-xs font-semibold flex items-center gap-2 ${
                    handoverLocation === 'with_student'
                      ? 'bg-blue-50 border-blue-400 text-blue-900'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="custody"
                    checked={handoverLocation === 'with_student'}
                    onChange={() => setHandoverLocation('with_student')}
                    className="text-blue-600"
                  />
                  <span>Kept with Me (Student)</span>
                </label>

                <label
                  className={`p-3 rounded-xl border cursor-pointer text-xs font-semibold flex items-center gap-2 ${
                    handoverLocation === 'physical_desk'
                      ? 'bg-blue-50 border-blue-400 text-blue-900'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="custody"
                    checked={handoverLocation === 'physical_desk'}
                    onChange={() => setHandoverLocation('physical_desk')}
                    className="text-blue-600"
                  />
                  <span>Submitted to Desk / Security</span>
                </label>
              </div>
            </div>
          )}

          {/* Student Poster Info Summary */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div>
              <span className="font-semibold text-slate-800">Posting As: </span>
              <span>{currentUser?.name || 'Yenepoya Student'}</span>
              <span className="text-[11px] text-slate-400 ml-1">({currentUser?.department})</span>
            </div>
            <span className="text-[11px] text-slate-400">Phone &amp; Email remain private until matched</span>
          </div>

          {/* Submit CTA */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-submit-post-item"
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold bg-gradient-to-r from-red-800 to-red-950 text-white shadow-md hover:shadow-lg transition-all"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Campus Notice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
