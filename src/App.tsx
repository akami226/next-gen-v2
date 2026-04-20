import { useState, useCallback, useMemo, useRef, useEffect, type ComponentProps } from 'react';
import Header from './components/Header';
import { SEO_CONFIGS } from './hooks/useSEO';
import LeftPanel from './components/LeftPanel';
import CenterCanvasLazy from './components/CenterCanvasLazy';
import RightPanel from './components/RightPanel';
import MobileCarSelector from './components/MobileCarSelector';
import MobileModTabs from './components/MobileModTabs';
import ConfiguratorActions from './components/ConfiguratorActions';
import NotificationToast from './components/NotificationToast';
import RegisterPage from './pages/RegisterPage';
import PasswordGate from './pages/PasswordGate';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import MyBuildsPage, { type SavedBuild } from './pages/MyBuildsPage';
import ShopProfilePage from './pages/ShopProfilePage';
import DashboardPage from './pages/DashboardPage';
import PricingPage from './pages/PricingPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import { useAdmin } from './hooks/useAdmin';
import data from './data.json';
import { useHashRoute } from './hooks/useHashRoute';
import { useBreakpoint } from './hooks/useMediaQuery';
import { useAuth } from './hooks/useAuth';
import { useNotifications } from './hooks/useNotifications';
import { WHEEL_OPTIONS } from './data/wheelOptions';
import { calculateBuildPrice } from './data/pricing';
import EstimatedCost from './components/EstimatedCost';
import type { Wrap, CarOption, TintOption, BuildConfig, Shop, ShopNotification } from './types';

const cars = data.cars as CarOption[];
const shops = data.shops as Shop[];

const TINT_OPTIONS: TintOption[] = [
  {
    id: 'no_tint',
    name: 'No Tint',
    brand: 'Factory Clear',
    vlt: '100% VLT',
    opacity: 0.10,
    color: null,
    material: { opacity: 0.10, color: '#87CEEB', roughness: 0.0, metalness: 0.0 },
  },
  {
    id: 'light_tint',
    name: 'Light Tint',
    brand: 'LLumar CTX',
    vlt: '50% VLT',
    opacity: 0.25,
    color: '#1a1a1a',
    material: { opacity: 0.25, color: '#1a1a1a', roughness: 0.0, metalness: 0.0 },
  },
  {
    id: 'medium_tint',
    name: 'Medium Tint',
    brand: 'XPEL XR Plus',
    vlt: '35% VLT',
    opacity: 0.50,
    color: '#0d0d0d',
    material: { opacity: 0.50, color: '#0d0d0d', roughness: 0.0, metalness: 0.0 },
  },
  {
    id: 'limo_tint',
    name: 'Limo Tint',
    brand: '3M Crystalline',
    vlt: '5% VLT',
    opacity: 0.85,
    color: '#030303',
    material: { opacity: 0.85, color: '#030303', roughness: 0.0, metalness: 0.0 },
  },
];

const DEFAULT_WRAP_INDEX = 0;

