qencode-api-node-client
====================

Node library for interacting with the Qencode API.

### Installation

    npm install qencode-api --save

### Usage

Instantiate Qencode API Client:

    const qencodeApiClient = new QencodeApiClient(apiKey);

Create a new job:

```javascript
let task = qencodeApiClient.CreateTask();
task.Start(transcodingProfiles, videoUrl, transferMethod, payload, OutputPathVariables);
```

Query an existing job:

```javascript
let response = task.GetStatus();
```

## Copyright
Copyright 2018 Qencode, Inc.
