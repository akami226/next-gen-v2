import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Menu, X, Store, User, LogOut, FolderOpen, LayoutDashboard, Star, FileText, Settings, CreditCard, Info, MessageSquare, CircleUser as UserCircle, ChevronDown, Sun, Moon } from 'lucide-react';
import { useBreakpoint } from '../hooks/useMediaQuery';
import type { User as AuthUser } from '@supabase/supabase-js';
import type { ShopNotification } from '../types';
import NotificationBell from './NotificationBell';
import { useTheme } from '../hooks/useTheme';

interface HeaderProps {
  user?: AuthUser | null;
  isShopOwner?: boolean;
  profilePictureUrl?: string | null;
  onSignOut?: () => void;
  notifications?: ShopNotification[];
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  onViewAllNotifications?: () => void;
  onClickNotification?: (notification: ShopNotification) => void;
}

export default function Header({ user, isShopOwner, profilePictureUrl, onSignOut, notifications, onMarkRead, onMarkAllRead, onViewAllNotifications, onClickNotification }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isMobile } = useBreakpoint();
  const menuRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [menuOpen]);

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0];

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/[0.06] dark:border-white/[0.06] light:border-black/[0.08] z-40"
    >
      <a href="#/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
        <div className="w-9 h-9 rounded-xl bg-[#FF4500]/15 flex items-center justify-center">
          <Car className="w-5 h-5 text-[#FF4500]" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white dark:text-white light:text-gray-900 tracking-wide">NextGen</h1>
          <p className="text-[10px] text-white/30 dark:text-white/30 light:text-gray-400 tracking-widest uppercase">3D Configurator</p>
        </div>
      </a>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/[0.04] dark:bg-white/[0.04] light:bg-black/[0.04] border border-white/[0.08] dark:border-white/[0.08] light:border-black/[0.08] flex items-center justify-center text-white/50 dark:text-white/50 light:text-gray-500 hover:text-white/80 dark:hover:text-white/80 light:hover:text-gray-700 hover:bg-white/[0.08] dark:hover:bg-white/[0.08] light:hover:bg-black/[0.06] transition-all duration-200"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        {isShopOwner && notifications && onMarkRead && onMarkAllRead && onViewAllNotifications && onClickNotification && (
          <NotificationBell
            notifications={notifications}
            onMarkRead={onMarkRead}
            onMarkAllRead={onMarkAllRead}
            onViewAll={onViewAllNotifications}
            onClickNotification={onClickNotification}
          />
        )}
        {isMobile ? (
          <MobileMenu
            menuRef={menuRef}
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            user={user}
            isShopOwner={isShopOwner}
            profilePictureUrl={profilePictureUrl}
            displayName={displayName}
            onSignOut={onSignOut}
          />
        ) : (
          <DesktopNav
            menuRef={menuRef}
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            user={user}
            isShopOwner={isShopOwner}
            profilePictureUrl={profilePictureUrl}
            displayName={displayName}
            onSignOut={onSignOut}
          />
        )}
      </div>
    </motion.header>
  );
}

