import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  serverTimestamp,
  type DocumentData,
  type QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product } from '@/lib/types';

const COLLECTION_NAME = 'products';

// Convert Firestore document to Product
const docToProduct = (doc: QueryDocumentSnapshot<DocumentData>): Product => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name || '',
    description: data.description || '',
    price: Number(data.price) || 0,
    images: Array.isArray(data.images) ? data.images : [],
    stock: Number(data.stock) || 0,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
  };
};

// Convert Product to Firestore document
const productToDoc = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
  return {
    name: product.name,
    description: product.description,
    price: product.price,
    images: product.images,
    stock: product.stock,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
};

// Get all products
export const getProducts = async (): Promise<Product[]> => {
  try {
    if (!db) {
      throw new Error('Firestore database not initialized');
    }
    
    const productsRef = collection(db, COLLECTION_NAME);
    const q = query(productsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(docToProduct);
  } catch (error) {
    console.error('Error fetching products:', error);
    // Return empty array instead of throwing to prevent crashes
    return [];
  }
};

// Get a single product by ID
export const getProduct = async (id: string): Promise<Product | null> => {
  try {
    if (!db) {
      throw new Error('Firestore database not initialized');
    }
    
    const productRef = doc(db, COLLECTION_NAME, id);
    const productSnap = await getDoc(productRef);
    
    if (productSnap.exists()) {
      return docToProduct(productSnap as QueryDocumentSnapshot<DocumentData>);
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
};

// Add a new product
export const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
  try {
    if (!db) {
      throw new Error('Firestore database not initialized');
    }
    
    const docData = productToDoc(productData);
    const docRef = await addDoc(collection(db, COLLECTION_NAME), docData);
    
    // Get the created document to return the full product
    const createdDoc = await getDoc(docRef);
    if (createdDoc.exists()) {
      return docToProduct(createdDoc as QueryDocumentSnapshot<DocumentData>);
    }
    
    throw new Error('Failed to create product');
  } catch (error) {
    console.error('Error adding product:', error);
    throw new Error('Failed to add product');
  }
};

// Update a product
export const updateProduct = async (id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>): Promise<void> => {
  try {
    if (!db) {
      throw new Error('Firestore database not initialized');
    }
    
    const productRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(productRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating product:', error);
    throw new Error('Failed to update product');
  }
};

// Delete a product
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    if (!db) {
      throw new Error('Firestore database not initialized');
    }
    
    const productRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(productRef);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw new Error('Failed to delete product');
  }
};

// Search products by name or description
export const searchProducts = async (searchTerm: string): Promise<Product[]> => {
  try {
    const products = await getProducts();
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    return products.filter(product => 
      product.name.toLowerCase().includes(lowerSearchTerm) ||
      product.description.toLowerCase().includes(lowerSearchTerm)
    );
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};

// Get products with low stock (≤ 10)
export const getLowStockProducts = async (): Promise<Product[]> => {
  try {
    const products = await getProducts();
    return products.filter(product => product.stock > 0 && product.stock <= 10);
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    return [];
  }
};

// Get out of stock products
export const getOutOfStockProducts = async (): Promise<Product[]> => {
  try {
    const products = await getProducts();
    return products.filter(product => product.stock === 0);
  } catch (error) {
    console.error('Error fetching out of stock products:', error);
    return [];
  }
}; 