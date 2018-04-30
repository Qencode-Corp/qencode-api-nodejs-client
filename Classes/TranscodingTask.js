const querystring = require('querystring');

class TranscodingTask {

    constructor(api, taskToken){
        this.api = api;  
        this.taskToken = taskToken;       
        this.statusUrl = null;

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
            uri: uri,
            profiles: transcodingProfiles
        };
    
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

        let response = this.api.Request("status", parameters);

        this.lastStatus = response.statuses[this.taskToken];

        return this.lastStatus;
    }

}


module.exports = TranscodingTask;