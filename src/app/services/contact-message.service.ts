import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
  deleteDoc
} from '@angular/fire/firestore';

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  inquiryType: string;
  packageInterest?: string;
  message: string;
  preferredContact: string;
  sessionDate?: string;
  status: 'new' | 'read' | 'archived';
  createdAt: Timestamp;
  readAt?: Timestamp;
}

@Injectable({
  providedIn: 'root'
})
export class ContactMessageService {
  private firestore: Firestore = inject(Firestore);
  private messagesCollection = collection(this.firestore, 'contact-messages');

  /**
   * Save a new contact message to Firestore
   */
  async createMessage(messageData: Omit<ContactMessage, 'id' | 'status' | 'createdAt'>): Promise<string> {
    try {
      const newMessage = {
        ...messageData,
        status: 'new' as const,
        createdAt: Timestamp.now()
      };

      const docRef = await addDoc(this.messagesCollection, newMessage);
      return docRef.id;
    } catch (error) {
      console.error('Error creating contact message:', error);
      throw error;
    }
  }

  /**
   * Get all contact messages ordered by creation date (newest first)
   */
  async getAllMessages(): Promise<ContactMessage[]> {
    try {
      const q = query(this.messagesCollection, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ContactMessage));
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      throw error;
    }
  }

  /**
   * Mark a message as read
   */
  async markAsRead(messageId: string): Promise<void> {
    try {
      const messageRef = doc(this.firestore, 'contact-messages', messageId);
      await updateDoc(messageRef, {
        status: 'read',
        readAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }

  /**
   * Archive a message
   */
  async archiveMessage(messageId: string): Promise<void> {
    try {
      const messageRef = doc(this.firestore, 'contact-messages', messageId);
      await updateDoc(messageRef, {
        status: 'archived'
      });
    } catch (error) {
      console.error('Error archiving message:', error);
      throw error;
    }
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string): Promise<void> {
    try {
      const messageRef = doc(this.firestore, 'contact-messages', messageId);
      await deleteDoc(messageRef);
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  /**
   * Get count of unread messages
   */
  async getUnreadCount(): Promise<number> {
    try {
      const messages = await this.getAllMessages();
      return messages.filter(msg => msg.status === 'new').length;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }
}
