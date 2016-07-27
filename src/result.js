import { HttpClient } from 'aurelia-http-client';
import { inject }     from 'aurelia-framework';

@inject(HttpClient)
export class Result {
    set reload(a) {
        return this.reloadBot = a;
    }

    get reload() {
        return this.reloadBot;
    }

    constructor(http) {
        this.http = http;
        //this.access_token = '4732368ec1aae760780ae3149cece15459e76a20fa3c1ba1c605a083ca9a1f4ba723a05dfe0d6735c1d78';
    }
    

    queryVk(url, _params) {
        let params = _params || {}
        if(this.access_token) {
            params.access_token = this.access_token;
        }
        return this.http.createRequest(url)
                   .asJsonp('callback')
                   .withBaseUrl('https://api.vk.com/method')
                   .withParams(params).send();  
    }

    // TODO: функция добавляет в массив people пользователей
    add(id) {
        // если запрос не закончился или в аргументе ничего нет, то выходим из функции
        if (this.reload == false || !id) {
            return false;
        }

        if (!Array.isArray(id) && String(id).indexOf(',') != -1) {
            id = id.split(',');
        } else if (String(id).indexOf(',') == -1) {
            id = [id];
        }

        this.people = this.people || [];

        let search = (id, uid, callback, is) => {
            for (let i = 0; i < id.length; i++) {
                if (callback(id[i], uid, is)) {
                    id.splice(i, 1);
                }
            }
        }

        for (let i = 0; i < this.people.length; i++) {
            search(id, this.people[i].uid, (id, uid, is) => {
                if (id == uid) {
                    if (is != 'deleted') {
                        alert(`Идентификатор "${uid}" уже добавлен`);
                    } else {
                        alert(`Идентификатор "${uid}" уже добавлен, но аккаунт с ним был удален`);
                    }
                    return true;
                }
            }, this.people[i].deactivated);
        }

        search(id, 0, (id, uid) => {
            if (id <= uid) {
                alert(`Не может быть идентификатора "${id}"`);
                return true;
            }
        });

        if (id.toString != '') {
            this.reload = false;

            // запрашивает у ВК пользователей
            this.queryVk('users.get', {
                user_ids: id.join(',')
            }).then((e) => {
                if (e.response.error) {
                    alert(e.response.error.error_msg);
                } else {
                    this.people = this.people.concat(e.response.response);
                }
                this.reload = true;
            });
        }
    }

    // TODO: удаление пользователя
    remove(id) {
        if (this.people && this.people[id]) {
            return this.people.splice(id, 1);
        }
    }

    // TODO: вывод всех друзей пользователей
    friend() {
        // так же, как и в методе 
        if (!this.people || !this.people[0] || !Array.isArray(this.people) || this.reload == false) {
            return false;
        }
        
        this.reload = false;
        
        this.friends = [];
        this.frOpacity = 0;
        let listener = 0,
            isFriend = {};

        // запрашивает друзей пользователей
        for (let people = 0; people < this.people.length; people++) {
            let el = this.people[people];

            this.queryVk('friends.get', {
                user_id: el.uid,
                fields: 'nickname, domain, sex, bdate'      
            }).then((e) => {
                // собираем друзей
                el.friends = e.response.response;
                
                for (let i = 0; (el.friends && i < el.friends.length); i++) {
                    if(el.friends[i].deactivated != 'deleted' && !isFriend[el.friends[i].uid]) {
                        this.friends.push({
                            uid: [el.friends[i].uid],
                            id: el.friends[i].uid,
                            domain: el.friends[i].domain,
                            name: `${el.friends[i].last_name} ${el.friends[i].first_name}`,
                            sex: (el.friends[i].sex == 1 ? 'Женщина' : 'Мужчина'),
                            date: (el.friends[i].bdate == undefined ? 'неизвестно' : el.friends[i].bdate),
                            deactivated: el.friends[i].deactivated,
                            element: this.friends.length+1
                        });
                        
                        isFriend[el.friends[i].uid] = this.friends.length;
                        
                    } else if(el.friends[i].deactivated != 'deleted') {
                        this.friends[isFriend[el.friends[i].uid]].uid.push(el.friends[i].uid);
                        if (this.friends[isFriend[el.friends[i].uid]].uid.length > this.frOpacity) {
                            this.frOpacity = this.friends[isFriend[el.friends[i].uid]].uid.length;
                        }
                    }
                }
            }).then(() => {
                listener++;

                // после того, как все запросы закончатся, пойдет фильтрация элементов
                if (listener == this.people.length) {
                    this.frOpacity = 30 / this.frOpacity / 100;
                    
                    this.friends = this.friends.sort((a, b) => {
                        if (a.name && b.name) {
                            if (a.name > b.name) {
                                return 1;
                            } else if (a.name < b.name) {
                                return -1;
                            } else {
                                return 0;
                            }
                        }
                    });
                    this.reload = true;
                }
            });
        }
    }
}