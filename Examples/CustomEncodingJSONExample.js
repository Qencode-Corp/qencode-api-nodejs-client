const QencodeApiClient = require('qencode-api');

const apiKey = "your_api_key_here";

const payload = null;

let transcodingParams = {
    "source": [
        "https://servername/folder/video1.mp4", 
        "https://servername/folder/video1.mp4",
        {
           "url":"https://servername/folder/video1.mp4", 
           "start_time":"0.01567", 
           "duration":"0.575"
        }
    ],
    "format": [
      {
        "output": "mp4",
        "size": "320x240",
        "video_codec": "libx264"
      }
    ]
  };



const qencodeApiClient = new QencodeApiClient(apiKey);
console.log("AccessToken: ", qencodeApiClient.AccessToken);

let task = qencodeApiClient.CreateTask();
console.log("Created new task: ", task.taskToken);

task.StartCustom(transcodingParams, payload);
console.log("Status URL: ", task.statusUrl);


CheckTaskStatus();

async function CheckTaskStatus(){
    while (task.GetStatus().status != "completed") {
        console.log(task.GetStatus().status);
        await sleep(5000);
    }     
    console.log(task.GetStatus().status);
}

function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}