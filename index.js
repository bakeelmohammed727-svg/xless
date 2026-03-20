const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const request = require('request');
const serverless = require('serverless-http');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Default route for xless dashboard
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/dashboard.html');
});

// Route to receive and store XSS payloads
app.post('/xss', (req, res) => {
    const payload = req.body;
    console.log('Received XSS Payload:', payload);
    // Here you would typically store the payload in a database
    // For now, we\'ll just log it.
    res.status(200).send('Payload received');
});

// Add more routes as needed for your xless functionality

// This is the important part for Netlify Functions
// We export the Express app wrapped by serverless-http
const handler = serverless(app);

module.exports.handler = async (event, context) => {
  const result = await handler(event, context);
  return result;
};

// Remove the app.listen part, as Netlify Functions don\'t listen on a port
// app.listen(port, () => {
//     console.log(`Xless app listening at http://localhost:${port}`);
// });
