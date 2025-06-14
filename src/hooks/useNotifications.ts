
import { useState, useEffect, useCallback } from "react";
import { collection, query, where, orderBy, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

export type Notification = {
  id: string;
  userId: string;
  type: "reply" | "tag" | "points" | "system";
  message: string;
  read: boolean;
  postId?: string;
  createdAt: Date;
};

export function useNotifications() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Create a fetchNotifications function that we can reuse
  const fetchNotifications = useCallback(async () => {
    if (!currentUser) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const q = query(
        collection(db, "notifications"),
        where("userId", "==", currentUser.uid),
        orderBy("createdAt", "desc")
      );

      // First attempt to use onSnapshot (realtime updates)
      try {
        // Return the unsubscribe function directly
        return onSnapshot(q, (querySnapshot) => {
          const notificationsData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate() || new Date(),
            } as Notification;
          });
          
          setNotifications(notificationsData);
          setUnreadCount(notificationsData.filter(n => !n.read).length);
          setLoading(false);
        });
      } catch (error) {
        // Fallback to one-time fetch if realtime updates fail
        console.warn("Realtime notifications not available, falling back to one-time fetch:", error);
        
        const querySnapshot = await getDocs(q);
        const notificationsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
          } as Notification;
        });
        
        setNotifications(notificationsData);
        setUnreadCount(notificationsData.filter(n => !n.read).length);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
    }
  }, [currentUser]);

  // Add the refetch function
  const refetch = useCallback(async () => {
    return fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    const setupSubscription = async () => {
      const unsub = await fetchNotifications();
      if (typeof unsub === 'function') {
        unsubscribe = unsub;
      }
    };

    setupSubscription();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [fetchNotifications]);

  return { notifications, unreadCount, loading, refetch };
}
