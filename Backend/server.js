const express = require('express');
var cors = require('cors');
const User = require('./models/User');
const app = express();

app.use(cors()); 
app.use(express.json());

const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/Audyssey', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

app.post('/api/update-score', async (req, res) => {
    const { jeopardy_score, guess_game_score, userEmail, userId, score } = req.body;
    console.log('Received update-score:', req.body);


    try {
        const user = await User.findOne({ email: userEmail });
        console.log("User found: ", user);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Only update if it's a new high score
        if (score > user.finish_lyrics_score) {
            user.finish_lyrics_score = score;
            await user.save();
        }

        if (guess_game_score > user.guess_game_score){
            user.guess_the_song_score = guess_game_score;
            await user.save();
        }

        if (jeopardy_score > user.jeopardy_score){
          user.jeopardy_score = jeopardy_score;
          await user.save();
        }

        res.json({ message: 'Score updated', score: user.finish_lyrics_score, guess_game_score: user.guess_the_song_score });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

const PORT = 5001;

app.listen(PORT, () => {
  console.log(`Backend server is LIVE on http://localhost:${PORT}`);
});