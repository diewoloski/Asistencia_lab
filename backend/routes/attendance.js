const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Attendance = require('../models/Attendance');

router.post('/checkin', async (req, res) => {
  try {
    const { userId, pin } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId es requerido' });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (user.pin && user.pin !== pin) {
      return res.status(401).json({ error: 'PIN incorrecto' });
    }

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recent = await Attendance.findOne({
      userId: user.userId,
      timestamp: { $gte: fiveMinutesAgo }
    });
    if (recent) {
      return res.status(409).json({ error: 'Ya registraste tu entrada recientemente' });
    }

    const today = new Date().toISOString().slice(0, 10);
    const attendance = new Attendance({
      userId: user.userId,
      userName: user.name,
      date: today
    });
    await attendance.save();

    res.status(201).json({
      message: 'Asistencia registrada exitosamente',
      attendance: {
        userId: attendance.userId,
        userName: attendance.userName,
        timestamp: attendance.timestamp
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.get('/today', async (req, res) => {
  try {
    const dateParam = req.query.date || new Date().toISOString().slice(0, 10);
    const attendances = await Attendance.find({ date: dateParam })
      .sort({ timestamp: -1 })
      .select('userId userName timestamp -_id');
    res.json(attendances);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener asistencias' });
  }
});

module.exports = router;
