import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ShippingOption, ShippingZone, ShippingRate } from '@/lib/types/shipping';

// Shipping Options
export async function getShippingOptions(): Promise<ShippingOption[]> {
  try {
    const q = query(collection(db, 'shippingOptions'), orderBy('name'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    })) as ShippingOption[];
  } catch (error) {
    console.error('Error getting shipping options:', error);
    return [];
  }
}

export async function getActiveShippingOptions(): Promise<ShippingOption[]> {
  try {
    const q = query(
      collection(db, 'shippingOptions'), 
      where('isActive', '==', true),
      orderBy('name')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    })) as ShippingOption[];
  } catch (error) {
    console.error('Error getting active shipping options:', error);
    return [];
  }
}

export async function addShippingOption(optionData: Omit<ShippingOption, 'id' | 'createdAt' | 'updatedAt'>): Promise<ShippingOption> {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, 'shippingOptions'), {
      ...optionData,
      createdAt: now,
      updatedAt: now,
    });
    
    const newDoc = await getDoc(docRef);
    return {
      id: docRef.id,
      ...newDoc.data(),
      createdAt: newDoc.data()?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: newDoc.data()?.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    } as ShippingOption;
  } catch (error) {
    console.error('Error adding shipping option:', error);
    throw error;
  }
}

export async function updateShippingOption(id: string, updates: Partial<ShippingOption>): Promise<void> {
  try {
    const docRef = doc(db, 'shippingOptions', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating shipping option:', error);
    throw error;
  }
}

export async function deleteShippingOption(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'shippingOptions', id));
  } catch (error) {
    console.error('Error deleting shipping option:', error);
    throw error;
  }
}

// Shipping Zones
export async function getShippingZones(): Promise<ShippingZone[]> {
  try {
    const q = query(collection(db, 'shippingZones'), orderBy('name'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    })) as ShippingZone[];
  } catch (error) {
    console.error('Error getting shipping zones:', error);
    return [];
  }
}

export async function addShippingZone(zoneData: Omit<ShippingZone, 'id' | 'createdAt' | 'updatedAt'>): Promise<ShippingZone> {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, 'shippingZones'), {
      ...zoneData,
      createdAt: now,
      updatedAt: now,
    });
    
    const newDoc = await getDoc(docRef);
    return {
      id: docRef.id,
      ...newDoc.data(),
      createdAt: newDoc.data()?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: newDoc.data()?.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    } as ShippingZone;
  } catch (error) {
    console.error('Error adding shipping zone:', error);
    throw error;
  }
}

// Shipping Rates
export async function getShippingRates(): Promise<ShippingRate[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'shippingRates'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    })) as ShippingRate[];
  } catch (error) {
    console.error('Error getting shipping rates:', error);
    return [];
  }
}

export async function addShippingRate(rateData: Omit<ShippingRate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ShippingRate> {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, 'shippingRates'), {
      ...rateData,
      createdAt: now,
      updatedAt: now,
    });
    
    const newDoc = await getDoc(docRef);
    return {
      id: docRef.id,
      ...newDoc.data(),
      createdAt: newDoc.data()?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: newDoc.data()?.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    } as ShippingRate;
  } catch (error) {
    console.error('Error adding shipping rate:', error);
    throw error;
  }
}