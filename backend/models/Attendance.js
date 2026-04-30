javascript
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId:    { type: String, required: true },
  userName:  { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  date:      { type: String, required: true }
});

attendanceSchema.index({ date: 1 });
attendanceSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
