import React from 'react';
import './CustomAlert.css';

const CustomAlert = ({ message, onClose }) => (
    <div className="custom-alert">
      <div className="custom-alert-content">
        <p>{message}</p>
        <button onClick={onClose}>OK</button>
      </div>
    </div>
  );
  

export default CustomAlert
