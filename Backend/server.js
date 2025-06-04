const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for all routes
app.use(cors({
    origin: 'http://127.0.0.1:5501', // Your frontend URL
    credentials: true // This is important for cookies/sessions
}));

// ... existing code ... 