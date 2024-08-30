import React, { useState, useRef, useEffect } from 'react';
import PanZoom from 'react-easy-panzoom';
import { MdSaveAlt } from "react-icons/md";
import { useMatch } from 'react-router-dom';
import './ImageModal.css';

const ImageModal = ({ imageUrl, onClose }) => {
  const [isDragging, setIsDragging] = useState(false);
  const panZoomRef = useRef(null);

  const isChatPage = useMatch('/chat/:friendId');

  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = 'default';
    };

    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleMouseDown = () => {
    setIsDragging(true);
    document.body.style.cursor = 'move';
  };

  const handlePanStart = () => {
    if (isDragging) {
      document.body.style.cursor = 'move';
    }
  };

  const handlePanEnd = () => {
    setIsDragging(false);
    document.body.style.cursor = 'default';
  };

  const handleSaveImage = (e) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'er-net-image.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="image-modal-overlay" onClick={onClose}>
      {isChatPage && (
        <button className="save-image-button save-button" onClick={handleSaveImage}>
          <MdSaveAlt /> Save
        </button>
      )}
      <PanZoom
        ref={panZoomRef}
        autoCenter={true}
        boundaryRatioVertical={0.8}
        boundaryRatioHorizontal={0.8}
        minZoom={1}
        maxZoom={5}
        enableBoundingBox={true}
        disablePanOutside={false}
        onMouseDown={handleMouseDown}
        onPanStart={handlePanStart}
        onPanEnd={handlePanEnd}
        style={{
          width: '100%',
          height: '100%',
          cursor: isDragging ? 'move' : 'default',
        }}
        realPinchZoom={true}
        realPinchZoomMode={'auto'}
      >
        <img src={imageUrl} alt="Full Size" className="image-modal-img" />
      </PanZoom>
    </div>
  );
};

export default ImageModal;
