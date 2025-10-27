import bcrypt from 'bcryptjs';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, setDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import crypto from 'crypto';

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
  createdAt: Date | Timestamp;
  lastLogin?: Date | Timestamp;
  resetToken?: string | null;
  resetTokenExpiry?: Date | Timestamp | null;
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
        ...(data.phone && { phone: data.phone }), // Only include phone if it's not undefined
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
      // Log errors but avoid exposing sensitive Firebase details in production
      if (process.env.NODE_ENV === 'development') {
        console.error('Customer registration error:', error);
      } else {
        console.error('Registration failed');
      }
      
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
      // Log errors but avoid exposing sensitive Firebase details in production
      if (process.env.NODE_ENV === 'development') {
        console.error('Customer authentication error:', error);
      } else {
        console.error('Authentication failed');
      }
      
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
      if (!customerId || typeof customerId !== 'string') {
        console.error('Invalid customerId provided:', customerId);
        return null;
      }

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
      if (!customerId || typeof customerId !== 'string') {
        console.error('Invalid customerId provided for orders:', customerId);
        return [];
      }

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

  // Send password reset email
  static async sendPasswordResetEmail(email: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const auth = await this.getAuthByEmail(email);
      if (!auth) {
        // Don't reveal if email exists for security
        return { success: true };
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

      // Update auth record with reset token
      const authRef = doc(db, this.AUTH_COLLECTION, auth.id);
      await setDoc(authRef, {
        resetToken,
        resetTokenExpiry
      }, { merge: true });

      // TODO: Send email with reset link
      // For now, just log the token (in production, send via email service)
      console.log(`Password reset token for ${email}: ${resetToken}`);

      return { success: true };
    } catch (error) {
      console.error('Send password reset email error:', error);
      return { success: false, error: 'Failed to send reset email' };
    }
  }

  // Reset password using token
  static async resetPassword(token: string, newPassword: string): Promise<{
    success: boolean;
    email?: string;
    error?: string;
  }> {
    try {
      // Find auth record by reset token
      const q = query(
        collection(db, this.AUTH_COLLECTION),
        where('resetToken', '==', token)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return { success: false, error: 'Invalid or expired reset token' };
      }

      const authDoc = querySnapshot.docs[0];
      const auth = authDoc.data() as CustomerAuth;

      // Check if token is expired
      if (!auth.resetTokenExpiry || new Date() > (auth.resetTokenExpiry instanceof Timestamp ? auth.resetTokenExpiry.toDate() : new Date(auth.resetTokenExpiry))) {
        return { success: false, error: 'Reset token has expired' };
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, 12);

      // Update password and clear reset token
      const authRef = doc(db, this.AUTH_COLLECTION, authDoc.id);
      await setDoc(authRef, {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
        lastLogin: new Date()
      }, { merge: true });

      return { success: true, email: auth.email };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: 'Failed to reset password' };
    }
  }
}

