import { NotificationItem } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type InsideContextType = {
  notifications: NotificationItem[];
  addNotification: (notif: NotificationItem) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
};

const InsideContext = createContext<InsideContextType | undefined>(undefined);

export const InsideProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const loadStored = async () => {
      const stored = await AsyncStorage.getItem("local_notifications");
      if (stored) {
        const parsed: NotificationItem[] = JSON.parse(stored).map((n: any) => ({
          ...n,
          receivedAt: new Date(n.receivedAt),
        }));
        setNotifications(parsed);
      }
    };
    loadStored();
  }, []);

  const addNotification = (notification: NotificationItem) => {
    setNotifications((prev) => {
      const updated = [notification, ...prev].slice(0, 20);
      AsyncStorage.setItem("local_notifications", JSON.stringify(updated));
      return updated;
    });
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      AsyncStorage.setItem("local_notifications", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <InsideContext.Provider
      value={{ notifications, addNotification, markAllAsRead, removeNotification }}
    >
      {children}
    </InsideContext.Provider>
  );
};

export const useInside = () => {
  const context = useContext(InsideContext);
  if (!context)
    throw new Error("useInside debe usarse dentro de InsideProvider");
  return context;
};
