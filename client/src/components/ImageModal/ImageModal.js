import React from 'react';
import './ImageModal.css';

const ImageModal = ({ imageUrl, onClose }) => {
  return (
    <div className="image-modal-overlay" onClick={onClose}>
      <div className="image-modal">
        <img src={imageUrl} alt="Full Size" />
      </div>
    </div>
  );
};

export default ImageModal;
