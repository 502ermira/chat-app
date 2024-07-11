const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String },
  image: { type: Buffer },
  imageType: { type: String },
  timestamp: { type: Date, default: Date.now },
  seen: { type: Boolean, default: false } 
});

messageSchema.virtual('imagePath').get(function() {
  if (this.image != null && this.imageType != null) {
    return `data:${this.imageType};charset=utf-8;base64,${this.image.toString('base64')}`;
  }
});

messageSchema.set('toJSON', { virtuals: true });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
