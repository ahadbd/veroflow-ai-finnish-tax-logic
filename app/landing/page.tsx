'use client';

import VeroLanding from '@/components/VeroLanding';
import { useVero } from '@/components/VeroProvider';

export default function LandingPage() {
  const { login, guestLogin } = useVero();
  
  return (
    <VeroLanding 
      login={login} 
      guestLogin={guestLogin} 
    />
  );
}
