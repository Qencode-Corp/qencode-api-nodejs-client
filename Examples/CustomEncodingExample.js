(async function () {

    const QencodeApiClient = require('qencode-api');

    const apiKey = "your_api_key_here";
    const s3_path = "s3://s3-yourRegion.amazonaws.com/bucketname";
    const s3_key = "youS3Key";
    const s3_secret = "yourS3secret";
    
    // using one video as a source
    // const videoUrl = "https://servername/folder/video.mp4";
    
    // using several videos as a source for stitching
    const videoUrl = [
        "https://servername/folder/video1.mp4", 
        "https://servername/folder/video2.mp4",
        {
           "url":"https://servername/folder/video3.mp4", 
           "start_time":"0.01567", 
           "duration":"0.575"
        }
    ];
    
    const payload = null;
    
    let transcodingParams = {};
    transcodingParams.source = videoUrl;
    
    let format = {};
    
    format.destination = {};
    format.destination.url = s3_path;
    format.destination.key = s3_key;
    format.destination.secret = s3_secret;
    
    format.output = "advanced_hls";
    
    
    let stream = {};
    stream.size = "1920x1080";
    stream.audio_bitrate = 128;
    
    let vcodec_params = {};
    vcodec_params.vprofile = "baseline";
    vcodec_params.level = 31;
    vcodec_params.coder = 0;
    vcodec_params.flags2 = "-bpyramid+fastpskip-dct8x8";
    vcodec_params.partitions = "+parti8x8+parti4x4+partp8x8+partb8x8";
    vcodec_params.directpred = 2;
    
    stream.video_codec_parameters = vcodec_params;
    
    format.stream = [];
    format.stream.push(stream);
    
    
    transcodingParams.format = [];
    transcodingParams.format.push(format);
    
    const qencodeApiClient = await new QencodeApiClient(apiKey);
    console.log("AccessToken: ", qencodeApiClient.AccessToken);
    
    let task = await qencodeApiClient.CreateTask();
    console.log("Created new task: ", task.taskToken);
    
    await task.StartCustom(transcodingParams, payload);
    console.log("Status URL: ", task.statusUrl);
    
    
    // example on how to get status
    CheckTaskStatus();

    async function CheckTaskStatus(){
        let statusObject = await task.GetStatus()
        let status = statusObject.status
        while (status != "completed") {
            statusObject = await task.GetStatus()
            status = statusObject.status;
            progress = statusObject.percent;
            console.log(`task: ${task.taskToken} | status: ${status} | progress: ${progress}`);
            await sleep(10000);
        }
    }
    
    function sleep(ms){
        return new Promise(resolve=>{
            setTimeout(resolve,ms)
        })
    }   

})();