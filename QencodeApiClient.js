
const request = require('sync-request');
const querystring = require('querystring');

const TranscodingTask = require('./Classes/TranscodingTask');

class QencodeApiClient {

    constructor(options){
        let key = null;
        let endpoint = "https://api.qencode.com/";
        this.version = "v1";
        let optionsType = Object.prototype.toString.call(options);
        if (optionsType === '[object String]') {
            key = options;
        }
        else {
            if (!('key' in options)) {
                throw new Error("You should provide API Key value when initializing API client!\nExample: const qencodeApiClient = new QencodeApiClient({key: 'your API key'});");
            }
            else {
                key = options.key;
                if ('endpoint' in options) {
                    endpoint = options.endpoint.trim();
                    if (! endpoint.endsWith('/')) {
                        endpoint += '/';
                    }
                }
                if ('version' in options) {
                    this.version = options.version.trim();
                }
            }
        }

        if(key.length < 12) {
            throw new Error("Missing or invalid Qencode project api key!");
        }  

        this.Key = key;
        this.AccessToken = null;
        this.url = endpoint;
        this.USER_AGENT = "Qencode NODE API SDK 1.0";
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

    Request(path, parameters, statusUrl){

        this.lastResponseRaw = null;
        this.lastResponse = null;

        let requestUrl = null;

        if (path.toLowerCase().indexOf("http") == 0){
            requestUrl = path;
        }else{
            requestUrl = this.url + this.version + "/" + path;
        }

        // statusUrl is optional, must be used as requestUrl if provided
        if(statusUrl){
            requestUrl = statusUrl
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