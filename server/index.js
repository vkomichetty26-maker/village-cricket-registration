require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Player = require('./models/Player');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for Base64 image uploads

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Connected to MongoDB Atlas'))
.catch((err) => console.error('MongoDB connection error:', err));

// Routes

// Get all players
app.get('/api/players', async (req, res) => {
  try {
   const players = await Player.find();
players.sort((a, b) => new Date(b.registeredAt || 0) - new Date(a.registeredAt || 0));
    // Transform _id to id for frontend compatibility
    const formattedPlayers = players.map(p => {
      const obj = p.toObject();
      obj.id = obj._id.toString();
      delete obj._id;
      delete obj.__v;
      return obj;
    });
    res.json(formattedPlayers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new player
app.post('/api/players', async (req, res) => {
  try {
    const newPlayer = new Player(req.body);
    const savedPlayer = await newPlayer.save();
    
    const obj = savedPlayer.toObject();
    obj.id = obj._id.toString();
    
    res.status(201).json(obj);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a player
app.put('/api/players/:id', async (req, res) => {
  try {
    const updatedPlayer = await Player.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    
    if (!updatedPlayer) return res.status(404).json({ message: 'Player not found' });
    
    const obj = updatedPlayer.toObject();
    obj.id = obj._id.toString();
    
    res.json(obj);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a player
app.delete('/api/players/:id', async (req, res) => {
  try {
    const deletedPlayer = await Player.findByIdAndDelete(req.params.id);
    if (!deletedPlayer) return res.status(404).json({ message: 'Player not found' });
    res.json({ message: 'Player deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const path = require('path');

// Serve static frontend in production
app.use(express.static(path.join(__dirname, '../dist')));

// Catch-all route to serve the React index.html
app.get(/^(.*)$/, (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
