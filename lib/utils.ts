import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Haversine formula for distance in KM
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const deg2rad = (deg: number) => deg * (Math.PI / 180);
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const reverseGeocode = async (lat: number, lng: number) => {
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), 4000);

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
      signal: timeoutController.signal,
      headers: {
        'Accept-Language': 'en'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return `Location near ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }

    const data = await response.json();
    if (data.address) {
      const city = data.address.city || data.address.town || data.address.village || data.address.municipality;
      const suburb = data.address.suburb || data.address.neighbourhood || data.address.district;
      const road = data.address.road;
      
      const parts = [];
      if (road) parts.push(road);
      if (suburb) parts.push(suburb);
      if (city && city !== suburb) parts.push(city);
      
      if (parts.length > 0) return parts.join(', ');
    }
    return data.display_name?.split(',').slice(0, 2).join(', ') || `Location near ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch (e) {
    return `Location near ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } finally {
    clearTimeout(timeoutId);
  }
};
