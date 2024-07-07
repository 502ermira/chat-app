import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import API from '../../api';
import ImageModal from '../ImageModal/ImageModal';
import './Chat.css';

const Chat = ({ friendId, userId }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [image, setImage] = useState(null);
  const [friendUsername, setFriendUsername] = useState('');
  const [modalImage, setModalImage] = useState(null); 
  const [showModal, setShowModal] = useState(false); 
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const socket = useSocket();
  const messagesEndRef = useRef(null);
  const observer = useRef();

  // Fetch friend's username
  useEffect(() => {
    const fetchFriendUsername = async () => {
      const token = localStorage.getItem('token');
      try {
        const { data } = await API.get(`/friends/user/${friendId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFriendUsername(data.username);
      } catch (error) {
        console.error('Error fetching friend username:', error);
      }
    };
    fetchFriendUsername();
  }, [friendId]);

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      const token = localStorage.getItem('token');
      setLoading(true);
      try {
        const { data } = await API.get(`/messages/${friendId}?limit=20`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(data.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })));
        setHasMore(data.length === 20);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [friendId]);

  // Scroll to the bottom of the chat initially
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [messages]);

  // Handle receiving messages in real-time
  useEffect(() => {
    if (socket) {
      socket.on('receive_message', (data) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { ...data, timestamp: new Date(data.timestamp) },
        ]);
      });

      return () => socket.off('receive_message');
    }
  }, [socket]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if ((message.trim() || image) && socket) {
      const formData = new FormData();
      formData.append('recipientId', friendId);
      formData.append('message', message);

      if (image) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Image = reader.result.split(',')[1];
          formData.append('image', base64Image);
          formData.append('imageType', image.type);

          socket.emit('send_message', Object.fromEntries(formData));
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              sender: userId,
              message,
              image: `data:${image.type};base64,${base64Image}`,
              timestamp: new Date(),
            },
          ]);
          setMessage('');
          setImage(null);
        };
        reader.readAsDataURL(image);
      } else {
        socket.emit('send_message', Object.fromEntries(formData));
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: userId, message, timestamp: new Date() },
        ]);
        setMessage('');
      }
    }
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatDate = (date) => {
    const now = new Date();
    const diff = now - date;
    const oneDay = 24 * 60 * 60 * 1000;

    if (diff < oneDay) {
      return 'Today';
    } else if (diff < 2 * oneDay) {
      return 'Yesterday';
    } else if (diff < 7 * oneDay) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      return date.toLocaleDateString();
    }
  };

  const openModal = (imageUrl) => {
    setModalImage(imageUrl);
    setShowModal(true);
  };

  const closeModal = () => {
    setModalImage(null);
    setShowModal(false);
  };

  const fetchMoreMessages = async () => {
    const token = localStorage.getItem('token');
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const lastMessageTimestamp = messages[0]?.timestamp || new Date();
      const { data } = await API.get(`/messages/${friendId}?limit=20&before=${lastMessageTimestamp.toISOString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages((prevMessages) => [
        ...data.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
        ...prevMessages
      ]);
      setHasMore(data.length === 20);
    } catch (error) {
      console.error('Error fetching more messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const lastMessageElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchMoreMessages();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const renderMessages = () => {
    let lastDate = null;
    return messages.map((msg, index) => {
      const currentDate = formatDate(msg.timestamp);
      const showDate = currentDate !== lastDate;
      lastDate = currentDate;

      return (
        <React.Fragment key={index}>
          {showDate && <div className="date-separator">{currentDate}</div>}
          <li className={`message ${msg.sender === userId ? 'sent' : 'received'}`} ref={index === 0 ? lastMessageElementRef : null}>
            {msg.message} <span className="timestamp">{formatTime(msg.timestamp)}</span>
            {msg.image && (
              <img
                src={msg.imagePath || msg.image}
                alt="Sent"
                className="message-image"
                onClick={() => openModal(msg.imagePath || msg.image)}
              />
            )}
          </li>
        </React.Fragment>
      );
    });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>{friendUsername}</h2>
      </div>
      <ul className="message-list">
        {renderMessages()}
        <div ref={messagesEndRef} />
      </ul>
      <form className="message-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <label className="image-upload-label">
          <input type="file" accept="image/*" onChange={handleImageChange} />
          Send Photo
        </label>
        <button type="submit">Send</button>
      </form>
      {showModal && <ImageModal imageUrl={modalImage} onClose={closeModal} />} 
    </div>
  );
};

export default Chat;