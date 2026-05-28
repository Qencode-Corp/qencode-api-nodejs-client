(async function () {

    const QencodeApiClient = require('qencode-api');

    const apiKey = "5fed813c90bfa";
    const taskToken = "8410dc828c8f5f987fe8dd906f7d407e";

    let parameters = {
        "task_tokens[]": taskToken
    };    

    const qencodeApiClient = await new QencodeApiClient(apiKey);
    
    let response = await qencodeApiClient.Request("status", parameters, qencodeApiClient.url + '/v1/status');
    
    let status = response.statuses[taskToken];    

    console.log("status: ", status)

})();