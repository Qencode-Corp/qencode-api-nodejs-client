const QencodeApiClient = require('qencode-api');

const apiKey = "5a2a846a26ace";

const payload = null;

let transcodingParams = {
    "source": "https://nyc3.digitaloceanspaces.com/qencode/bbb_30s.mp4",
    "format": [
      {
        "output": "mp4",
        "size": "320x240",
        "video_codec": "libx264"
      }
    ]
  };



const qencodeApiClient = new QencodeApiClient({"key": apiKey, "endpoint": "https://prod-nyc3-2-api-do.qencode.com/"});
console.log("AccessToken: ", qencodeApiClient.AccessToken);

let task = qencodeApiClient.CreateTask();
console.log("Created new task: ", task.taskToken);

task.StartCustom(transcodingParams, payload);
console.log("Status URL: ", task.statusUrl);


CheckTaskStatus();

async function CheckTaskStatus(){
    while (task.GetStatus().status != "completed") {
       // console.log(task.GetStatus());
       // console.log('----------------------');
        await sleep(5000);
    }     
    //console.log(task.GetStatus());
}

function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}
