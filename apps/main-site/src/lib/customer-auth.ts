import bcrypt from 'bcryptjs';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, setDoc, query, where, getDocs } from 'firebase/firestore';

export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface CustomerAuth {
  id: string;
  email: string;
  passwordHash: string;
  customerId: string;
  createdAt: Date;
  lastLogin?: Date;
}

export class CustomerAuthService {
  private static readonly CUSTOMERS_COLLECTION = 'customers';
  private static readonly AUTH_COLLECTION = 'customer_auth';

  // Register new customer
  static async registerCustomer(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }): Promise<{ success: boolean; customer?: Customer; error?: string }> {
    try {
      // Check if email already exists
      const existingAuth = await this.getAuthByEmail(data.email);
      if (existingAuth) {
        return { success: false, error: 'This email is already registered. Please try logging in instead.' };
      }

      // Hash password
      const passwordHash = await bcrypt.hash(data.password, 12);

      // Create customer document
      const customerRef = doc(collection(db, this.CUSTOMERS_COLLECTION));
      const customer: Customer = {
        id: customerRef.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      };

      // Create auth document
      const authRef = doc(collection(db, this.AUTH_COLLECTION));
      const auth: CustomerAuth = {
        id: authRef.id,
        email: data.email,
        passwordHash,
        customerId: customer.id,
        createdAt: new Date()
      };

      // Save to database
      await setDoc(customerRef, customer);
      await setDoc(authRef, auth);

      return { success: true, customer };
    } catch (error: any) {
      console.error('Customer registration error:', error);
      
      // Provide more specific error messages
      if (error.code === 'permission-denied') {
        return { success: false, error: 'Database permissions issue. Please contact support.' };
      } else if (error.code === 'unavailable') {
        return { success: false, error: 'Service temporarily unavailable. Please try again in a moment.' };
      } else if (error.message?.includes('network')) {
        return { success: false, error: 'Network error. Please check your connection and try again.' };
      }
      
      return { success: false, error: 'Registration failed. Please try again or contact support if the problem persists.' };
    }
  }

  // Authenticate customer
  static async authenticateCustomer(email: string, password: string): Promise<{
    success: boolean;
    customer?: Customer;
    error?: string;
  }> {
    try {
      const auth = await this.getAuthByEmail(email);
      if (!auth) {
        return { success: false, error: 'No account found with this email. Please check your email or create a new account.' };
      }

      const isValidPassword = await bcrypt.compare(password, auth.passwordHash);
      if (!isValidPassword) {
        return { success: false, error: 'Incorrect password. Please try again or reset your password.' };
      }

      const customer = await this.getCustomerById(auth.customerId);
      if (!customer || !customer.isActive) {
        return { success: false, error: 'Account is inactive. Please contact support for assistance.' };
      }

      // Update last login
      await this.updateLastLogin(auth.id);

      return { success: true, customer };
    } catch (error: any) {
      console.error('Customer authentication error:', error);
      
      // Provide more specific error messages
      if (error.code === 'permission-denied') {
        return { success: false, error: 'Database permissions issue. Please contact support.' };
      } else if (error.code === 'unavailable') {
        return { success: false, error: 'Service temporarily unavailable. Please try again in a moment.' };
      } else if (error.message?.includes('network')) {
        return { success: false, error: 'Network error. Please check your connection and try again.' };
      }
      
      return { success: false, error: 'Login failed. Please try again or contact support if the problem persists.' };
    }
  }

  // Get customer by ID
  static async getCustomerById(customerId: string): Promise<Customer | null> {
    try {
      const customerRef = doc(db, this.CUSTOMERS_COLLECTION, customerId);
      const customerSnap = await getDoc(customerRef);
      
      if (customerSnap.exists()) {
        return customerSnap.data() as Customer;
      }
      return null;
    } catch (error) {
      console.error('Get customer error:', error);
      return null;
    }
  }

  // Get customer by email
  static async getCustomerByEmail(email: string): Promise<Customer | null> {
    try {
      const q = query(
        collection(db, this.CUSTOMERS_COLLECTION),
        where('email', '==', email)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data() as Customer;
      }
      return null;
    } catch (error) {
      console.error('Get customer by email error:', error);
      return null;
    }
  }

  // Update customer profile
  static async updateCustomer(customerId: string, updates: Partial<Customer>): Promise<{
    success: boolean;
    customer?: Customer;
    error?: string;
  }> {
    try {
      const customerRef = doc(db, this.CUSTOMERS_COLLECTION, customerId);
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };
      
      await setDoc(customerRef, updateData, { merge: true });
      const updatedCustomer = await this.getCustomerById(customerId);
      
      return { success: true, customer: updatedCustomer! };
    } catch (error) {
      console.error('Update customer error:', error);
      return { success: false, error: 'Update failed' };
    }
  }

  // Get customer orders
  static async getCustomerOrders(customerId: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, 'orders'),
        where('customerId', '==', customerId)
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Get customer orders error:', error);
      return [];
    }
  }

  // Private helper methods
  private static async getAuthByEmail(email: string): Promise<CustomerAuth | null> {
    try {
      const q = query(
        collection(db, this.AUTH_COLLECTION),
        where('email', '==', email)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data() as CustomerAuth;
      }
      return null;
    } catch (error) {
      console.error('Get auth by email error:', error);
      return null;
    }
  }

  private static async updateLastLogin(authId: string): Promise<void> {
    try {
      const authRef = doc(db, this.AUTH_COLLECTION, authId);
      await setDoc(authRef, { lastLogin: new Date() }, { merge: true });
    } catch (error) {
      console.error('Update last login error:', error);
    }
  }
}

