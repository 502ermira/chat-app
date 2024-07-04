import React, { useState, useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import API from '../../api';

const Chat = ({ friendId }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const socket = useSocket();

  useEffect(() => {
    const fetchMessages = async () => {
      const token = localStorage.getItem('token');
      try {
        const { data } = await API.get(`/messages/${friendId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    fetchMessages();
  }, [friendId]);

  useEffect(() => {
    if (socket) {
      socket.on('receive_message', (data) => {
        setMessages((prevMessages) => [...prevMessages, data]);
      });

      return () => socket.off('receive_message');
    }
  }, [socket]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && socket) {
      const msgData = { recipientId: friendId, message };
      socket.emit('send_message', msgData);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'Me', ...msgData, timestamp: new Date().toISOString() },
      ]);
      setMessage('');
    }
  };

  return (
    <div>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>
            <strong>{msg.sender}</strong>: {msg.message} <small>({new Date(msg.timestamp).toLocaleString()})</small>
          </li>
        ))}
      </ul>
      <form onSubmit={handleSendMessage}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;
