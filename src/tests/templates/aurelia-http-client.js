import { inject } from 'aurelia-framework';
import 'fetch';
import { HttpClient } from 'aurelia-http-client';

@inject(HttpClient)
export class aureliaHttpClient {
    constructor(http) {
        this.http = http;
        
        http.configure(config => {
            config
                .withDefaults({
                    headers: {
                        'Accept': 'application/jsonp'
                    }
                });
        });
        
        
        http.jsonp('https://api.vk.com/method/users.get?users_ids=1', 'jsonp')
        .then(response => console.log(4))
        .then(data => {
            console.log(5);
        }).then(data => {
            console.log(5);
        }).then(data => {
            console.log(5);
        });
        
    }
    
    start(success, error) {
        console.log(success)
    }
    
    task() {
        var tasks = new Array();
        this.http.jsonp()
    }
}