function UserAvatar({ profilePictureUrl, displayName, size = 'sm' }: { profilePictureUrl?: string | null; displayName?: string; size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'w-5 h-5' : 'w-7 h-7';
  const radius = size === 'sm' ? 'rounded-md' : 'rounded-lg';
  const textSize = size === 'sm' ? 'text-[7px]' : 'text-[9px]';

  if (profilePictureUrl) {
    return (
      <div className={`${dim} ${radius} overflow-hidden shrink-0`}>
        <img src={profilePictureUrl} alt={displayName || 'User avatar'} className="w-full h-full object-cover" />
      </div>
    );
  }

  const initials = (displayName || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={`${dim} ${radius} bg-[#FF4500]/10 border border-[#FF4500]/20 flex items-center justify-center shrink-0`}>
      <span className={`${textSize} font-bold text-[#FF4500]`}>{initials}</span>
    </div>
  );
}

const NAV_LINK = 'px-3 py-1.5 rounded-lg text-[10px] text-white/50 dark:text-white/50 light:text-gray-500 font-medium tracking-wider uppercase hover:text-white/80 dark:hover:text-white/80 light:hover:text-gray-800 hover:bg-white/[0.06] dark:hover:bg-white/[0.06] light:hover:bg-black/[0.04] transition-colors';

function DesktopNav({
  menuRef,
  menuOpen,
  setMenuOpen,
  user,
  isShopOwner,
  profilePictureUrl,
  displayName,
  onSignOut,
}: {
  menuRef: React.RefObject<HTMLDivElement>;
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
  user?: AuthUser | null;
  isShopOwner?: boolean;
  profilePictureUrl?: string | null;
  displayName?: string;
  onSignOut?: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <a href="#/about" className={NAV_LINK}>About</a>
      <a href="#/contact" className={NAV_LINK}>Contact</a>
      <a href="#/pricing" className={NAV_LINK}>Pricing</a>

      {!isShopOwner && (
        <a
          href="#/register"
          className="px-3 py-1.5 rounded-lg text-[10px] text-[#FF4500]/70 font-medium tracking-wider uppercase hover:text-[#FF4500] hover:bg-[#FF4500]/[0.06] transition-colors"
        >
          Register Shop
        </a>
      )}

      {user ? (
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.04] dark:bg-white/[0.04] light:bg-black/[0.04] border border-white/[0.08] dark:border-white/[0.08] light:border-black/[0.08] hover:bg-white/[0.06] dark:hover:bg-white/[0.06] light:hover:bg-black/[0.06] transition-colors"
          >
            <UserAvatar profilePictureUrl={profilePictureUrl} displayName={displayName} />
            <span className="text-[10px] text-white/50 dark:text-white/50 light:text-gray-500 font-medium tracking-wider max-w-[80px] truncate">
              {displayName}
            </span>
            <ChevronDown className={`w-3 h-3 text-white/30 dark:text-white/30 light:text-gray-400 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full right-0 mt-2 w-52 rounded-xl overflow-hidden z-[9999] solid-dropdown bg-[#1a1a1a] dark:bg-[#1a1a1a] light:bg-white"
              >
                <div className="py-1.5">
                  <div className="flex items-center gap-3 px-4 py-2.5">
                    <UserAvatar profilePictureUrl={profilePictureUrl} displayName={displayName} size="md" />
                    <div className="min-w-0">
                      <span className="text-xs text-white/70 font-medium truncate block">{displayName}</span>
                      {isShopOwner && (
                        <span className="text-[9px] text-[#FF4500]/60 font-semibold uppercase tracking-wider">Shop Owner</span>
                      )}
                    </div>
                  </div>
                  <div className="h-px bg-white/[0.06] mx-3 my-1" />

                  {isShopOwner ? (
                    <>
                      <DropdownLink href="#/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={() => setMenuOpen(false)} />
                      <DropdownLink href="#/dashboard?tab=profile" icon={Store} label="My Shop" onClick={() => setMenuOpen(false)} />
                      <DropdownLink href="#/dashboard?tab=leads" icon={FileText} label="Leads" onClick={() => setMenuOpen(false)} />
                      <DropdownLink href="#/dashboard?tab=reviews" icon={Star} label="Reviews" onClick={() => setMenuOpen(false)} />
                      <DropdownLink href="#/dashboard?tab=settings" icon={Settings} label="Settings" onClick={() => setMenuOpen(false)} />
                    </>
                  ) : (
                    <>
                      <DropdownLink href="#/my-builds" icon={FolderOpen} label="My Builds" onClick={() => setMenuOpen(false)} />
                      <DropdownLink href="#/auth" icon={UserCircle} label="My Profile" onClick={() => setMenuOpen(false)} />
                    </>
                  )}

                  <div className="h-px bg-white/[0.06] mx-3 my-1" />
                  <button
                    onClick={() => { setMenuOpen(false); onSignOut?.(); }}
                    className="flex items-center gap-3 px-4 py-2.5 text-xs text-white/50 hover:bg-white/[0.04] transition-colors w-full text-left"
                  >
                    <LogOut className="w-3.5 h-3.5 text-white/30" />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <a
            href="#/auth"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] dark:bg-white/[0.04] light:bg-black/[0.04] border border-white/[0.08] dark:border-white/[0.08] light:border-black/[0.08] text-[10px] text-white/50 dark:text-white/50 light:text-gray-500 font-medium tracking-wider uppercase hover:text-white/80 dark:hover:text-white/80 light:hover:text-gray-800 hover:bg-white/[0.06] dark:hover:bg-white/[0.06] light:hover:bg-black/[0.06] transition-colors"
          >
            <User className="w-3 h-3" />
            Login
          </a>
          <a
            href="#/auth?mode=signup"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF4500] text-[10px] text-white font-medium tracking-wider uppercase hover:bg-[#FF5722] transition-colors shadow-lg shadow-[#FF4500]/20"
          >
            Sign Up
          </a>
        </div>
      )}
    </div>
  );
}

function DropdownLink({ href, icon: Icon, label, onClick }: { href: string; icon: React.ElementType; label: string; onClick: () => void }) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 text-xs text-white/50 hover:bg-white/[0.04] hover:text-white/70 transition-colors"
    >
      <Icon className="w-3.5 h-3.5 text-[#FF4500]/70" />
      {label}
    </a>
  );
}

function MobileMenu({
  menuRef,
  menuOpen,
  setMenuOpen,
  user,
  isShopOwner,
  profilePictureUrl,
  displayName,
  onSignOut,
}: {
  menuRef: React.RefObject<HTMLDivElement>;
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
  user?: AuthUser | null;
  isShopOwner?: boolean;
  profilePictureUrl?: string | null;
  displayName?: string;
  onSignOut?: () => void;
}) {
  return (
    <div ref={menuRef}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="w-10 h-10 rounded-xl bg-white/[0.04] dark:bg-white/[0.04] light:bg-black/[0.04] border border-white/[0.08] dark:border-white/[0.08] light:border-black/[0.08] flex items-center justify-center text-white/50 dark:text-white/50 light:text-gray-500 active:bg-white/[0.08] dark:active:bg-white/[0.08] light:active:bg-black/[0.06] transition-colors"
      >
        {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-4 mt-2 w-56 rounded-xl overflow-hidden z-[9999] solid-dropdown bg-[#1a1a1a] dark:bg-[#1a1a1a] light:bg-white"
          >
            <nav className="py-2">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <UserAvatar profilePictureUrl={profilePictureUrl} displayName={displayName} size="md" />
                    <div className="min-w-0">
                      <span className="text-xs text-white/60 font-medium truncate block">{displayName}</span>
                      {isShopOwner && (
                        <span className="text-[9px] text-[#FF4500]/60 font-semibold uppercase tracking-wider">Shop Owner</span>
                      )}
                    </div>
                  </div>
                  <div className="h-px bg-white/[0.06] mx-3" />

                  {isShopOwner ? (
                    <>
                      <MobileNavLink href="#/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={() => setMenuOpen(false)} />
                      <MobileNavLink href="#/dashboard?tab=profile" icon={Store} label="My Shop" onClick={() => setMenuOpen(false)} />
                      <MobileNavLink href="#/dashboard?tab=leads" icon={FileText} label="Leads" onClick={() => setMenuOpen(false)} />
                      <MobileNavLink href="#/dashboard?tab=reviews" icon={Star} label="Reviews" onClick={() => setMenuOpen(false)} />
                      <MobileNavLink href="#/dashboard?tab=settings" icon={Settings} label="Settings" onClick={() => setMenuOpen(false)} />
                    </>
                  ) : (
                    <>
                      <MobileNavLink href="#/my-builds" icon={FolderOpen} label="My Builds" onClick={() => setMenuOpen(false)} />
                      <MobileNavLink href="#/auth" icon={UserCircle} label="My Profile" onClick={() => setMenuOpen(false)} />
                      <div className="h-px bg-white/[0.06] mx-3" />
                      <MobileNavLink href="#/register" icon={Store} label="Register Your Shop" onClick={() => setMenuOpen(false)} />
                    </>
                  )}

                  <div className="h-px bg-white/[0.06] mx-3" />
                  <MobileNavLink href="#/about" icon={Info} label="About" onClick={() => setMenuOpen(false)} />
                  <MobileNavLink href="#/contact" icon={MessageSquare} label="Contact" onClick={() => setMenuOpen(false)} />
                  <MobileNavLink href="#/pricing" icon={CreditCard} label="Pricing" onClick={() => setMenuOpen(false)} />
                  <div className="h-px bg-white/[0.06] mx-3" />
                  <button
                    onClick={() => { setMenuOpen(false); onSignOut?.(); }}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-white/60 active:bg-white/[0.06] transition-colors w-full text-left"
                  >
                    <LogOut className="w-4 h-4 text-white/30" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <MobileNavLink href="#/about" icon={Info} label="About" onClick={() => setMenuOpen(false)} />
                  <MobileNavLink href="#/contact" icon={MessageSquare} label="Contact" onClick={() => setMenuOpen(false)} />
                  <MobileNavLink href="#/pricing" icon={CreditCard} label="Pricing" onClick={() => setMenuOpen(false)} />
                  <div className="h-px bg-white/[0.06] mx-3" />
                  <MobileNavLink href="#/auth" icon={User} label="Login" onClick={() => setMenuOpen(false)} />
                  <MobileNavLink href="#/auth?mode=signup" icon={User} label="Sign Up" onClick={() => setMenuOpen(false)} />
                  <div className="h-px bg-white/[0.06] mx-3" />
                  <MobileNavLink href="#/register" icon={Store} label="Register Your Shop" onClick={() => setMenuOpen(false)} />
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileNavLink({ href, icon: Icon, label, onClick }: { href: string; icon: React.ElementType; label: string; onClick: () => void }) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 text-sm text-white/60 active:bg-white/[0.06] transition-colors"
    >
      <Icon className="w-4 h-4 text-[#FF4500]" />
      {label}
    </a>
  );
}
