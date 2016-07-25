import { inject } from 'aurelia-framework';
import { App } from '../../app';
import $ from 'jquery';

@inject(App, ()=> $.post)
export class Users {    
    set reload(a) {
        return this.app.reload = a;
    }
    
    get reload() {
        return this.app.reload;
    }
    
    constructor(app, http) {
        this.http = http;
        this.access_token = app.access_token;
        this.app = app;
    }

    // TODO: запросы на информацию о пользователе
    activate(params) {
        this.reload = false; // окно с подгрузкой        
        this.user = new Object();
        
        let query = `
            return {
                "info": API.users.get({"user_ids": ${params.id}, "fields": "domain"})[0],
                "wall": API.wall.get({"owner_id": ${params.id}, "filter": "owner", "extended": 0}),
                "friends": API.friends.get({"user_id": ${params.id}, "fields": "nickname, domain, sex, bdate"})
            };
        `;

        // запрос на данные о пользователе,
        // запрос на посты пользователя,
        // запрос на друзей пользователя
        if(this.access_token && this.access_token != '') {
            this.http({
                url: 'https://api.vk.com/method/execute',
                jsonp: 'callback',
                dataType: 'jsonp',
                data: {
                    code: query,
                    access_token: this.access_token
                },
                success: (response) => {
                    if (response.error)
                        alert(response.error.error_msg);
                    else
                        this.user = response.response;
                }
            }).then(()=> this.reload = true); // закроется окно с той подгрузкой
       } else 
       {
             // запрос на данные о пользователе
            this.http({
                url: 'https://api.vk.com/method/users.get',
                jsonp: 'callback',
                dataType: 'jsonp',
                data: {
                    user_ids: this.user.id
                },
                success: (response) => {
                    if (response.error)
                        alert(response.error.error_msg);
                    else
                        this.user.info = response.response[0];
                }
            }).then(()=> this.reload = true); // закроется окно с той подгрузкой

            // запрос на посты пользователя
            this.http({
                url: 'https://api.vk.com/method/wall.get',
                jsonp: 'callback',
                dataType: 'jsonp',
                data: {           
                    owner_id: this.user.id,
                    filter: 'owner',
                    extended: 0
                },
                success: (response) => {
                    if (response.error)
                        alert(response.error.error_msg);
                    else
                        this.user.wall = response.response;
                }
            }).then(()=> this.reload = true); // закроется окно с той подгрузкой

            // запрос на друзей пользователя
            this.http({
                url: 'https://api.vk.com/method/friends.get',
                jsonp: 'callback',
                dataType: 'jsonp',
                data: {    
                    user_id: this.user.id,
                    fields: 'nickname, domain, sex, bdate'
                },
                success: (response) => {
                    if (response.error)
                        alert(response.error.error_msg);
                    else
                        this.user.friends = response.response;
                }
            }).then(()=> this.reload = true); // закроется окно с той подгрузкой
        }
    }    
}
