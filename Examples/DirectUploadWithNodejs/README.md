# qencode-tus-demo-nodejs

A small Node.js script for testing direct video upload + transcoding via the
[Qencode API](https://docs.qencode.com/), using the `tus.io` resumable upload
protocol.

It uploads a local video file straight to Qencode (no need to host the file
somewhere first), then kicks off a transcoding job using the uploaded file as
the source.

## How it works

1. `CreateTask()` (via the [`qencode-api`](https://www.npmjs.com/package/qencode-api) SDK) returns an `uploadUrl` + `taskToken`.
2. The file is uploaded via [`tus-js-client`](https://www.npmjs.com/package/tus-js-client) to `<uploadUrl>/<taskToken>`.
3. The last path segment of the resulting upload URL is the `file_uuid`, which becomes the transcoding source: `tus:<file_uuid>`.
4. `task.StartCustom(...)` starts the job with that source.
5. The script polls `task.GetStatus()` every 5 seconds until the job completes.

## Requirements

- Node.js 16+
- A Qencode account and API key ([get one here](https://cloud.qencode.com/))

## Setup

```bash
npm install qencode-api tus-js-client
```

Project folder should look like:

```
qencode-tus-demo-nodejs/
├── DirectUploadExample.js
├── example.mp4              # your test video
├── package.json
├── package-lock.json
└── node_modules/
```

## Usage

Open `DirectUploadExample.js` and replace `"your-qencode-api-key"` with
your actual Qencode Project API key, then run:

```bash
node DirectUploadExample.js example.mp4
```

- The script accepts a relative or absolute path to the video file as its
  only argument.
- The API key is hardcoded at the top of the script for demo simplicity —
  fine for local one-off testing, but don't commit it to a shared/public
  repo.

## Default transcoding settings

The script currently requests a single output:

```json
{
  "encoder_version": "2",
  "format": [
    {
      "output": "mp4",
      "video_codec": "libx264",
      "height": 360,
      "quality": 20
    }
  ]
}
```

- `quality` is a CRF value (lower = higher quality; 18–28 is a typical sane
  range).
- No `destination` is set, so the output is saved to Qencode's temporary
  storage and available for download for 24 hours. Add a `destination`
  object (S3, FTP, etc.) to `format[0]` if you want it saved elsewhere — see
  the [destinations docs](https://docs.qencode.com/api-reference/transcoding/#starting-a-task).

## Notes

- `filetype` in the upload metadata is hardcoded to `video/mp4`. Update it if
  you're testing a non-MP4 source container.
- This script is for local testing only. Don't call `/v1/access_token` (or
  embed your API key) directly from a public-facing client app — see
  [Qencode's guidance](https://docs.qencode.com/api-reference/transcoding/#getting-access-token)
  on obtaining a session token server-side first.
