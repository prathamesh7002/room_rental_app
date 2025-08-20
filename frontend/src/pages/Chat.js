import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { config } from '../utils/config';
import { useSearchParams, useNavigate } from 'react-router-dom';

const Chat = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const wsRef = useRef(null);
  const currentRoomIdRef = useRef(null);
  const messagesEndRef = useRef(null);

  const targetUserId = searchParams.get('user');
  const targetRoomId = searchParams.get('room');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    fetchChatRooms().then(() => {
      if (targetUserId) {
        createOrGetChatRoom(targetUserId);
      } else if (targetRoomId) {
        openRoomById(targetRoomId);
      }
    });
  }, [isAuthenticated, targetUserId, targetRoomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatRooms = async () => {
    try {
      const response = await axios.get(`${config.apiBaseUrl}/chat/rooms/`);
      setChatRooms(response.data);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
    }
  };

  const openRoomById = async (roomId) => {
    try {
      // Try to find in current list; if not present, refetch
      let room = chatRooms.find(r => String(r.id) === String(roomId));
      if (!room) {
        const response = await axios.get(`${config.apiBaseUrl}/chat/rooms/`);
        const list = response.data || [];
        setChatRooms(list);
        room = list.find(r => String(r.id) === String(roomId));
      }
      if (room) {
        setSelectedRoom(room);
        connectWebSocket(room.id);
        fetchMessages(room.id, true);
      }
    } catch (err) {
      console.error('Error opening room by id:', err);
    }
  };

  const createOrGetChatRoom = async (userId) => {
    try {
      const response = await axios.get(`${config.apiBaseUrl}/chat/room/${userId}/`);
      setSelectedRoom(response.data);
      connectWebSocket(response.data.id);
      fetchMessages(response.data.id, true);
    } catch (error) {
      console.error('Error creating/getting chat room:', error);
    }
  };

  const fetchMessages = async (roomId, autoMarkRead = false) => {
    try {
      const response = await axios.get(`${config.apiBaseUrl}/chat/messages/${roomId}/`);
      const list = response.data || [];
      setMessages(list);
      if (autoMarkRead) {
        // Mark the latest unread incoming message as read
        const latestUnread = [...list].reverse().find(m => m.sender.id !== user.id && !m.is_read);
        if (latestUnread) {
          setTimeout(() => {
            try {
              if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ action: 'read', message_id: latestUnread.id }));
              }
            } catch (_) {}
          }, 0);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const connectWebSocket = (roomId) => {
    // Close any existing socket
    if (wsRef.current) {
      try { wsRef.current.onclose = null; wsRef.current.close(); } catch (_) {}
    }

    currentRoomIdRef.current = roomId;

    const token = localStorage.getItem('access_token');
    const wsUrl = `${config.wsBaseUrl}/chat/${roomId}/?token=${encodeURIComponent(token || '')}`;
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      // Keep a stable reference
      wsRef.current = websocket;
      console.log('WebSocket connected');
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Read receipt event
      if (data.event === 'read') {
        setMessages(prev => prev.map(m =>
          m.id === data.message_id ? { ...m, is_read: true } : m
        ));
        return;
      }

      // Own message echo: replace optimistic temp with real ID/timestamp and mark delivered
      if (data.sender_id === user.id) {
        setMessages(prev => {
          const copy = [...prev];
          for (let i = copy.length - 1; i >= 0; i--) {
            const m = copy[i];
            if (m.sender.id === user.id && String(m.id).startsWith('temp-')) {
              copy[i] = { ...m, id: data.message_id, timestamp: data.timestamp, delivered: true };
              break;
            }
          }
          return copy;
        });
        return;
      }

      // Message from other user
      setMessages(prev => [...prev, {
        id: data.message_id,
        sender: { id: data.sender_id, username: data.sender_username },
        message: data.message,
        timestamp: data.timestamp,
        is_read: false,
      }]);
      // Update chatRooms preview (last_message)
      setChatRooms(prev => prev.map(r => r.id === currentRoomIdRef.current
        ? { ...r, last_message: { message: data.message, timestamp: data.timestamp } }
        : r
      ));
      // Immediately send read receipt for messages from other user in the open room
      try {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ action: 'read', message_id: data.message_id }));
        }
      } catch (_) {}
    };

    websocket.onerror = (err) => {
      console.error('WebSocket error', err);
    };

    websocket.onclose = () => {
      console.log('WebSocket disconnected');
      // Attempt lightweight reconnect if still on this room
      const targetId = currentRoomIdRef.current;
      if (targetId === roomId) {
        setTimeout(() => {
          // Only reconnect if still viewing the same room and no open socket
          if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
            connectWebSocket(roomId);
          }
        }, 1500);
      }
    };

    // Assign immediately to ref to be available for sendMessage
    wsRef.current = websocket;
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom) return;

    const otherParticipant = selectedRoom.participants.find(p => p.id !== user.id);
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        message: newMessage,
        receiver_id: otherParticipant.id
      }));
    }

    // Optimistically append my message
    const optimistic = {
      id: `temp-${Date.now()}`,
      sender: { id: user.id, username: user.username },
      message: newMessage,
      timestamp: new Date().toISOString(),
      is_read: false,
      delivered: false,
    };
    setMessages(prev => [...prev, optimistic]);
    // Update chat list preview
    setChatRooms(prev => prev.map(r => r.id === currentRoomIdRef.current
      ? { ...r, last_message: { message: newMessage, timestamp: optimistic.timestamp } }
      : r
    ));

    setNewMessage('');
  };

  const selectChatRoom = (room) => {
    setSelectedRoom(room);
    fetchMessages(room.id);
    connectWebSocket(room.id);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        try { wsRef.current.close(); } catch (_) {}
        wsRef.current = null;
      }
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Chat</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ height: '600px' }}>
        <div className="flex h-full">
          {/* Chat Rooms List */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Conversations</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {chatRooms.map((room) => {
                const otherParticipant = room.participants.find(p => p.id !== user.id);
                return (
                  <button
                    key={room.id}
                    onClick={() => selectChatRoom(room)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition ${
                      selectedRoom?.id === room.id ? 'bg-primary-50 border-r-2 border-primary-600' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {otherParticipant?.first_name?.charAt(0) || otherParticipant?.username?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {otherParticipant?.first_name} {otherParticipant?.last_name} 
                          {!otherParticipant?.first_name && otherParticipant?.username}
                        </p>
                        {room.last_message && (
                          <p className="text-sm text-gray-500 truncate">
                            {room.last_message.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            
            {chatRooms.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                <p>No conversations yet.</p>
                <p className="text-sm mt-2">Start chatting by viewing a room and clicking "Chat with Owner".</p>
              </div>
            )}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 flex flex-col">
            {selectedRoom ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {selectedRoom.participants.find(p => p.id !== user.id)?.first_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {(() => {
                          const otherParticipant = selectedRoom.participants.find(p => p.id !== user.id);
                          return otherParticipant?.first_name 
                            ? `${otherParticipant.first_name} ${otherParticipant.last_name}`
                            : otherParticipant?.username;
                        })()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message, idx) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender.id === user.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender.id === user.id
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p>{message.message}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender.id === user.id ? 'text-primary-100' : 'text-gray-500'
                        }`}>
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                        {message.sender.id === user.id && idx === messages.length - 1 && message.is_read && (
                          <p className="text-xs mt-0.5 text-primary-100">Seen</p>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition disabled:opacity-50"
                    >
                      Send
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <p className="text-lg">Select a conversation to start chatting</p>
                  <p className="text-sm mt-2">Or browse rooms to start a new conversation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
