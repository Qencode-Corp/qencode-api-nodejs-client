(async function () {
    const QencodeApiClient = require('qencode-api');

    const apiKey = "your_api_key_here";
    const transcodingProfiles = ["5adb0584aa43b", "5adb0584aacca", "5adb0584ab49e"]; //replace with your profile IDs
    const transferMethod = null;

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
    const OutputPathVariables = null;


    const qencodeApiClient = await new QencodeApiClient(apiKey);

    console.log("AccessToken: ", qencodeApiClient.AccessToken)

    let task = await qencodeApiClient.CreateTask();
    //task.StartTime = 0.01567;
    //task.Duration = 0.575;
    console.log("Created new task: ", task.taskToken);

    await task.Start(transcodingProfiles, videoUrl, transferMethod, payload, OutputPathVariables);
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
})