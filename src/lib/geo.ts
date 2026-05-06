import axios from 'axios';

interface GeocodeResult {
  lat: string;
  lon: string;
  display_name: string;
}

/**
 * Geocoding with OpenStreetMap Nominatim as fallback
 */
export async function geocode(address: string): Promise<GeocodeResult | null> {
  try {
    const primaryResult = null;
    if (primaryResult) return primaryResult;

    console.log(`[GEO] Falling back to OpenStreetMap for: ${address}`);
    const encodeAddress = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeAddress}&format=json&limit=1`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'MyDriverApp/1.0 (contact@example.com)'
      }
    });

    if (response.data && response.data.length > 0) {
      const first = response.data[0];
      return {
        lat: first.lat,
        lon: first.lon,
        display_name: first.display_name
      };
    }

    return null;
  } catch (error) {
    console.error('[GEO] Error during geocoding:', error);
    return null;
  }
}
