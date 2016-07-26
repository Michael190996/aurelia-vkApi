import { HttpClient } from 'aurelia-http-client';
import { inject }     from 'aurelia-framework';
import { App }        from '../../app';

@inject(App, HttpClient)
export class Users {
    set reload(a) {
        return this.app.reload = a;
    }

    get reload() {
        return this.app.reload;
    }

    constructor(app, http) {
        this.http = http;
        this.queryVk = app.queryVk;
        this.access_token = app.access_token;
        this.app = app;
    }

    // TODO: запросы на информацию о пользователе
    activate(params) {
        this.reload = false; // окно с подгрузкой        
        this.user = {};

        let code = `
            return {
                "info": API.users.get({"user_ids": ${params.id}, "fields": "domain"})[0],
                "wall": API.wall.get({"owner_id": ${params.id}, "filter": "owner", "extended": 0}),
                "friends": API.friends.get({"user_id": ${params.id}, "fields": "nickname, domain, sex, bdate"})
            };
        `;

        // запрос на данные о пользователе,
        // запрос на посты пользователя,
        // запрос на друзей пользователя
        if (this.access_token && this.access_token != '') {
            this.queryVk('execute', {
                code: code
            }).then((e) => {
                if (e.response.error) {
                    alert(e.response.error.error_msg);
                } else {
                    this.user = e.response.response;
                }
                this.reload = true; // закроется окно с той подгрузкой
            });
        } else {
            // запрос на информацию о пользователе
            this.queryVk('users.get', {
                user_id: params.id
            }).then((e) => {
                if (e.response.error) {
                    alert(e.response.error.error_msg);
                } else {
                    this.user.info = e.response.response[0];
                }
                this.reload = true; // закроется окно с той подгрузкой
            }); 

            // запрос на посты пользователя
            this.queryVk('wall.get', {
                owner_id: params.id,
                filter: 'owner',
                extended: 0
            }).then((e) => {
                if (e.response.error) {
                    alert(e.response.error.error_msg);
                } else {
                    this.user.wall = e.response.response;
                }
                this.reload = true; // закроется окно с той подгрузкой
            }); 

            // запрос на друзей пользователя
            this.queryVk('friends.get', {
                user_id: params.id,
                fields: 'nickname, domain, sex, bdate'
            }).then((e) => {
                if (e.response.error) {
                    alert(e.response.error.error_msg);
                } else {
                    this.user.friends = e.response.response;
                }
                this.reload = true; // закроется окно с той подгрузкой
            }); 
        }
    }
}