// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');
const path = require('path');
const fs = require('fs');

// Set the region 
AWS.config.update({region: 'us-west',
  accessKeyId: 'YOUR-ACCESS-KEY-ID', //Replace with your access key ID
  secretAccessKey: 'YOUR-SECRET-ACCESS-KEY', //Replace with your secret access key
});

// Create S3 service object
const s3 = new AWS.S3({apiVersion: '2006-03-01',
    endpoint: 'https://us-west.s3.qencode.com'
});

// Call S3 to retrieve upload file to specified bucket
const uploadParams = {Bucket: 'your-bucket-name', Key: '', Body: ''}; //Replace with your bucket name
const file = "/local/path/to/video.mp4"; // Replace with the file path and name to upload

// Configure the file stream and obtain the upload parameters
const fileStream = fs.createReadStream(file);
fileStream.on('error', function(err) {
  console.log('File Error', err);
});
uploadParams.Body = fileStream;
uploadParams.Key = path.basename(file);

// Call S3 to upload the file to the bucket
s3.upload (uploadParams, function (err, data) {
  if (err) {
    console.log("Error", err);
  } if (data) {
    console.log("Upload Success", data.Location);
  }
});
