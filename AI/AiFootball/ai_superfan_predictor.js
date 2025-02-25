// AI Superfan Predictor: Full Functional Code
// This app predicts a user's ultimate football soulmate (player or team) based on their behavior.

const express = require('express');
const openai = require('openai');
const fs = require('fs');

const app = express();
app.use(express.json());

// OpenAI API Configuration
const openaiApiKey = 'your-openai-api-key';
openai.apiKey = openaiApiKey;

// Mock user data storage (can be replaced with a database in production)
let userData = [];

// Function to predict football soulmate
async function predictFootballSoulmate(user) {
    const prompt = `Based on the following user behavior data:
    - Favorite Teams: ${user.favoriteTeams.join(', ')}
    - Game-Watching Habits: ${user.gameWatchingHabits.join(', ')}
    - Favorite Players: ${user.favoritePlayers.join(', ')}
    Predict their ultimate football soulmate (player or team) and generate a fun profile.`;

    try {
        const response = await openai.Completion.create({
            engine: 'text-davinci-003',
            prompt,
            max_tokens: 150,
        });
        return response.choices[0].text.trim();
    } catch (error) {
        console.error('Error with OpenAI API:', error);
        throw new Error('Failed to generate prediction.');
    }
}

// API endpoint to add user behavior data
app.post('/add_user_behavior', (req, res) => {
    const { favoriteTeams, gameWatchingHabits, favoritePlayers } = req.body;

    if (!favoriteTeams || !gameWatchingHabits || !favoritePlayers) {
        return res.status(400).json({ error: 'All fields are required: favoriteTeams, gameWatchingHabits, favoritePlayers.' });
    }

    const newUser = {
        id: userData.length + 1,
        favoriteTeams,
        gameWatchingHabits,
        favoritePlayers,
    };

    userData.push(newUser);
    res.json({ message: 'User behavior data added successfully.', userId: newUser.id });
});

// API endpoint to predict football soulmate
app.post('/predict_soulmate/:id', async (req, res) => {
    const userId = parseInt(req.params.id);
    const user = userData.find(u => u.id === userId);

    if (!user) {
        return res.status(404).json({ error: 'User not found.' });
    }

    try {
        const prediction = await predictFootballSoulmate(user);
        res.json({
            user: {
                id: user.id,
                favoriteTeams: user.favoriteTeams,
                gameWatchingHabits: user.gameWatchingHabits,
                favoritePlayers: user.favoritePlayers,
            },
            prediction,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API endpoint to list all users
app.get('/users', (req, res) => {
    res.json(userData);
});

// New endpoint to delete user data
app.delete('/delete_user/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const userIndex = userData.findIndex(u => u.id === userId);

    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found.' });
    }

    userData.splice(userIndex, 1);
    res.json({ message: 'User data deleted successfully.' });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`AI Superfan Predictor running on http://localhost:${PORT}`);
});

// Instructions for running:
// 1. Replace 'your-openai-api-key' with your actual OpenAI API key.
// 2. Start the server using `node <filename>.js`.
// 3. Use endpoints to add data (/add_user_behavior), predict (/predict_soulmate/:id), list users (/users), and delete data (/delete_user/:id).
