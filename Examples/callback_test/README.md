# Callback sample scripts  
Example of sending job with callback_url and payload

- testCallback.js: launches a transcoding job specifying a "callback_url" param and payload for the job.
- callback_handler.js: server side script to accept the callback request. The callback_url param for the job should contain a valid HTTP(S) URL where the callback_handler.js script is working.

## Workflow
1. Install prerequisites for callback_handler.js:
```
npm install express body-parser
``` 
2. Launch callback_handler.js:
```
node callback_handler.js
```
By default it will start the HTTP service on port 3000, the callback url will be http://<your_host>:3000/callback  
You can optionally use [ngrok](https://ngrok.com/) tool on localhost to provide you with a public URL:
```
ngrok http 3000
```
ngrok will provide a public URL (e.g., https://abc123.ngrok.io). Use this URL as the callback URL in Qencode's settings.
3. Excute testCallback.js to run a test job. Don't forget to specify your Qencode API Key and your callback url.  

You should see notifications on callback events in the callback_handler.js output.

