const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware to parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: true }));

// POST endpoint to handle the callback
app.post('/callback', (req, res) => {
    // Extracting the task token and payload from the request body
    const taskToken = req.body.task_token;
    const event = req.body.event;
    const payload = req.body.payload ? JSON.parse(req.body.payload) : null;

    // Logging the task token and payload
    console.log('Received Callback');
    console.log('Task Token:', taskToken);
    console.log('Event:', event)
    if (payload) {
        console.log('Payload:', payload);
    }

    // Sending a response back to the caller
    res.send('Callback received');
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
