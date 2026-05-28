const fs = require("fs");
const tus = require("tus-js-client");
const QencodeApiClient = require("qencode-api");

let path = "upload_test.mp4";

var size = fs.statSync(path).size;
const apiKey = "";

async function main() {
    try {
        const qencodeApiClient = await new QencodeApiClient({ key: apiKey, endpoint: "https://api.qencode.com" });

        console.log("qencodeApiClient: ", qencodeApiClient);
        console.log("AccessToken: ", qencodeApiClient.AccessToken);

        let task = await qencodeApiClient.CreateTask();
        console.log("Created new task: ", task.taskToken);
        console.log("Upload URL: ", task.uploadUrl);

        var chunkSize = get_chunk_size(size);
        var uploadUrl = `${task.uploadUrl}/${task.taskToken}`;
        console.log("uploadUrl: ", uploadUrl);

        uploadFile(path, uploadUrl, chunkSize, task);

    } catch (error) {
        console.error("Error:", error);
    }
}

function get_chunk_size(size) {
    var chunk_size = Math.round(size / 5);
    var min_size = 5 * 1024 * 1024;
    var max_size = 50 * 1024 * 1024;
    return Math.min(Math.max(chunk_size, min_size), max_size);
}

function uploadFile(filePath, uploadUrl, chunkSize, task) {
    const file = fs.createReadStream(filePath);
    const options = {
        endpoint: uploadUrl,
        chunkSize: chunkSize,
        metadata: {
            filename: filePath.split("/").pop(),
            filetype: "video/mp4",
        },
        uploadSize: size,
        storeFingerprintForResuming: true, 
        onError: function (error) {
            console.log("Upload failed:", error);
        },
        onProgress: function (bytesUploaded, bytesTotal) {
            let percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
            console.log(`Upload progress: ${percentage}%`);
        },
        onSuccess: async function () {
            console.log("Upload complete!");

            let tusUrl = upload.url;
            if (!tusUrl) {
                console.error("Error: tus upload URL is null!");
                return;
            }

            const tusId = tusUrl.split("/").pop();
            let source_uri = `tus:${tusId}`;
            console.log(`Cleaned source URI: ${source_uri}`);

            await launch_transcoding(source_uri, task);
        },
    };

    const upload = new tus.Upload(file, options);
    upload.start();
}

async function launch_transcoding(source_uri, task) {
    let transcodingParams = {
        source: source_uri,
        format: [
            {
                output: "repack",
            },
        ],
    };
    var payload = "Direct upload from NodeJS with tus-js-client";
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
    console.log("Done");
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

main();