function App() {
  const { route, navigate } = useHashRoute();
  const { isMobile, isTablet } = useBreakpoint();
  const { user, loading: authLoading, isShopOwner, shopOwnerData, signUp, signIn, signOut, resetPassword, refreshShopOwner } = useAuth();
  const { notifications, toast, markRead, markAllRead, deleteNotification, dismissToast } = useNotifications(isShopOwner);
  const [authenticated, setAuthenticated] = useState(false);
  const [selectedCarIndex, setSelectedCarIndex] = useState(0);
  const [selectedWrapIndex, setSelectedWrapIndex] = useState(DEFAULT_WRAP_INDEX);
  const [suspensionHeight, setSuspensionHeight] = useState(0);
  const [selectedTint, setSelectedTint] = useState(0);
  const [selectedWheelIndex, setSelectedWheelIndex] = useState(0);
  const [selectedExhaustIndex, setSelectedExhaustIndex] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const wraps = data.wraps as Wrap[];

  const requiresAuth = useCallback((r: string) => {
    if (r === '/my-builds') return true;
    if (r === '/dashboard' || r.startsWith('/dashboard?')) return true;
    if (r === '/dashboard/preview') return true;
    return false;
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (user || !requiresAuth(route)) return;
    navigate('/auth');
  }, [authLoading, user, route, navigate, requiresAuth]);

  useEffect(() => {
    if (!route.startsWith('/shop/')) return;
    const shopId = route.replace('/shop/', '');
    if (!shops.find((s) => s.id === shopId)) {
      navigate('/configurator');
    }
  }, [route, navigate]);

  useEffect(() => {
    if (route === '/configurator' || (route !== '/' && route !== '' && !route.startsWith('/about') && !route.startsWith('/contact') && !route.startsWith('/auth') && !route.startsWith('/register') && !route.startsWith('/pricing') && !route.startsWith('/my-builds') && !route.startsWith('/dashboard') && !route.startsWith('/shop/') && !route.startsWith('/admin'))) {
      document.title = SEO_CONFIGS.configurator.title;
    }
  }, [route]);

  const handleCarChange = useCallback((index: number) => {
    if (index === selectedCarIndex) return;
    setSelectedCarIndex(index);
    setSelectedWrapIndex(DEFAULT_WRAP_INDEX);
    setSuspensionHeight(0);
    setSelectedTint(0);
    setSelectedWheelIndex(0);
    setSelectedExhaustIndex(null);
  }, [selectedCarIndex]);

  const buildConfig: BuildConfig = useMemo(() => {
    const car = cars[selectedCarIndex];
    const wrap = wraps[selectedWrapIndex];
    const wheel = WHEEL_OPTIONS[selectedWheelIndex];
    const tint = TINT_OPTIONS[selectedTint];
    const exhaust = selectedExhaustIndex !== null
      ? car.exhaustOptions[selectedExhaustIndex]
      : null;

    return {
      car: `${car.brand} ${car.model}`,
      wrap: `${wrap.brand} ${wrap.name}`,
      wheels: `${wheel.brand} ${wheel.model}`,
      tint: `${tint.brand} ${tint.vlt}`,
      exhaust: exhaust ? `${exhaust.brand} ${exhaust.product}` : 'None',
    };
  }, [selectedCarIndex, selectedWrapIndex, selectedWheelIndex, selectedTint, selectedExhaustIndex, wraps]);

  const buildIndices = useMemo(() => ({
    carIndex: selectedCarIndex,
    wrapIndex: selectedWrapIndex,
    wheelIndex: selectedWheelIndex,
    tintIndex: selectedTint,
  }), [selectedCarIndex, selectedWrapIndex, selectedWheelIndex, selectedTint]);

  const selectedExhaustPrice = useMemo(() => {
    if (selectedExhaustIndex === null) return 0;
    return cars[selectedCarIndex].exhaustOptions[selectedExhaustIndex]?.price ?? 0;
  }, [selectedCarIndex, selectedExhaustIndex]);

  const buildPrice = useMemo(() => calculateBuildPrice(
    wraps[selectedWrapIndex],
    WHEEL_OPTIONS[selectedWheelIndex].id,
    TINT_OPTIONS[selectedTint].id,
    suspensionHeight,
    selectedExhaustPrice
  ), [wraps, selectedWrapIndex, selectedWheelIndex, selectedTint, suspensionHeight, selectedExhaustPrice]);

  const handleScreenshot = useCallback(() => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `nextgen-${buildConfig.car.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = dataUrl;
    link.click();
  }, [buildConfig.car]);

  const handleLoadBuild = useCallback((build: SavedBuild) => {
    setSelectedCarIndex(build.car_index);
    setSelectedWrapIndex(build.wrap_index);
    setSelectedWheelIndex(build.wheel_index);
    setSelectedTint(build.tint_index);
    navigate('/configurator');
  }, [navigate]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    navigate('/');
  }, [signOut, navigate]);

  const handleNavigateShop = useCallback((shopId: string) => {
    navigate(`/shop/${shopId}`);
  }, [navigate]);

  const handleViewAllNotifications = useCallback(() => {
    navigate('/dashboard?tab=notifications');
  }, [navigate]);

  const handleClickNotification = useCallback((notification: ShopNotification) => {
    if (notification.type === 'new_lead' || notification.type === 'new_quote') {
      navigate('/dashboard?tab=leads');
    } else if (notification.type === 'new_review') {
      navigate('/dashboard?tab=reviews');
    }
  }, [navigate]);

  const headerProps: ComponentProps<typeof Header> = {
    user,
    isShopOwner,
    profilePictureUrl: shopOwnerData?.profile_picture_url,
    onSignOut: handleSignOut,
    notifications,
    onMarkRead: markRead,
    onMarkAllRead: markAllRead,
    onViewAllNotifications: handleViewAllNotifications,
    onClickNotification: handleClickNotification,
  };

  if (!authenticated) {
    return <PasswordGate onSuccess={() => setAuthenticated(true)} />;
  }

  if (route === '/admin') {
    return <AdminLoginWrapper navigate={navigate} />;
  }

  if (route === '/admin/dashboard') {
    return <AdminDashboardWrapper navigate={navigate} />;
  }

  if (route === '/' || route === '') {
    return <LandingPage onStart={() => navigate('/configurator')} {...headerProps} />;
  }

  if (route === '/about') {
    return (
      <AboutPage
        onBack={() => navigate('/')}
        onStartConfiguring={() => navigate('/configurator')}
        onRegisterShop={() => navigate('/register')}
        {...headerProps}
      />
    );
  }

  if (route === '/contact') {
    return <ContactPage onBack={() => navigate('/')} {...headerProps} />;
  }

  if (route === '/auth' || route.startsWith('/auth?')) {
    const authMode = route.includes('mode=signup') ? 'signup' : 'login';
    return (
      <AuthPage
        initialMode={authMode}
        onSignUp={async (name, email, password) => {
          await signUp(name, email, password);
        }}
        onSignIn={async (email, password) => {
          const result = await signIn(email, password);
          await refreshShopOwner(result.user.id);
          const { supabase } = await import('./lib/supabase');
          const { data: ownerCheck } = await supabase
            .from('shop_owners')
            .select('id')
            .eq('user_id', result.user.id)
            .maybeSingle();
          navigate(ownerCheck ? '/dashboard' : '/configurator');
        }}
        onResetPassword={resetPassword}
        onBack={() => navigate('/')}
      />
    );
  }

  if (route === '/my-builds') {
    if (authLoading) {
      return <AuthLoadingShell />;
    }
    if (!user) {
      return null;
    }
    return (
      <MyBuildsPage
        user={user}
        onBack={() => navigate('/configurator')}
        onLoadBuild={handleLoadBuild}
        onNewBuild={() => navigate('/configurator')}
      />
    );
  }

  if (route === '/register') {
    return <RegisterPage onComplete={() => navigate('/auth')} />;
  }

  if (route === '/pricing') {
    return (
      <PricingPage
        onBack={() => navigate('/configurator')}
        onGetStarted={() => navigate('/register')}
        {...headerProps}
      />
    );
  }

  if (route === '/dashboard/preview') {
    if (authLoading) {
      return <AuthLoadingShell />;
    }
    if (!user) {
      return null;
    }
    const demoShop = shops[0];
    const previewShop: Shop = {
      ...demoShop,
      logoUrl: shopOwnerData?.logo_url,
      bannerUrl: shopOwnerData?.banner_url,
    };
    return (
      <ShopProfilePage
        shop={previewShop}
        buildConfig={buildConfig}
        user={user}
        onBack={() => navigate('/dashboard')}
        onNavigateAuth={() => navigate('/auth')}
        isPreview
        onExitPreview={() => navigate('/dashboard')}
      />
    );
  }

  if (route === '/dashboard' || route.startsWith('/dashboard?')) {
    if (authLoading) {
      return <AuthLoadingShell />;
    }
    if (!user) {
      return null;
    }
    const demoShop = shops[0];
    const tabParam = route.includes('?tab=') ? route.split('?tab=')[1] : undefined;
    return (
      <>
        <DashboardPage
          shop={demoShop}
          shopOwnerData={shopOwnerData}
          user={user}
          initialTab={tabParam}
          onSignOut={handleSignOut}
          onBack={() => navigate('/configurator')}
          onBrandingUpdate={refreshShopOwner}
          onPreviewShop={() => navigate('/dashboard/preview')}
          notifications={notifications}
          onMarkRead={markRead}
          onMarkAllRead={markAllRead}
          onDeleteNotification={deleteNotification}
          onViewAllNotifications={handleViewAllNotifications}
          onClickNotification={handleClickNotification}
        />
        <NotificationToast notification={toast} onDismiss={dismissToast} />
      </>
    );
  }

  if (route.startsWith('/shop/')) {
    const shopId = route.replace('/shop/', '');
    const shop = shops.find(s => s.id === shopId);
    if (!shop) {
      return null;
    }
    return (
      <ShopProfilePage
        shop={shop}
        buildConfig={buildConfig}
        user={user}
        onBack={() => navigate('/configurator')}
        onNavigateAuth={() => navigate('/auth')}
      />
    );
  }

  const selectedCar = cars[selectedCarIndex];
  const canvasProps = {
    selectedWrap: wraps[selectedWrapIndex],
    carFile: selectedCar.file,
    carLabel: `${selectedCar.brand} ${selectedCar.model}`,
    suspensionHeight,
    tint: TINT_OPTIONS[selectedTint],
    wheelIndex: selectedWheelIndex,
    canvasRef,
  };

  const modProps = {
    cars,
    selectedCarIndex,
    wraps,
    selectedWrap: selectedWrapIndex,
    onWrapChange: setSelectedWrapIndex,
    suspensionHeight,
    onSuspensionChange: setSuspensionHeight,
    tintOptions: TINT_OPTIONS,
    selectedTint,
    onTintChange: setSelectedTint,
    selectedWheelIndex,
    onWheelChange: setSelectedWheelIndex,
    selectedExhaustIndex,
    onExhaustChange: setSelectedExhaustIndex,
  };

  const estimatedPriceLabel = buildPrice.total.high > 0
    ? `$${buildPrice.total.low.toLocaleString()} - $${buildPrice.total.high.toLocaleString()}`
    : undefined;

  const actionsBar = (
    <ConfiguratorActions
      buildConfig={buildConfig}
      buildIndices={buildIndices}
      user={user}
      shops={shops}
      onScreenshot={handleScreenshot}
      onNavigateAuth={() => navigate('/auth')}
      estimatedPrice={estimatedPriceLabel}
    />
  );

  const costPanel = <EstimatedCost breakdown={buildPrice} />;

  if (isMobile) {
    return (
      <>
        <div className="h-[100dvh] min-h-0 w-full max-w-[100vw] bg-[#080808] dark:bg-[#080808] light:bg-[#f0f0f2] flex flex-col overflow-hidden font-sans antialiased">
          <Header {...headerProps} />
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden momentum-scroll">
            <MobileCarSelector
              cars={cars}
              selectedCarIndex={selectedCarIndex}
              onCarChange={handleCarChange}
            />
            <div className="px-3 py-3">
              <CenterCanvasLazy {...canvasProps} isMobile />
            </div>
            <div className="px-3 pb-3 flex justify-center">
              {actionsBar}
            </div>
            <MobileModTabs {...modProps} />
            <div className="p-3">
              <RightPanel shops={shops} buildConfig={buildConfig} onNavigateShop={handleNavigateShop} />
            </div>
          </div>
          <div className="shrink-0 px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] bg-[#080808] dark:bg-[#080808] light:bg-[#f0f0f2] border-t border-white/[0.06] dark:border-white/[0.06] light:border-black/[0.08]">
            {costPanel}
          </div>
        </div>
        {isShopOwner && <NotificationToast notification={toast} onDismiss={dismissToast} />}
      </>
    );
  }

  if (isTablet) {
    return (
      <>
        <div className="h-[100dvh] min-h-0 w-full max-w-[100vw] bg-[#080808] dark:bg-[#080808] light:bg-[#f0f0f2] flex flex-col overflow-hidden overflow-x-hidden font-sans antialiased">
          <Header {...headerProps} />
          <div className="flex-1 flex gap-2 sm:gap-3 p-2 sm:p-3 min-h-0">
            <div className="w-[min(42%,20rem)] min-w-[11rem] max-w-[45%] overflow-y-auto custom-scrollbar momentum-scroll">
              <LeftPanel
                {...modProps}
                onCarChange={handleCarChange}
              />
            </div>
            <div className="flex-1 min-w-0 flex flex-col">
              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar momentum-scroll">
                <div className="min-h-[45vh] sm:min-h-[50vh] relative">
                  <CenterCanvasLazy {...canvasProps} />
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20">
                    {actionsBar}
                  </div>
                </div>
                <div className="pt-2 sm:pt-3 px-1">
                  <RightPanel shops={shops} buildConfig={buildConfig} onNavigateShop={handleNavigateShop} />
                </div>
              </div>
              <div className="shrink-0 pt-2 sm:pt-3">{costPanel}</div>
            </div>
          </div>
        </div>
        {isShopOwner && <NotificationToast notification={toast} onDismiss={dismissToast} />}
      </>
    );
  }

  return (
    <>
      <div className="h-[100dvh] min-h-0 w-full max-w-[100vw] bg-[#080808] dark:bg-[#080808] light:bg-[#f0f0f2] flex flex-col overflow-hidden overflow-x-hidden font-sans antialiased">
        <Header user={user} isShopOwner={isShopOwner} profilePictureUrl={shopOwnerData?.profile_picture_url} onSignOut={handleSignOut} notifications={notifications} onMarkRead={markRead} onMarkAllRead={markAllRead} onViewAllNotifications={handleViewAllNotifications} onClickNotification={handleClickNotification} />
        <div className="flex-1 flex gap-3 lg:gap-4 p-3 lg:p-4 min-h-0">
          <div className="w-[22%] min-w-[12rem] max-w-[28%] xl:max-w-none xl:w-1/4">
            <LeftPanel
              {...modProps}
              onCarChange={handleCarChange}
            />
          </div>
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex-1 relative min-h-0">
              <CenterCanvasLazy {...canvasProps} />
              <div className="absolute top-2 right-2 lg:top-3 lg:right-3 z-20">
                {actionsBar}
              </div>
            </div>
            <div className="shrink-0 pt-2 lg:pt-3">{costPanel}</div>
          </div>
          <div className="w-[22%] min-w-[12rem] max-w-[28%] xl:max-w-none xl:w-1/4">
            <RightPanel shops={shops} buildConfig={buildConfig} onNavigateShop={handleNavigateShop} />
          </div>
        </div>
      </div>
      {isShopOwner && <NotificationToast notification={toast} onDismiss={dismissToast} />}
    </>
  );
}

function AuthLoadingShell() {
  return (
    <div className="h-screen w-screen bg-[#080808] dark:bg-[#080808] light:bg-[#f0f0f2] flex items-center justify-center font-sans">
      <div className="flex flex-col items-center gap-3">
        <div className="w-7 h-7 border-2 border-[#FF4500] light:border-[#2563EB] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-white/40 light:text-gray-500">Checking your session…</p>
      </div>
    </div>
  );
}

function AdminLoginWrapper({ navigate }: { navigate: (path: string) => void }) {
  const { isAdmin, loading, signIn } = useAdmin();

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#080808] dark:bg-[#080808] light:bg-[#f0f0f2] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#FF4500] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAdmin) {
    navigate('/admin/dashboard');
    return null;
  }

  return (
    <AdminLoginPage
      onLogin={async (email, password) => {
        await signIn(email, password);
        navigate('/admin/dashboard');
      }}
      onBack={() => navigate('/')}
    />
  );
}

function AdminDashboardWrapper({ navigate }: { navigate: (path: string) => void }) {
  const { isAdmin, loading, signOut } = useAdmin();

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#080808] dark:bg-[#080808] light:bg-[#f0f0f2] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#FF4500] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    navigate('/admin');
    return null;
  }

  return (
    <AdminDashboardPage
      onSignOut={async () => {
        await signOut();
        navigate('/');
      }}
      onBack={() => navigate('/')}
    />
  );
}

export default App;
