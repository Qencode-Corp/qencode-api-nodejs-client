const querystring = require('querystring');

class TranscodingTask {

    constructor(api, taskToken, uploadUrl){
        this.api = api;  
        this.taskToken = taskToken;       
        this.statusUrl = null;
        this.uploadUrl = uploadUrl;

        this.StartTime;
        this.Duration;      
        this.lastStatus
    }    

    Start(transcodingProfiles, uri, transferMethod = null, payload = null, OutputPathVariables = null){

        if(Array.isArray(transcodingProfiles)){
            transcodingProfiles = transcodingProfiles.join();
        }

        let parameters = {
            task_token: this.taskToken,
            profiles: transcodingProfiles
        };
    
        if(Array.isArray(uri)){
            parameters.stitch = JSON.stringify(uri);
        }else{
            parameters.uri = uri;
        }   
    
        if (transferMethod != null) {
            parameters.transfer_method = transferMethod;
        }

        if (payload != null){
            parameters.payload = payload;
        }

        if (this.StartTime > 0){ 
            parameters.start_time = this.StartTime.toFixed(4).toString();
        }

        if (this.Duration > 0) {
            parameters.duration = this.Duration.toFixed(4).toString();
        }

        if (OutputPathVariables != null){
            parameters.output_path_variables = JSON.stringify(OutputPathVariables);
        }

        let response = this.api.Request("start_encode", parameters);

        this.statusUrl = response.status_url;

        return response;
    }

    StartCustom(taskParams, payload = null){

        if(Array.isArray(taskParams.source)){
            taskParams.stitch = taskParams.source;
            taskParams.source = undefined;
        }             

        let query = { query: taskParams };

        let query_json = JSON.stringify(query);

        let parameters = {
            task_token: this.taskToken,
            query: query_json
        };    

        if (payload != null){
            parameters.payload = payload;
        }     

        return this._do_request("start_encode2", parameters);;
    }

    _do_request(methodName, parameters){
        let response = this.api.Request(methodName, parameters);
        this.statusUrl = response.status_url;
        return response;
    }

    GetStatus(){
        let parameters = {
            "task_tokens[]": this.taskToken
        };        

        let response = this.api.Request("status", parameters, this.statusUrl);

        this.lastStatus = response.statuses[this.taskToken];
        if (this.lastStatus == null) {
            this.statusUrl = this.api.url + this.api.version + "/status"
            return this.GetStatus()
        }
        if(this.lastStatus && this.lastStatus.status_url){
            this.statusUrl = this.lastStatus.status_url;
        }        

        return this.lastStatus;
    }

}


module.exports = TranscodingTask;