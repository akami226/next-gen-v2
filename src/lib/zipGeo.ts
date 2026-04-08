export interface GeoCoords {
  lat: number;
  lng: number;
}

export async function fetchZipCoords(zip: string): Promise<GeoCoords> {
  const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
  if (!res.ok) throw new Error('Invalid zip code');
  const data = await res.json();
  const place = data.places?.[0];
  if (!place) throw new Error('No location data found');
  return {
    lat: parseFloat(place.latitude),
    lng: parseFloat(place.longitude),
  };
}

export function haversineDistance(a: GeoCoords, b: GeoCoords): number {
  const R = 3958.8;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
  return 2 * R * Math.asin(Math.sqrt(h));
}
