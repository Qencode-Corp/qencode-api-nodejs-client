
const request = require('sync-request');
const querystring = require('querystring');

const TranscodingTask = require('./Classes/TranscodingTask');

class QencodeApiClient {

    constructor(key){

        if(key.length < 12) {
            throw new Error("Missing or invalid Qencode project api key!");
        }  

        this.Key = key;
        this.AccessToken = null;
        this.url = "https://api-qa.qencode.com/";
        this.version = "v1";
        this.USER_AGENT = "Qencode PHP API SDK 1.0";
        this.ConnectTimeout = 20;
        this.lastResponseRaw = null;
        this.lastResponse = null;    
        this.getAccessToken();      
    }    


    getAccessToken(){
        let response = this.Request("access_token", {api_key: this.Key });
        this.AccessToken = response.token;
    }

    CreateTask(){
        let response = this.Request("create_task", {token: this.AccessToken });
        return new TranscodingTask(this, response.task_token);;
    }

    Request(path, parameters){

        this.lastResponseRaw = null;
        this.lastResponse = null;

        let requestUrl = null;

        if (path.toLowerCase().indexOf("http") == 0){
            requestUrl = path;
        }else{
            requestUrl = this.url + this.version + "/" + path;
        }


        if (parameters != null && !(typeof parameters === 'string')){
            // convert parameters to string like 'api_key=5adb0584aa29f'
            parameters = querystring.stringify(parameters);        
        }  


        try{
            this.lastResponseRaw = request(
                'POST', 
                requestUrl,
                {
                    headers: {'content-type': 'application/x-www-form-urlencoded'},                
                    body: parameters
                }
            );
        } catch (err) {
            throw new Error("Error executing request to url: " + requestUrl, err);
        }

        let response = JSON.parse(this.lastResponseRaw.getBody('utf8'));
    
        if (response == null || response.error == null){
            throw new Error("Invalid API response", this.lastResponseRaw);
        }

        if (response.error != 0){
            throw new Error(response.message);
        }    

        return response;  
    }

}


module.exports = QencodeApiClient;