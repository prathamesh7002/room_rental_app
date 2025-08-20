import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';
import { config } from '../utils/config';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const connectWebSocket = useCallback(() => {
    try {
      const token = localStorage.getItem('access_token');
      const wsUrl = `${config.wsBaseUrl}/notifications/?token=${encodeURIComponent(token || '')}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
        console.log('Notification WebSocket connected');
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleNewNotification(data);
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log('Notification WebSocket disconnected');
        // Attempt to reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      window.notificationWS = ws;
    } catch (error) {
      console.error('Error connecting to notification WebSocket:', error);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      connectWebSocket();
      fetchNotifications();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [isAuthenticated, user, connectWebSocket]);

  const disconnectWebSocket = () => {
    if (window.notificationWS) {
      window.notificationWS.close();
      window.notificationWS = null;
    }
  };

  const handleNewNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      const n = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
      // Navigate to chat with sender/room on click
      try {
        const roomId = notification?.data?.room_id;
        const senderId = notification?.data?.sender_id;
        n.onclick = () => {
          window.focus();
          if (roomId) {
            window.location.href = `/chat?room=${roomId}`;
          } else if (senderId) {
            window.location.href = `/chat?user=${senderId}`;
          }
          n.close();
        };
      } catch (_) {}
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${config.apiBaseUrl}/notifications/`);
      setNotifications(response.data.results || []);
      setUnreadCount(response.data.unread_count || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`${config.apiBaseUrl}/notifications/${notificationId}/read/`);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.post(`${config.apiBaseUrl}/notifications/mark-all-read/`);
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`${config.apiBaseUrl}/notifications/${notificationId}/`);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      const deletedNotif = notifications.find(n => n.id === notificationId);
      if (deletedNotif && !deletedNotif.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  const value = {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    requestNotificationPermission,
    fetchNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
