'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { onAuthStateChanged, getRedirectResult, User, signInWithRedirect, signInWithPopup, signInAnonymously, signOut } from 'firebase/auth';
import { doc, onSnapshot, query, collection, where, limit, setDoc, addDoc, orderBy } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType, googleProvider } from '@/firebase';
import { UserProfile, Shift, Receipt, WeatherData, VeroContextType } from '@/types';
import { YEL_THRESHOLD_2026, VAT_THRESHOLD_2026, checkThresholds, ThresholdStatus } from '@/lib/tax-engine';
import { calculateDistance, reverseGeocode } from '@/lib/utils';
import { parseVoiceCommand } from '@/lib/ocr-service';
import { initDB, getPendingSync, clearPendingSync, getOfflineShifts, getOfflineReceipts } from '@/lib/offline-storage';

const VeroContext = createContext<VeroContextType | undefined>(undefined);

export function VeroProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isNightMode, setIsNightMode] = useState(false);
  const [isDrivingMode, setIsDrivingMode] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isTracking, setIsTracking] = useState(false);
  const [trackedDistance, setTrackedDistance] = useState(0);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [isWipingData, setIsWipingDataState] = useState(false);
  const [suppressProfileAutoCreate, setSuppressProfileAutoCreate] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [currentGpsPoints, setCurrentGpsPoints] = useState<{ lat: number; lng: number; timestamp: string }[]>([]);
  const [startAddress, setStartAddress] = useState<string>("");
  const [endAddress, setEndAddress] = useState<string>("");
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [odometerStartValue, setOdometerStartValue] = useState<number | undefined>();
  const [purposeValue, setPurposeValue] = useState<string>("Food Delivery");
  const [lastPosition, setLastPosition] = useState<GeolocationPosition | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true);
  const weatherFetchRef = useRef<{ lat: number; lng: number; fetchedAt: number } | null>(null);
  const locationErrorNotifiedRef = useRef(false);
  const getActiveDataKey = useCallback((p?: UserProfile | null) => p?.activeDataKey || 'primary', []);
  const getScopeUid = useCallback((uid: string, activeDataKey: string) => `${uid}_${activeDataKey}`, []);

  const login = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setNotification({
        message: 'Connected to Firebase successfully.',
        type: 'success'
      });
    } catch (error) {
      console.error('Login failed:', error);
      const code = (error as any)?.code || 'unknown';
      let message = 'Google sign-in failed.';
      
      if (code === 'auth/unauthorized-domain') {
        message = 'This domain is not authorized in Firebase. Add localhost to Authorized Domains.';
      } else if (code === 'auth/popup-blocked') {
        message = 'Login popup was blocked by your browser. Please allow popups.';
      } else if (code === 'auth/popup-closed-by-user') {
        message = 'Login popup was closed before completion.';
      }
      
      setNotification({ message, type: 'error' });
    }
  }, []);

  const guestLogin = useCallback(async () => {
    try {
      await signInAnonymously(auth);
      setNotification({
        message: 'Connected in guest mode.',
        type: 'info'
      });
      setLoading(false);
    } catch (error) {
      console.error('Guest sign-in failed:', error);
      setNotification({
        message: 'Guest login failed. Enable Anonymous sign-in in Firebase Authentication.',
        type: 'error'
      });
    }
  }, []);
  const logout = useCallback(() => signOut(auth), []);
  const setIsWipingData = useCallback((val: boolean) => {
    setIsWipingDataState(val);
    if (val) {
      setSuppressProfileAutoCreate(true);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);

        if (!isMounted || !result) {
          return;
        }

        setNotification({
          message: result.user.isAnonymous
            ? 'Connected in guest mode.'
            : 'Connected to Firebase successfully.',
          type: 'success'
        });
        setLoading(false);
      } catch (error) {
        console.error('Firebase redirect sign-in failed:', error);

        const code = error instanceof Error && 'code' in error ? String((error as { code?: string }).code) : '';
        setNotification({
          message: code === 'auth/unauthorized-domain'
            ? 'This domain is not authorized in Firebase Auth. Add localhost and your app domain in the Firebase console.'
            : `Firebase sign-in failed after redirect (${code || 'unknown error'}). Check Google sign-in and anonymous auth in Firebase Console.`,
          type: 'error'
        });
        setLoading(false);
      }
    };

    handleRedirectResult();

    // Global Notifications Listener
    const globalNotesQ = query(collection(db, 'global_notifications'), orderBy('timestamp', 'desc'), limit(1));
    const unsubGlobal = onSnapshot(globalNotesQ, (snap) => {
      if (snap.empty) return;
      const latestNote = snap.docs[0].data();
      
      // Only show if it's new (last 5 minutes) and not previously seen in this session
      const now = Date.now();
      if (now - latestNote.timestamp < 300000) { // 5 minutes window
        setNotification({ 
          message: `📢 ${latestNote.message}`, 
          type: (latestNote.type as any) || 'info' 
        });
      }
    });

    return () => {
      isMounted = false;
      unsubGlobal();
    };
  }, []);

  // --- Derived State ---
  const shiftGross = shifts.reduce((acc, s) => acc + s.grossPay, 0);
  const shiftDistance = shifts.reduce((acc, s) => acc + s.distanceKm, 0);
  
  const annualGross = Math.max(profile?.totalGross || 0, shiftGross);
  const totalDistance = Math.max(profile?.totalDistance || 0, shiftDistance);
  
  const isOverYel = annualGross > YEL_THRESHOLD_2026;
  const isApproachingYel = !isOverYel && annualGross > (YEL_THRESHOLD_2026 * 0.8);

  const isOverVat = annualGross > VAT_THRESHOLD_2026;
  const isApproachingVat = !isOverVat && annualGross > (VAT_THRESHOLD_2026 * 0.85);
  const isVatRegistered = !!profile?.isVatRegistered;

  const thresholdStatus = React.useMemo(() => {
    return checkThresholds(annualGross, isVatRegistered);
  }, [annualGross, isVatRegistered]);

  const isElite = profile?.subscription?.tier === 'elite';
  const isPro = profile?.subscription?.tier === 'pro' || isElite;

  // --- Peak Performance Intelligence ---
  const peakPerformance = React.useMemo(() => {
    if (shifts.length < 3) return null;

    const dayStats: Record<string, { totalPay: number; totalMin: number }> = {};
    const hourStats: Record<number, { totalPay: number; totalMin: number }> = {};
    const platformStats: Record<string, { totalPay: number; totalMin: number }> = {};

    shifts.forEach(s => {
      const date = new Date(s.date);
      const day = date.toLocaleDateString('en-GB', { weekday: 'long' });
      const hour = date.getHours();
      const duration = s.durationMin || 0;
      const pay = s.grossPay;

      if (!dayStats[day]) dayStats[day] = { totalPay: 0, totalMin: 0 };
      dayStats[day].totalPay += pay;
      dayStats[day].totalMin += duration;

      if (!hourStats[hour]) hourStats[hour] = { totalPay: 0, totalMin: 0 };
      hourStats[hour].totalPay += pay;
      hourStats[hour].totalMin += duration;

      if (!platformStats[s.app]) platformStats[s.app] = { totalPay: 0, totalMin: 0 };
      platformStats[s.app].totalPay += pay;
      platformStats[s.app].totalMin += duration;
    });

    const getBest = (stats: Record<string | number, { totalPay: number; totalMin: number }>) => {
      let bestKey = '';
      let maxRate = 0;
      Object.entries(stats).forEach(([key, val]) => {
        const rate = val.totalMin > 0 ? (val.totalPay / (val.totalMin / 60)) : 0;
        if (rate > maxRate) {
          maxRate = rate;
          bestKey = key;
        }
      });
      return { key: bestKey, rate: maxRate };
    };

    const bestDay = getBest(dayStats);
    const bestHour = getBest(hourStats);
    
    const platformEfficiency = Object.entries(platformStats).map(([name, val]) => ({
      name,
      rate: val.totalMin > 0 ? (val.totalPay / (val.totalMin / 60)) : 0
    })).sort((a, b) => b.rate - a.rate);

    return {
      bestDay: bestDay.key || 'N/A',
      bestTime: bestHour.key ? `${bestHour.key}:00` : 'N/A',
      hourlyRate: bestDay.rate,
      platformEfficiency
    };
  }, [shifts]);

  // --- Data Fetching ---
  const fetchProfile = useCallback((uid: string) => {
    const docRef = doc(db, 'profiles', uid);
    return onSnapshot(docRef, async (docSnap) => {
      if (docSnap.exists()) {
        const loaded = docSnap.data() as UserProfile;
        if (!loaded.activeDataKey) {
          await setDoc(docRef, { activeDataKey: 'primary' }, { merge: true });
          setProfile({ ...loaded, activeDataKey: 'primary' });
        } else {
          setProfile(loaded);
        }
      } else {
        if (isWipingData || suppressProfileAutoCreate) {
          setProfile(null);
          setLoading(false);
          return;
        }

        const newProfile: UserProfile = { 
          uid, 
          activeDataKey: 'primary',
          displayName: auth.currentUser?.displayName || 'Courier', 
          taxRate: 0.15, 
          totalGross: 0 
        };
        await setDoc(docRef, newProfile);
        setProfile(newProfile);
      }
    }, (e) => handleFirestoreError(e, OperationType.GET, `profiles/${uid}`));
  }, [isWipingData, suppressProfileAutoCreate]);

  const fetchShifts = useCallback((uid: string, activeDataKey: string) => {
    const q = query(collection(db, 'shifts'), where('scopeUid', '==', getScopeUid(uid, activeDataKey)), limit(200));

    return onSnapshot(q, (snapshot) => {
      const s = snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() } as Shift));
      const sorted = s.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 50);

      setShifts(sorted);
      localStorage.setItem(`shifts_${uid}_${activeDataKey}`, JSON.stringify(sorted));
      setLoading(false);
    }, (e) => handleFirestoreError(e, OperationType.LIST, 'shifts'));
  }, [getScopeUid]);

  const fetchReceipts = useCallback((uid: string, activeDataKey: string) => {
    const q = query(collection(db, 'receipts'), where('scopeUid', '==', getScopeUid(uid, activeDataKey)), limit(200));

    return onSnapshot(q, (snapshot) => {
      const r = snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() } as Receipt));
      const sorted = r.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 50);

      setReceipts(sorted);
      localStorage.setItem(`receipts_${uid}_${activeDataKey}`, JSON.stringify(sorted));
    }, (e) => handleFirestoreError(e, OperationType.LIST, 'receipts'));
  }, [getScopeUid]);

  // Separate effect for loading cache to avoid synchronous setState in effect warning
  useEffect(() => {
    if (!user || !profile) return;
    const activeDataKey = getActiveDataKey(profile);
    const cachedShifts = localStorage.getItem(`shifts_${user.uid}_${activeDataKey}`);
    const cachedReceipts = localStorage.getItem(`receipts_${user.uid}_${activeDataKey}`);
    
    // Defer to next tick to avoid cascading render warning
    setTimeout(() => {
      if (cachedShifts) setShifts(JSON.parse(cachedShifts));
      if (cachedReceipts) setReceipts(JSON.parse(cachedReceipts));
    }, 0);
  }, [user, profile, getActiveDataKey]);

  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), 5000);

    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=apparent_temperature`,
        { signal: timeoutController.signal }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      if (data.current_weather) {
        const code = data.current_weather.weathercode;
        let condition = "Clear";
        if (code >= 1 && code <= 3) condition = "Cloudy";
        else if (code >= 45 && code <= 48) condition = "Foggy";
        else if (code >= 51 && code <= 67) condition = "Rainy";
        else if (code >= 71 && code <= 77) condition = "Snowy";
        else if (code >= 80 && code <= 82) condition = "Showers";
        else if (code >= 85 && code <= 86) condition = "Snow Showers";
        else if (code >= 95) condition = "Thunderstorm";

        const now = new Date();
        const hourIndex = now.getHours();
        const apparentTemp = data.hourly?.apparent_temperature?.[hourIndex] || data.current_weather.temperature;

        // Get location name
        const locationName = await reverseGeocode(lat, lon);

        setWeather({
          temp: Math.round(data.current_weather.temperature),
          feelsLike: Math.round(apparentTemp),
          condition: condition,
          locationName: locationName || "Unknown Location"
        });
      }
    } catch {
      // Keep previous weather state when provider fetch fails.
    } finally {
      clearTimeout(timeoutId);
    }
  }, []);

  const scheduleWeatherFetch = useCallback((lat: number, lon: number) => {
    setTimeout(() => {
      void fetchWeather(lat, lon);
    }, 0);
  }, [fetchWeather]);

  const requestLocationAccess = useCallback(() => {
    if (!navigator.geolocation) {
      setNotification({ message: 'Geolocation is not supported by this browser.', type: 'error' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        locationErrorNotifiedRef.current = false;
      },
      (error) => {
        if (locationErrorNotifiedRef.current) return;
        locationErrorNotifiedRef.current = true;

        if (error.code === error.PERMISSION_DENIED) {
          setNotification({ message: 'Location permission denied. Allow GPS in browser site settings for live tracking.', type: 'error' });
          return;
        }

        setNotification({ message: 'Unable to get current GPS location. Check device location services and retry.', type: 'error' });
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
    );
  }, [setNotification]);

  const refreshWeatherAtLocation = useCallback((lat: number, lng: number) => {
    setCurrentLocation({ lat, lng });
    scheduleWeatherFetch(lat, lng);
    weatherFetchRef.current = {
      lat,
      lng,
      fetchedAt: Date.now(),
    };
  }, [scheduleWeatherFetch]);

  const hydrateDemoData = useCallback((payload: { profile: UserProfile; shifts: Shift[]; receipts: Receipt[] }) => {
    setProfile(payload.profile);
    setShifts(payload.shifts);
    setReceipts(payload.receipts);
    setLoading(false);

    if (payload.profile.uid) {
      const activeDataKey = payload.profile.activeDataKey || 'primary';
      localStorage.setItem(`shifts_${payload.profile.uid}_${activeDataKey}`, JSON.stringify(payload.shifts));
      localStorage.setItem(`receipts_${payload.profile.uid}_${activeDataKey}`, JSON.stringify(payload.receipts));
    }
  }, []);

  const refreshData = useCallback(() => {
    // Snapshot listeners automatically handle reactivity. Manual refresh is not needed 
    // and was causing memory leaks and race conditions by spawning duplicate 
    // unmanaged listeners.
  }, []);

  // --- Offline Sync Logic ---
  const syncOfflineData = useCallback(async () => {
    if (!user || !navigator.onLine) return;
    
    try {
      const pending = await getPendingSync();
      if (pending.length === 0) return;

      setNotification({ message: `Syncing ${pending.length} offline records...`, type: 'info' });

      for (const item of pending) {
        const activeDataKey = getActiveDataKey(profile);
        const scopedData = { ...item.data, uid: user.uid, scopeUid: getScopeUid(user.uid, activeDataKey) };
        if (item.type === 'shift') {
          await addDoc(collection(db, 'shifts'), scopedData);
        } else if (item.type === 'receipt') {
          await addDoc(collection(db, 'receipts'), scopedData);
        }
        await clearPendingSync(item.id!);
      }

      setNotification({ message: "Sync complete!", type: 'success' });
      refreshData();
    } catch (e) {
      console.error("Sync failed:", e);
    }
  }, [user, profile, refreshData, setNotification, getActiveDataKey, getScopeUid]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineData();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (navigator.onLine) {
      setTimeout(() => syncOfflineData(), 0);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncOfflineData]);

  useEffect(() => {
    if (!navigator.geolocation) return;

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        locationErrorNotifiedRef.current = false;
      },
      (error) => {
        if (locationErrorNotifiedRef.current) return;
        locationErrorNotifiedRef.current = true;

        if (error.code === error.PERMISSION_DENIED) {
          setNotification({ message: 'GPS blocked. Enable location access in your browser for this app.', type: 'error' });
        }
      },
      { enableHighAccuracy: false, maximumAge: 30000, timeout: 20000 }
    );

    return () => navigator.geolocation.clearWatch(id);
  }, [setNotification]);

  useEffect(() => {
    if (!user) return;

    const promptKey = `veroflow_location_prompted_${user.uid}`;
    if (sessionStorage.getItem(promptKey)) return;

    sessionStorage.setItem(promptKey, '1');
    setTimeout(() => {
      requestLocationAccess();
    }, 0);
  }, [requestLocationAccess, user]);

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const idTokenResult = await u.getIdTokenResult();
        // Remove anonymous admin access - only real admins allowed
        setIsAdmin(!!idTokenResult.claims.admin);
      } else {
        setProfile(null);
        setShifts([]);
        setReceipts([]);
        setIsAdmin(false);
        setSuppressProfileAutoCreate(false);
        setIsWipingDataState(false);
      }

      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // 1. Fetch Profile
  useEffect(() => {
    if (!user) return;
    const unsubProfile = fetchProfile(user.uid);
    return () => unsubProfile();
  }, [user, fetchProfile]);

  // 2. Fetch Data (Shifts & Receipts) when Profile is loaded
  useEffect(() => {
    if (!user || !profile) return;
    const activeDataKey = getActiveDataKey(profile);
    const unsubShifts = fetchShifts(user.uid, activeDataKey);
    const unsubReceipts = fetchReceipts(user.uid, activeDataKey);
    return () => {
      unsubShifts();
      unsubReceipts();
    };
  }, [user, profile?.uid, profile?.activeDataKey, fetchShifts, fetchReceipts, getActiveDataKey]);

  // 3. Initial Weather Fetch
  useEffect(() => {
    if (!user) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          void fetchWeather(pos.coords.latitude, pos.coords.longitude);
          weatherFetchRef.current = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            fetchedAt: Date.now(),
          };
        },
        () => {
          const fallback = profile?.homeLocation || { lat: 60.1699, lng: 24.9384 };
          scheduleWeatherFetch(fallback.lat, fallback.lng);
          weatherFetchRef.current = {
            lat: fallback.lat,
            lng: fallback.lng,
            fetchedAt: Date.now(),
          };
        }
      );
    } else {
      const fallback = profile?.homeLocation || { lat: 60.1699, lng: 24.9384 };
      scheduleWeatherFetch(fallback.lat, fallback.lng);
      weatherFetchRef.current = {
        lat: fallback.lat,
        lng: fallback.lng,
        fetchedAt: Date.now(),
      };
    }
  }, [user, profile?.homeLocation, fetchWeather, scheduleWeatherFetch]);

  useEffect(() => {
    if (!currentLocation) return;

    const lastFetch = weatherFetchRef.current;
    const now = Date.now();

    // Avoid excessive weather API calls from high-frequency GPS updates.
    if (lastFetch) {
      const secondsSinceLastFetch = (now - lastFetch.fetchedAt) / 1000;
      const movedKm = calculateDistance(lastFetch.lat, lastFetch.lng, currentLocation.lat, currentLocation.lng);

      if (secondsSinceLastFetch < 300 && movedKm < 2) {
        return;
      }
    }

    scheduleWeatherFetch(currentLocation.lat, currentLocation.lng);
    weatherFetchRef.current = {
      lat: currentLocation.lat,
      lng: currentLocation.lng,
      fetchedAt: now,
    };
  }, [currentLocation, scheduleWeatherFetch]);

  const clearLocalData = useCallback(() => {
    setShifts([]);
    setReceipts([]);
    setProfile(null);
    setTrackedDistance(0);
  }, []);

  const startTracking = async (purpose?: string, odometer?: number) => {
    if (!navigator.geolocation) {
      setNotification({ message: "Geolocation not supported", type: 'error' });
      return;
    }

    setIsTracking(true);
    setTrackedDistance(0);
    setLastPosition(null);
    setCurrentGpsPoints([]);
    setStartTime(new Date().toISOString());
    setEndTime(null);
    
    if (purpose) setPurposeValue(purpose);
    if (odometer) setOdometerStartValue(odometer);

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const addr = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
      setStartAddress(addr);
    });

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const newPoint = { 
          lat: position.coords.latitude, 
          lng: position.coords.longitude, 
          timestamp: new Date().toISOString() 
        };
        setCurrentGpsPoints(prev => [...prev, newPoint]);

        setLastPosition(prev => {
          if (prev) {
            const dist = calculateDistance(
              prev.coords.latitude,
              prev.coords.longitude,
              position.coords.latitude,
              position.coords.longitude
            );
            setTrackedDistance((d) => d + dist);
          }
          return position;
        });
      },
      (error) => console.error("GPS Error:", error),
      { enableHighAccuracy: true }
    );
    setWatchId(id);
  };

  const stopTracking = (odometer?: number) => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    
    setEndTime(new Date().toISOString());
    
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const addr = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
      setEndAddress(addr);
    });

    setIsTracking(false);
  };
  
  const toggleVoiceCommand = useCallback(() => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      setNotification({ message: "Voice recognition not supported in this browser.", type: 'error' });
      return;
    }

    if (isListening) {
      // In webkitSpeechRecognition, we don't usually have a simple 'stop' that doesn't trigger the result
      // but the onend will handle the state.
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'fi-FI'; // Optimize for Finnish platform economy context
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== 'no-speech') {
        setNotification({ message: `Voice error: ${event.error}`, type: 'error' });
      }
      setIsListening(false);
    };

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setNotification({ message: `Heard: "${transcript}"`, type: 'info' });
      
      try {
        const result = await parseVoiceCommand(transcript, user?.uid);
        if (result.type === 'shift_start') {
          if (!isTracking) {
            void startTracking();
            setNotification({ message: "Starting shift tracking...", type: 'success' });
          } else {
            setNotification({ message: "Shift is already tracking.", type: 'info' });
          }
        } else if (result.type === 'shift_stop') {
          if (isTracking) {
            stopTracking();
            setActiveTab('dashboard'); // Switch to dashboard to show the finish log if needed
            setNotification({ message: "Shift tracking stopped. Log the results in the dashboard.", type: 'success' });
          } else {
            setNotification({ message: "No active shift tracking found to stop.", type: 'info' });
          }
        } else if (result.type === 'tip') {
          setNotification({ message: `Logged tip: ${result.data.amount}€`, type: 'success' });
          // Logic for logging tip directly could go here or trigger a UI flow
        } else if (result.type === 'expense') {
          setNotification({ message: `Detected expense: ${result.data.amount}€ at ${result.data.merchant}`, type: 'info' });
          // Switch to receipts to help the user log it
          setActiveTab('receipts');
        }
      } catch (err) {
        console.error("Voice parse failed:", err);
        setNotification({ message: "Could not understand voice command.", type: 'error' });
      }
    };

    recognition.start();
  }, [isListening, isTracking, startTracking, stopTracking, setNotification]);

  const value: VeroContextType = {
    user,
    profile,
    shifts,
    receipts,
    loading,
    weather,
    notification,
    setNotification,
    refreshData,
    clearLocalData,
    isVatRegistered,
    isOverYel,
    isApproachingYel,
    isOverVat,
    isApproachingVat,
    annualGross,
    totalDistance,
    isNightMode,
    setIsNightMode,
    isDrivingMode,
    setIsDrivingMode,
    activeTab,
    setActiveTab,
    isTracking,
    setIsTracking,
    trackedDistance,
    setTrackedDistance,
    startTracking,
    stopTracking,
    refreshWeatherAtLocation,
    hydrateDemoData,
    setIsWipingData,
    currentLocation,
    currentGpsPoints,
    startAddress,
    endAddress,
    startTime,
    endTime,
    odometerStart: odometerStartValue,
    purpose: purposeValue,
    login,
    guestLogin,
    logout,
    peakPerformance,
    isOnline,
    isListening,
    toggleVoiceCommand,
    isPro: profile?.subscription?.tier === 'pro' || profile?.subscription?.tier === 'elite',
    isElite: profile?.subscription?.tier === 'elite',
    isAdmin,
    subscription: profile?.subscription || { status: 'active', tier: 'free' },
    thresholdStatus
  };

  return (
    <VeroContext.Provider value={value}>
      {children}
    </VeroContext.Provider>
  );
}

export function useVero() {
  const context = useContext(VeroContext);
  if (context === undefined) {
    throw new Error('useVero must be used within a VeroProvider');
  }
  return context;
}
