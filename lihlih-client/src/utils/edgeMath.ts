import { distance, point } from '@turf/turf';
import { StoreSummary } from '../services/storageService';

const MAX_RANGE_KM = 5;

export const calculateNearbyStores = (stores: StoreSummary[], userLat: number, userLng: number, wilaya: string, baladia: string) => {
  const userLoc = point([userLng, userLat]);

  console.log(`DEBUG [edgeMath] Calculating nearby for ${wilaya}/${baladia} at ${userLat},${userLng}. Total stores: ${stores.length}`);

  return stores
    .filter(store => {
      console.log(`DEBUG [edgeMath] Checking store ${store.name} (${store.wilaya}/${store.baladia})`);
      // Rule 1: Same Area
      const sameArea = (store.wilaya?.trim() === wilaya?.trim()) && 
                       (store.baladia?.trim() === baladia?.trim());
      if (!sameArea) {
        console.log(`DEBUG [edgeMath]   Rejecting ${store.name}: Area mismatch. Store: "${store.wilaya}"/"${store.baladia}", User: "${wilaya}"/"${baladia}"`);
        return false;
      }

      // Rule 2: Within Distance
      const sLat = Number(store.lat);
      const sLng = Number(store.lng);
      console.log(`DEBUG [edgeMath]   Distance check for ${store.name}: Store(${sLat}, ${sLng}) vs User(${userLat}, ${userLng})`);
      
      const storeLoc = point([sLng, sLat]);
      const dist = distance(userLoc, storeLoc, { units: 'kilometers' });
      
      (store as any).distanceKm = dist;
      const withinRange = dist <= MAX_RANGE_KM;
      
      console.log(`DEBUG [edgeMath]   Distance result for ${store.name}: ${dist.toFixed(2)} km. Within range: ${withinRange}`);
      
      return withinRange;
    })
    .sort((a, b) => (a as any).distanceKm - (b as any).distanceKm);
};
