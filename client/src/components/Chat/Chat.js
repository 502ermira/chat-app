import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api';
import ImageModal from '../ImageModal/ImageModal';
import './Chat.css';
import { GoArrowLeft } from "react-icons/go";
import { MdOutlineManageAccounts } from "react-icons/md";
import { IoCheckmarkDone } from "react-icons/io5";
import { TbPhoto } from "react-icons/tb";
import { BsSend } from "react-icons/bs";
import { useUnseenMessages } from '../../contexts/UnseenMessagesContext';
import CustomAlert from '../CustomAlert/CustomAlert';
import { FaAnglesDown } from "react-icons/fa6";
import imageCompression from 'browser-image-compression';

const Chat = ({ friendId, userId }) => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [image, setImage] = useState(null);
  const [friendUsername, setFriendUsername] = useState('');
  const [friendFullName, setFriendFullName] = useState('');
  const [friendProfilePicture, setFriendProfilePicture] = useState('');
  const [isFriend, setIsFriend] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [friendTyping, setFriendTyping] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [showNewMessagesIndicator, setShowNewMessagesIndicator] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const socket = useSocket();
  const messagesEndRef = useRef(null);
  const observer = useRef();
  const typingTimeoutRef = useRef(null);
  const isAtBottomRef = useRef(true);
  const { fetchUnseenMessagesCount } = useUnseenMessages();
  const MESSAGE_CHAR_LIMIT = 3100;

  useEffect(() => {
    const fetchFriendUsername = async () => {
      const token = localStorage.getItem('token');
      try {
        const { data } = await API.get(`/friends/user/${friendId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFriendUsername(data.username);
        setFriendFullName(data.fullName);
        setFriendProfilePicture(data.profilePicture);
      } catch (error) {
        console.error('Error fetching friend username:', error);
      }
    };
    fetchFriendUsername();
  }, [friendId]);

  useEffect(() => {
    const fetchMessages = async () => {
      const token = localStorage.getItem('token');
      setLoading(true);
      try {
        const { data } = await API.get(`/messages/${friendId}?limit=20`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchedMessages = data.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
          seenAt: msg.seenAt ? new Date(msg.seenAt) : null,
        }));
        setMessages(fetchedMessages);
        setHasMore(data.length === 20);
  
        if (socket && socket.connected && fetchedMessages.length > 0) {
          socket.emit('messages_seen', { friendId });
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [friendId, socket]);  

  useEffect(() => {
    if (isAtBottomRef.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [messages]);  

  useEffect(() => {
    const handleReceiveMessage = (data) => {
      if (data.sender._id === friendId || data.recipient._id === friendId) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { ...data, timestamp: new Date(data.timestamp), seenAt: data.seenAt ? new Date(data.seenAt) : null },
        ]);
        if (isAtBottomRef.current && messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        } else {
          setShowNewMessagesIndicator(true);
        }
        socket.emit('messages_seen', { friendId });
      }
    };
  
    const handleMessagesSeen = async ({ friendId: senderId }) => {
      if (senderId === friendId) {
        try {
          const token = localStorage.getItem('token');
          const { data } = await API.get(`/messages/${friendId}?limit=20`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const updatedMessages = data.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
            seenAt: msg.seenAt ? new Date(msg.seenAt) : null,
          }));
          setMessages(updatedMessages);
        } catch (error) {
          console.error('Error fetching updated messages:', error);
        }
      }
    };
  
    const handleTyping = ({ friendId: typingFriendId }) => {
      if (typingFriendId === friendId) {
        setFriendTyping(true);
      }
    };
  
    const handleStopTyping = ({ friendId: typingFriendId }) => {
      if (typingFriendId === friendId) {
        setFriendTyping(false);
      }
    };
  
    if (socket) {
      socket.on('receive_message', handleReceiveMessage);
      socket.on('messages_seen', handleMessagesSeen);
      socket.on('typing', handleTyping);
      socket.on('stop_typing', handleStopTyping);
    }
  
    return () => {
      if (socket) {
        socket.off('receive_message', handleReceiveMessage);
        socket.off('messages_seen', handleMessagesSeen);
        socket.off('typing', handleTyping);
        socket.off('stop_typing', handleStopTyping);
      }
    };
  }, [socket, friendId]);
  
    useEffect(() => {
    const checkFriendStatus = async () => {
      try {
        const { data } = await API.get(`friends/friend/${friendId}`);
        setIsFriend(data.isFriend);
      } catch (error) {
        console.error('Error checking friend status', error);
      }
    };

    checkFriendStatus();
  }, [friendId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!isFriend) {
      alert('You cannot send messages to non-friends');
      return;
    }
    if (message.length > MESSAGE_CHAR_LIMIT) {
      setAlertMessage(`Message is too long!`);
      return;
    }
    if ((message.trim() || image) && socket && socket.connected) {
      const formData = new FormData();
      formData.append('recipientId', friendId);
      formData.append('message', message);
  
      if (image) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Image = reader.result.split(',')[1];
          formData.append('image', base64Image);
          formData.append('imageType', image.type);
  
          const newMessage = {
            sender: { _id: userId },
            message,
            image: `data:${image.type};base64,${base64Image}`,
            timestamp: new Date(),
            seen: false,
            seenAt: null,
          };
  
          socket.emit('send_message', Object.fromEntries(formData));
          setMessages((prevMessages) => [...prevMessages, newMessage]);
          setMessage('');
          setImage(null);
          setImagePreviewUrl(null); 
  
          if (isAtBottomRef.current && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        };
        reader.readAsDataURL(image);
      } else {
        const newMessage = {
          sender: { _id: userId },
          message,
          timestamp: new Date(),
          seen: false,
          seenAt: null,
        };
  
        socket.emit('send_message', Object.fromEntries(formData));
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setMessage('');
  
        if (isAtBottomRef.current && messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }
  
      if (isTyping) {
        socket.emit('stop_typing', { friendId });
        setIsTyping(false);
      }
    }
  };  

  const closeAlert = () => {
    setAlertMessage(null);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      };
  
      let compressedFile = await imageCompression(file, options);
  
      const MAX_ALLOWED_SIZE_MB = 10;
      const fileSizeMB = compressedFile.size / 1024 / 1024;
  
      if (fileSizeMB > MAX_ALLOWED_SIZE_MB) {
        options.maxSizeMB = 7;
        options.maxWidthOrHeight = 400;
        compressedFile = await imageCompression(file, options);
      }
  
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result);
        setImage(compressedFile);
      };
      reader.readAsDataURL(compressedFile);
    }
  };  

  const clearSelectedImage = () => {
    setImage(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
      return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
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
      const moreMessages = data.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
        seenAt: msg.seenAt ? new Date(msg.seenAt) : null,
      }));
      setMessages((prevMessages) => [
        ...moreMessages,
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

  const handleScrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      setShowNewMessagesIndicator(false);
    }
  };  

  useEffect(() => {
    const handleScroll = () => {
      if (messagesEndRef.current) {
        const isAtBottom = messagesEndRef.current.getBoundingClientRect().bottom <= window.innerHeight;
        isAtBottomRef.current = isAtBottom;
      }
    };
  
    const messageList = document.querySelector('.message-list');
    if (messageList) {
      messageList.addEventListener('scroll', handleScroll);
    }
  
    return () => {
      if (messageList) {
        messageList.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);  
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessages(prevMessages => [...prevMessages]);
    }, 3000);
  
    return () => clearInterval(intervalId);
  }, []);
  
  const renderMessages = () => {
    let lastDate = null;
    let lastMessageSeen = null;
    let lastMessageSentByUser = null;

    const filteredMessages = messages.filter(msg => !msg.deletedFor?.includes(userId));

    const messageElements = filteredMessages.map((msg, index) => {
    const currentDate = formatDate(new Date(msg.timestamp));
    const showDate = currentDate !== lastDate;
    lastDate = currentDate;

      const isSentMessage = msg.sender && msg.sender._id === userId;
      const ref = index === 0 ? lastMessageElementRef : null;

      if (isSentMessage) {
        lastMessageSentByUser = msg;
      } else {
        lastMessageSentByUser = null;
      }

      return (
        <React.Fragment key={msg._id || index}>
        {showDate && <div className="date-separator" key={`date-${index}`}>{currentDate}</div>}
        <li className={`message ${isSentMessage ? 'sent' : 'received'}`} ref={ref} key={`msg-${index}`}>
          {msg.message} <span className="timestamp">
            {formatTime(new Date(msg.timestamp))}
            {isSentMessage && msg.seen && <IoCheckmarkDone className="seen-checkmark" />}
          </span>
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

    const formatTimeSince = (timestamp) => {
      const now = new Date();
      const diff = now - timestamp;

      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const weeks = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
      const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
      const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));

      if (years > 0) {
        return years === 1 ? 'a year ago' : `${years} years ago`;
      }
      if (months > 0) {
        return months === 1 ? 'a month ago' : `${months} months ago`;
      }
      if (weeks > 0) {
        return weeks === 1 ? 'a week ago' : `${weeks} weeks ago`;
      }
      if (days > 0) {
        return days === 1 ? 'a day ago' : `${days} days ago`;
      }
      if (hours > 0) {
        return hours === 1 ? 'an hour ago' : `${hours} hours ago`;
      }
      if (minutes > 0) {
        return minutes === 1 ? 'a minute ago' : `${minutes} minutes ago`;
      }
      if (seconds < 16) {
        return 'just now';
      }
      return seconds === 1 ? 'a second ago' : `${seconds} seconds ago`;
    };

    if (lastMessageSentByUser && lastMessageSentByUser.seen) {
      lastMessageSeen = (
        <div className="last-seen-status">
          Seen {formatTimeSince(new Date(lastMessageSentByUser.seenAt))}
        </div>
      );
    }

    return (
      <>
        {messageElements}
        {lastMessageSeen}
      </>
    );
  };

  useEffect(() => {
    if (socket && messages.length > 0) {
      const hasUnseenMessages = messages.some(msg => !msg.seen && msg.sender._id === friendId);
      if (hasUnseenMessages) {
        socket.emit('messages_seen', { friendId });
        fetchUnseenMessagesCount();
      }
    }
  }, [socket, messages, friendId]);

  const handlePaste = (e) => {
    const pasteData = e.clipboardData.getData('text');
    const currentMessage = e.target.value;
    const combinedLength = currentMessage.length + pasteData.length;
    if (combinedLength > MESSAGE_CHAR_LIMIT) {
      e.preventDefault();
      setAlertMessage(`Your message is too long. Please try a shorter message.`);
    }
  };  
  
  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    if (inputValue.length <= MESSAGE_CHAR_LIMIT) {
      setMessage(inputValue);
  
      if (!isTyping && inputValue.trim()) {
        setIsTyping(true);
        socket.emit('typing', { friendId });
  
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
          socket.emit('stop_typing', { friendId });
        }, 3000);
      } else {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
          socket.emit('stop_typing', { friendId });
        }, 3000);
      }
    }
  };  

  return (
    <div className="chat-container">
      <div className="chat-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <GoArrowLeft />
        </button>
        <div className="chat-header-left">
          <img
            src={friendProfilePicture || 'https://i0.wp.com/www.repol.copl.ulaval.ca/wp-content/uploads/2019/01/default-user-icon.jpg?ssl=1'}
            alt="Profile"
            className="chat-profile-picture"
            onClick={() => openModal(friendProfilePicture || 'https://i0.wp.com/www.repol.copl.ulaval.ca/wp-content/uploads/2019/01/default-user-icon.jpg?ssl=1')}
          />
          <div className="chat-header-info">
            <p className="friend-fullname">{friendFullName}</p>
            {!friendTyping && <p className="friend-username">@{friendUsername}</p>}
            {friendTyping && <div className="typing-indicator">Typing...</div>}
          </div>
        </div>
        <button className="profile-button" onClick={() => navigate(`/friend/${friendId}`)}>
          <MdOutlineManageAccounts />
        </button>
      </div>
       {showNewMessagesIndicator && (
         <div className="new-messages-indicator" onClick={handleScrollToBottom}>
          <FaAnglesDown />New Messages
         </div>
        )}
      <ul className="message-list">
        {renderMessages()}
        <div ref={messagesEndRef} />
      </ul>
      <form className="message-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={message}
          onChange={handleInputChange}
          onPaste={handlePaste}
          placeholder={isFriend ? "Type a message..." : "You cannot send messages to this user"}
          disabled={!isFriend}
          className={!isFriend ? "disabled-input" : ""}
        />
        <label className="image-upload-label">
          <input type="file" onChange={handleImageChange} disabled={!isFriend} ref={fileInputRef} accept="image/*" />
          <TbPhoto />
        </label>
        <button type="submit" disabled={!isFriend}><BsSend /></button>
        {imagePreviewUrl && (
           <div className="image-preview">
             <img src={imagePreviewUrl} alt="Preview" />
             <button type="button" onClick={clearSelectedImage}>
             <span className="clear-image-button">✖</span>
             </button>
           </div>
        )}
      </form>
      {!isFriend && (
        <div className="friendship-suggestion">
          <p>To send a message, you need to <Link to="/friends">become friends</Link>.</p>
        </div>
      )}
      {showModal && <ImageModal imageUrl={modalImage} onClose={closeModal} />}
      {alertMessage && <CustomAlert message={alertMessage} onClose={closeAlert} />}
    </div>
  );
};

export default Chat;