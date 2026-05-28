(async function () {

  const QencodeApiClient = require('qencode-api');

  const apiKey = "5fed813c90bfa";
  
  const payload = null;
  
  let transcodingParams = {
      "source": 
      "https://nyc3.digitaloceanspaces.com/qencode/samples/bbb_sunflower_1080p_60fps_normal.mp4",
      "format": [
        {
          "output": "mp4",
          "duration": "20",
          "size": "320x240",
          "video_codec": "libx264"
        }
      ]
    };
  
  
  
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
          await sleep(1000);
      }
  }
  
  function sleep(ms){
      return new Promise(resolve=>{
          setTimeout(resolve,ms)
      })
  }    
  

})();

