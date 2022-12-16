qencode-api-node-client
====================

Node library for interacting with the Qencode API.

### Installation

    npm install qencode-api --save

### Usage

Instantiate Qencode API Client:

    const qencodeApiClient = await new QencodeApiClient(apiKey);

Or:

    const qencodeApiClient = await new QencodeApiClient({key: apiKey, endpoint: 'https://api-us-west.qencode.com'});

Create a new job:

```javascript
let task = await qencodeApiClient.CreateTask();
await task.Start(transcodingProfiles, videoUrl, transferMethod, payload, OutputPathVariables);
```

Query an existing job:

```javascript
let response = await task.GetStatus();
```

## Copyright
Copyright 2018 Qencode, Inc.
