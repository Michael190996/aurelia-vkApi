import { inject } from 'aurelia-framework';
import { aureliaHttpClient } from './templates/aurelia-http-client';

@inject(aureliaHttpClient)
export class test {
    constructor(aureliaHttpClient) {
        this.successOrError = {
            success: undefined, 
            error: undefined
        }
        this.task = {
            aureliaHttpClient: aureliaHttpClient
        }
    }

    activate(params) {
        if(typeof this[params.id] == 'function')
            this[params.id]();
        else 
            alert(`Нет такой задачи "${params.id}"`);
    }
    
    aureliaHttpClient() {
        this.task.aureliaHttpClient.start((success)=> this.successOrError.success = true, (error)=> {
            this.successOrError.error = 'Error: '+error.msg
        });
    }
}