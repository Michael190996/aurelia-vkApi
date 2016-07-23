import { inject }
from 'aurelia-framework';

// из класса App берется джквери и reload
import { App } from '../../app';

@inject(App)
export class Users {    
    set reload(a) {
        App.reloaBot = a;
    }
    
    get reload() {
        return App.reloaBot;
    }
    
    constructor(app) {
        this.http = app.http;
    }

    // TODO: запросы на информацию о пользователе
    activate(params) {
        this.reload = false; // окно с подгрузкой
        this.user = {
            id: params.id,
            user: new Object()
        }

        // запрос на данные о пользователе
        this.http({
            url: 'https://api.vk.com/method/users.get',
            jsonp: callback,
            dataType: jsonp,
            data: {
                user_ids: this.user.id
            },
            success: (response) => {
                if (response.error)
                    alert(response.error.error_msg);
                else
                    this.user.info = response.response[0]
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