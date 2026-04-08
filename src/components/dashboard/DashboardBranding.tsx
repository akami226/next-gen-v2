import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, Loader2, X, Image as ImageIcon, Eye } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { ShopOwnerData } from '../../hooks/useAuth';
import type { Shop } from '../../types';
import { supabase } from '../../lib/supabase';
import ImageCropModal from '../ImageCropModal';
import ShopInitials, { AvatarInitials } from '../ShopInitials';

interface DashboardBrandingProps {
  shop: Shop;
  shopOwnerData: ShopOwnerData | null;
  user: SupabaseUser;
  onBrandingUpdate: () => void;
}

type ImageType = 'logo' | 'profile' | 'banner';

interface UploadZoneProps {
  label: string;
  description: string;
  currentUrl: string | null | undefined;
  fallback: React.ReactNode;
  shape: 'square' | 'circle' | 'banner';
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  uploading: boolean;
  previewClass: string;
}

function UploadZone({
  label,
  description,
  currentUrl,
  fallback,
  shape,
  onFileSelect,
  onRemove,
  uploading,
  previewClass,
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) onFileSelect(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
    e.target.value = '';
  };

  return (
    <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">{label}</h3>
          <p className="text-[11px] text-white/25 mt-0.5">{description}</p>
        </div>
        {currentUrl && (
          <button
            onClick={onRemove}
            disabled={uploading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold text-red-400/60 hover:text-red-400 hover:bg-red-500/[0.06] transition-colors"
          >
            <X className="w-3 h-3" />
            Remove
          </button>
        )}
      </div>

      <div className="flex items-center gap-5">
        <div className={previewClass}>
          {uploading ? (
            <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a]">
              <Loader2 className="w-6 h-6 text-[#FF4500] animate-spin" />
            </div>
          ) : currentUrl ? (
            <img src={currentUrl} alt={label} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {fallback}
            </div>
          )}
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex-1 border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
            dragActive
              ? 'border-[#FF4500]/50 bg-[#FF4500]/[0.03]'
              : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.03]'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <Upload className="w-5 h-5 text-white/15 mx-auto mb-2" />
          <p className="text-[11px] text-white/40 font-medium">
            {shape === 'banner' ? 'Drop banner image or click' : 'Drop image or click to upload'}
          </p>
          <p className="text-[9px] text-white/20 mt-0.5">
            {shape === 'banner' ? 'Recommended: 1200x400px' : 'Recommended: 400x400px'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardBranding({ shop, shopOwnerData, user, onBrandingUpdate }: DashboardBrandingProps) {
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [cropType, setCropType] = useState<ImageType>('logo');
  const [cropOpen, setCropOpen] = useState(false);
  const [uploading, setUploading] = useState<ImageType | null>(null);

  const [logoUrl, setLogoUrl] = useState(shopOwnerData?.logo_url || null);
  const [profileUrl, setProfileUrl] = useState(shopOwnerData?.profile_picture_url || null);
  const [bannerUrl, setBannerUrl] = useState(shopOwnerData?.banner_url || null);

  const [showPreview, setShowPreview] = useState(false);

  const openCrop = useCallback((file: File, type: ImageType) => {
    setCropFile(file);
    setCropType(type);
    setCropOpen(true);
  }, []);

  const uploadImage = useCallback(async (blob: Blob, type: ImageType) => {
    setUploading(type);
    const ext = 'webp';
    const path = `${user.id}/${type}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('shop-assets')
      .upload(path, blob, { contentType: 'image/webp', upsert: true });

    if (uploadError) {
      setUploading(null);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('shop-assets')
      .getPublicUrl(path);

    const columnMap: Record<ImageType, string> = {
      logo: 'logo_url',
      profile: 'profile_picture_url',
      banner: 'banner_url',
    };

    await supabase
      .from('shop_owners')
      .update({ [columnMap[type]]: publicUrl })
      .eq('user_id', user.id);

    if (type === 'logo') setLogoUrl(publicUrl);
    if (type === 'profile') setProfileUrl(publicUrl);
    if (type === 'banner') setBannerUrl(publicUrl);

    setUploading(null);
    onBrandingUpdate();
  }, [user.id, onBrandingUpdate]);

  const removeImage = useCallback(async (type: ImageType) => {
    setUploading(type);
    const columnMap: Record<ImageType, string> = {
      logo: 'logo_url',
      profile: 'profile_picture_url',
      banner: 'banner_url',
    };

    await supabase
      .from('shop_owners')
      .update({ [columnMap[type]]: null })
      .eq('user_id', user.id);

    if (type === 'logo') setLogoUrl(null);
    if (type === 'profile') setProfileUrl(null);
    if (type === 'banner') setBannerUrl(null);

    setUploading(null);
    onBrandingUpdate();
  }, [user.id, onBrandingUpdate]);

  const cropConfig: Record<ImageType, { aspect: number; shape: 'square' | 'circle' | 'banner'; title: string }> = {
    logo: { aspect: 1, shape: 'square', title: 'Crop Shop Logo' },
    profile: { aspect: 1, shape: 'circle', title: 'Crop Profile Picture' },
    banner: { aspect: 3, shape: 'banner', title: 'Crop Banner Image' },
  };

  const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || '';

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Logo & Branding</h2>
          <p className="text-sm text-white/40 mt-1">Manage your shop logo, profile picture, and banner</p>
        </div>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            showPreview
              ? 'bg-[#FF4500]/10 border border-[#FF4500]/20 text-[#FF4500]'
              : 'bg-white/[0.06] border border-white/[0.08] text-white/50 hover:text-white/70'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          Preview
        </button>
      </motion.div>

      <div className="space-y-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <UploadZone
            label="Shop Logo"
            description="Appears on your profile, shop cards, and quote requests"
            currentUrl={logoUrl}
            fallback={<ShopInitials name={shop.name} size="lg" />}
            shape="square"
            onFileSelect={(f) => openCrop(f, 'logo')}
            onRemove={() => removeImage('logo')}
            uploading={uploading === 'logo'}
            previewClass="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/[0.1] shrink-0"
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <UploadZone
            label="Profile Picture"
            description="Your personal photo shown in the navigation and dashboard"
            currentUrl={profileUrl}
            fallback={<AvatarInitials name={displayName} size="lg" />}
            shape="circle"
            onFileSelect={(f) => openCrop(f, 'profile')}
            onRemove={() => removeImage('profile')}
            uploading={uploading === 'profile'}
            previewClass="w-20 h-20 rounded-full overflow-hidden border-2 border-white/[0.1] shrink-0"
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <UploadZone
            label="Banner / Cover Photo"
            description="Displayed at the top of your shop profile page"
            currentUrl={bannerUrl}
            fallback={
              <div className="w-full h-full bg-gradient-to-r from-white/[0.03] to-white/[0.06] flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-white/10" />
              </div>
            }
            shape="banner"
            onFileSelect={(f) => openCrop(f, 'banner')}
            onRemove={() => removeImage('banner')}
            uploading={uploading === 'banner'}
            previewClass="w-48 h-16 rounded-xl overflow-hidden border border-white/[0.1] shrink-0"
          />
        </motion.div>
      </div>

      {showPreview && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 space-y-4"
        >
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Live Preview</h3>

          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden">
            <p className="text-[10px] text-white/20 uppercase tracking-wider font-semibold px-4 pt-3 pb-2">Shop Profile Hero</p>
            <div className="relative h-32 overflow-hidden">
              {bannerUrl ? (
                <img src={bannerUrl} alt="banner preview" className="w-full h-full object-cover opacity-60" />
              ) : (
                <div className="w-full h-full bg-gradient-to-b from-white/[0.04] to-transparent" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-[#0e0e0e]/60 to-transparent" />
              <div className="absolute bottom-3 left-4 flex items-end gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white/[0.1] shrink-0">
                  {logoUrl ? (
                    <img src={logoUrl} alt="logo" className="w-full h-full object-cover" />
                  ) : (
                    <ShopInitials name={shop.name} size="md" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{shop.name}</p>
                  <p className="text-[10px] text-white/40">{shop.city}, {shop.state}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4">
            <p className="text-[10px] text-white/20 uppercase tracking-wider font-semibold mb-3">Shop Card on Map</p>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] max-w-xs">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/[0.1] shrink-0">
                {logoUrl ? (
                  <img src={logoUrl} alt="logo" className="w-full h-full object-cover" />
                ) : (
                  <ShopInitials name={shop.name} size="sm" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{shop.name}</p>
                <p className="text-[10px] text-white/30">{shop.city}, {shop.state}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4">
            <p className="text-[10px] text-white/20 uppercase tracking-wider font-semibold mb-3">Navigation Avatar</p>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] max-w-xs">
              <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                {profileUrl ? (
                  <img src={profileUrl} alt="profile" className="w-full h-full object-cover" />
                ) : (
                  <AvatarInitials name={displayName} size="sm" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-white/60 truncate">{displayName}</p>
                <p className="text-[9px] text-[#FF4500]/60 font-semibold uppercase tracking-wider">Shop Owner</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <ImageCropModal
        isOpen={cropOpen}
        onClose={() => setCropOpen(false)}
        imageFile={cropFile}
        aspectRatio={cropConfig[cropType].aspect}
        shape={cropConfig[cropType].shape}
        title={cropConfig[cropType].title}
        onCropComplete={(blob) => uploadImage(blob, cropType)}
      />
    </div>
  );
}
