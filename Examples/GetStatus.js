(async function () {

    const QencodeApiClient = require('qencode-api');

    const apiKey = "your_api_key_here";
    const taskToken = "your_job_id_here";

    let parameters = {
        "task_tokens[]": taskToken
    };    

    const qencodeApiClient = await new QencodeApiClient(apiKey);
    
    let response = await qencodeApiClient.Request("status", parameters, qencodeApiClient.url + '/v1/status');
    
    let status = response.statuses[taskToken];    

    console.log("status: ", status)

})();