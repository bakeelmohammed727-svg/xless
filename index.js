const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const serverless = require('serverless-http');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Dashboard route
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Root route to redirect to dashboard or serve index.html if it exists
app.get('/', (req, res) => {
    res.redirect('/dashboard');
});

// Error handling for 404 - This should be after all other routes
app.use((req, res, next) => {
    res.status(404).send('Sorry, that route does not exist.');
});

// If running locally, start the server directly
if (process.env.NODE_ENV === 'development') {
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
} else {
    // For Netlify, export the handler
    module.exports.handler = serverless(app);
}
