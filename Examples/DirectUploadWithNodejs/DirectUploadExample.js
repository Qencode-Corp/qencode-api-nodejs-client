/**
 * Qencode direct upload + transcode test
 *
 * Uploads a local video file to Qencode via the tus.io resumable-upload
 * protocol, then kicks off a transcoding job using the uploaded file
 * as the source ('tus:<file_uuid>').
 *
 * Install deps:
 *   npm install qencode-api tus-js-client
 *
 * Usage:
 *   node DirectUploadExample.js /path/to/local/video.mp4
 */

const fs = require("fs");
const path = require("path");
const tus = require("tus-js-client");
const QencodeApiClient = require("qencode-api");

// Hardcoded for demo simplicity. Don't commit real keys to shared/public
// repos -- fine for a local one-off test like this.
const API_KEY = "your-qencode-api-key";
const FILE_PATH = process.argv[2];

if (!FILE_PATH || !fs.existsSync(FILE_PATH)) {
  console.error("Usage: node DirectUploadExample.js /path/to/video.mp4");
  process.exit(1);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const qencodeApiClient = await new QencodeApiClient(API_KEY);

  // 1. Create a task. The response includes upload_url + task_token,
  //    which together make up the tus upload endpoint.
  const task = await qencodeApiClient.CreateTask();
  const uploadEndpoint = `${task.uploadUrl}/${task.taskToken}`;

  console.log("Task token:", task.taskToken);
  console.log("Upload endpoint:", uploadEndpoint);

  const fileStream = fs.createReadStream(FILE_PATH);
  const fileSize = fs.statSync(FILE_PATH).size;
  const fileName = path.basename(FILE_PATH);

  // 2. Upload the file via tus.
  const fileUuid = await new Promise((resolve, reject) => {
    const upload = new tus.Upload(fileStream, {
      endpoint: uploadEndpoint,
      uploadSize: fileSize,
      retryDelays: [0, 1000, 3000, 5000],
      metadata: {
        filename: fileName,
        filetype: "video/mp4",
      },
      onError: (error) => reject(error),
      onProgress: (bytesUploaded, bytesTotal) => {
        const pct = ((bytesUploaded / bytesTotal) * 100).toFixed(1);
        process.stdout.write(`\rUploading: ${pct}%`);
      },
      onSuccess: () => {
        console.log("\nUpload complete:", upload.url);
        // The file_uuid is the last path segment of the tus upload URL.
        const uuid = upload.url.split("/").pop();
        resolve(uuid);
      },
    });

    upload.findPreviousUploads().then((previous) => {
      if (previous.length) upload.resumeFromPreviousUpload(previous[0]);
      upload.start();
    });
  });

  console.log("File UUID:", fileUuid);

  // 3. Start transcoding using the uploaded file as source.
  //    Defaults mirror the reference React app's query (no destination
  //    specified -> output saved to Qencode temporary storage, 24h retention).
  const transcodingParams = {
    source: `tus:${fileUuid}`,
    encoder_version: "2",
    format: [
      {
        output: "mp4",
        video_codec: "libx264",
        height: 360,
        quality: 20,
      },
    ],
  };

  await task.StartCustom(transcodingParams);
  console.log("Transcoding started.");

  // 4. Poll status until completed.
  let status;
  do {
    status = await task.GetStatus();
    console.log(`Status: ${status.status} | Progress: ${status.percent || 0}%`);
    if (status.status !== "completed") await sleep(5000);
  } while (status.status !== "completed" && !status.error);

  if (status.error) {
    console.error("Transcoding failed:", status.error_description);
  } else {
    console.log("Done. Output(s):");
    (status.videos || []).forEach((v) => console.log(" -", v.url));
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
