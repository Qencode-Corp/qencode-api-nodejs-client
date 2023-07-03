const axios = require('axios');
const querystring = require('querystring');

const TranscodingTask = require('./Classes/TranscodingTask');

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
} 

class QencodeApiClient {
    constructor(options) {

      return (async () => {

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

        // Call async functions here
        await this.getAccessToken(); 
    
        // Constructors return `this` implicitly, but this is an IIFE, so
        // return `this` explicitly (else we'd return an empty object).
        return this;
      })();
    }

    async getAccessToken(){
        let response = await this.Request("access_token", {api_key: this.Key });
        this.AccessToken = response.token;
    }   
    
    async getTemplates(){
        let response = await this.Request("request_templates", {api_key: this.Key });
        return response.templates;
    }    
    
    async CreateTask(){
        let response = null;
        while (1) {
            try {
                response = await this.Request("create_task", {token: this.AccessToken});
                break;
            }
            catch (err) {
                if (err.message == "Token not found") {
                    await this.getAccessToken();
                }
                else throw(err);
            }
        }
        return new TranscodingTask(this, response.task_token, response.upload_url);
    }    
    
    
    async Request(path, parameters, statusUrl){    
   
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
        
        let retry = 20;
        const retryDelay = 3000;
                
        for (let i = 0; i < retry; i++) {
            try {
                this.lastResponseRaw = await axios.post(
                    requestUrl,
                    parameters,
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        timeout: this.ConnectTimeout * 1000
                    }
                );
                break;
            } catch (err) {
                if(i === retry - 1) {
                    throw new Error("All attempts to execute request failed.");
                }
                console.error(`Error executing request to url: ${requestUrl} on attempt ${i + 1}. Retrying in ${retryDelay / 1000} seconds...`);
                await delay(retryDelay);
            }
        }
        
        let response = this.lastResponseRaw.data;
    
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