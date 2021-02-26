const fs = require("fs");
const tus = require('tus-js-client');
const QencodeApiClient = require('qencode-api');

let path = '/path/to/your/local/video.mp4';
//var file = fs.createReadStream(path);
var size = fs.statSync(path).size;

const apiKey = "your-API-key-here";

const qencodeApiClient = new QencodeApiClient({key: apiKey, endpoint: 'https://api.qencode.com'});
console.log("AccessToken: ", qencodeApiClient.AccessToken);

let task = qencodeApiClient.CreateTask();
console.log("Created new task: ", task.taskToken);
console.log("Upload URL: ", task.uploadUrl);
console.log("Upload size, bytes: ", size);

var chunkSize = get_chunk_size(size);
var uploadUrl = task.uploadUrl + '/' + task.taskToken;
const { exec } = require("child_process");

exec(`python ./upload.py ${path} ${uploadUrl} ${chunkSize}`, (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
    launch_transcoding(stdout, task);
});


function get_chunk_size(size) {
    chunk_size = Math.round(size / 30);
    var min_size = 200000;
    var max_size = 104857600;
    if (chunk_size < min_size) {
        chunk_size = min_size;
    } else {
        if (chunk_size > max_size) {
            chunk_size = max_size;
        }
    }
    return chunk_size;
}

function launch_transcoding(source_uri, task) {
    let transcodingParams = {
        "source": source_uri,
        "format": [
            {
                "output": "mp4",
                "size": "320x240",
                "video_codec": "libx264"
            }
        ]
    };
    var payload = 'Direct upload from NodeJS with Python test';
    task.StartCustom(transcodingParams, payload);
    console.log("Status URL: ", task.statusUrl);

    CheckTaskStatus();
}

async function CheckTaskStatus(){
    while (task.GetStatus().status != "completed") {
        console.log("Status: ", task.GetStatus().status);
        await sleep(5000);
    }
    console.log('Done');
}

function sleep(ms){
    return new Promise(resolve=>{
            setTimeout(resolve,ms)
        })
}

