const fs = require("fs");
const tus = require('tus-js-client');
const QencodeApiClient = require('qencode-api');

let path = '/home/moroz/Documents/git/regression-tests/tests/tus/upload_test.mp4';

var size = fs.statSync(path).size;

const apiKey = "";

const { exec } = require("child_process");


async function main() {
    try {
        const qencodeApiClient = await new QencodeApiClient({ key: apiKey, endpoint: 'https://api.qencode.com' });

        console.log("qencodeApiClient: ", qencodeApiClient);
        console.log("AccessToken: ", qencodeApiClient.AccessToken);

        let task = await qencodeApiClient.CreateTask();
        console.log("Created new task: ", task.taskToken);
        console.log("Upload URL: ", task.uploadUrl);

        var size = fs.statSync(path).size;
        console.log("Upload size, bytes: ", size);

        var chunkSize = get_chunk_size(size);
        var uploadUrl = `${task.uploadUrl}/${task.taskToken}`;
        console.log("uploadUrl: ", uploadUrl);

        exec(`python ./upload.py ${path} ${uploadUrl} ${chunkSize}`, async (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            let cleaned_source_uri = stdout.trim();
            console.log(`Cleaned source URI: ${cleaned_source_uri}`);
            await launch_transcoding(cleaned_source_uri, task);
        });

    } catch (error) {
        console.error("Error:", error);
    }
}

function get_chunk_size(size) {
    var chunk_size = Math.round(size / 30);
    var min_size = 200000;
    var max_size = 104857600;
    return Math.min(Math.max(chunk_size, min_size), max_size);
}

async function launch_transcoding(source_uri, task) {
    let transcodingParams = {
        "source": source_uri,
        "format": [
            {
                "output": "repack"
            }
        ]
    };
    var payload = 'Direct upload from NodeJS with Python test';
    await task.StartCustom(transcodingParams, payload);
    console.log("Status URL: ", task.statusUrl);

    await checkTaskStatus(task);
}

async function checkTaskStatus(task) {
    while (true) {
        let status = await task.GetStatus();
        console.log("Status: ", status.status);
        if (status.status === "completed") break;
        await sleep(5000);
    }
    console.log('Done');
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main();
