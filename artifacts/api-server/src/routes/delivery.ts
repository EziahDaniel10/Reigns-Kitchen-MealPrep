import { Router } from 'express';

const router = Router();

// ── Restaurant/kitchen origin ──────────────────────────────────────────────
// Update these coordinates when the kitchen address changes.
// Default: central Washington, DC area
const KITCHEN_LAT = parseFloat(process.env['KITCHEN_LAT'] ?? '38.9072');
const KITCHEN_LNG = parseFloat(process.env['KITCHEN_LNG'] ?? '-77.0369');

// ── Fee tiers (miles → fee in USD) ───────────────────────────────────────
const TIERS = [
  { maxMiles: 3,  fee: 12 },
  { maxMiles: 5,  fee: 18 },
  { maxMiles: 8,  fee: 25 },
  { maxMiles: 12, fee: 35 },
  { maxMiles: 15, fee: 45 },
];
const MAX_MILES = 15;

function haversineMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

router.get('/delivery-fee', async (req, res) => {
  const address = (req.query['address'] as string | undefined)?.trim();
  if (!address) {
    return res.status(400).json({ success: false, error: 'Address is required.' });
  }

  try {
    const geoUrl =
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`;
    const geoRes = await fetch(geoUrl, {
      headers: { 'User-Agent': 'ReignsKitchen/1.0 (catering@reignskitchen.com)' },
    });

    if (!geoRes.ok) {
      return res.status(502).json({ success: false, error: 'Address lookup service unavailable. Please try again.' });
    }

    const geoData = (await geoRes.json()) as Array<{ lat: string; lon: string; display_name: string }>;

    if (!geoData.length) {
      return res.json({ success: false, error: 'Address not found. Please enter a complete street address.' });
    }

    const { lat, lon } = geoData[0];
    const distanceMiles = haversineMiles(KITCHEN_LAT, KITCHEN_LNG, parseFloat(lat), parseFloat(lon));
    const rounded = Math.round(distanceMiles * 10) / 10;

    if (distanceMiles > MAX_MILES) {
      return res.json({ success: true, outOfRange: true, distanceMiles: rounded });
    }

    const tier = TIERS.find(t => distanceMiles <= t.maxMiles)!;
    return res.json({ success: true, outOfRange: false, distanceMiles: rounded, fee: tier.fee });
  } catch (err) {
    console.error('Delivery fee lookup error:', err);
    return res.status(500).json({ success: false, error: 'Could not calculate delivery distance. Please try again.' });
  }
});

export default router;
