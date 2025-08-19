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
  const [ws, setWs] = useState(null);
  const messagesEndRef = useRef(null);

  const targetUserId = searchParams.get('user');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    fetchChatRooms();
    
    if (targetUserId) {
      createOrGetChatRoom(targetUserId);
    }
  }, [isAuthenticated, targetUserId]);

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

  const createOrGetChatRoom = async (userId) => {
    try {
      const response = await axios.get(`${config.apiBaseUrl}/chat/room/${userId}/`);
      setSelectedRoom(response.data);
      fetchMessages(response.data.id);
      connectWebSocket(response.data.id);
    } catch (error) {
      console.error('Error creating/getting chat room:', error);
    }
  };

  const fetchMessages = async (roomId) => {
    try {
      const response = await axios.get(`${config.apiBaseUrl}/chat/messages/${roomId}/`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const connectWebSocket = (roomId) => {
    if (ws) {
      ws.close();
    }

    const wsUrl = `${config.wsBaseUrl}/chat/${roomId}/`;
    const websocket = new WebSocket(wsUrl);
    
    websocket.onopen = () => {
      console.log('WebSocket connected');
    };
    
    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages(prev => [...prev, {
        id: data.message_id,
        sender: { id: data.sender_id, username: data.sender_username },
        message: data.message,
        timestamp: data.timestamp
      }]);
    };
    
    websocket.onclose = () => {
      console.log('WebSocket disconnected');
    };
    
    setWs(websocket);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom) return;

    const otherParticipant = selectedRoom.participants.find(p => p.id !== user.id);
    
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        message: newMessage,
        receiver_id: otherParticipant.id
      }));
    }

    setNewMessage('');
  };

  const selectChatRoom = (room) => {
    setSelectedRoom(room);
    fetchMessages(room.id);
    connectWebSocket(room.id);
  };

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
                  {messages.map((message) => (
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
