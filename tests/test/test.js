(async function () {

    const QencodeApiClient = require('./QencodeApiClient')

    const apiKey = "5a2a846a26ace";
    const payload = null;

    const qencodeApiClient = await new QencodeApiClient(apiKey);

    console.log("AccessToken: ", qencodeApiClient.AccessToken)

    const templates = await qencodeApiClient.getTemplates(); // query: template.query - 3 templates in total 

    const transcodingParams = JSON.parse(templates[2].query)

    console.log("transcodingParams: ", transcodingParams)

    let task = await qencodeApiClient.CreateTask();
    console.log("Created new task: ", task.taskToken);

    await task.StartCustom(transcodingParams.query, payload);
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
