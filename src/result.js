import { inject } from 'aurelia-framework';
import $ from 'jquery';

@inject(() => $.post)
export class Result {
    set reload(a) {
        return this.reloadBot = a;
    }

    get reload() {
        return this.reloadBot;
    }

    constructor(http) {
        this.http = http;
    }

    // TODO: функция добавляет в массив people пользователей
    add(id) {
        // если запрос не закончился или в аргументе ничего нет, то выходим из функции
        if (this.reload == false || !id) return false;

        if (!Array.isArray(id) && String(id).indexOf(',') != -1)
            id = id.split(',');
        else {
            if (String(id).indexOf(',') == -1)
                id = [id];
        }

        this.people = this.people || new Array();

        let search = (id, uid, callback, is) => {
            for (let i = 0; i < id.length; i++)
                if (callback(id[i], uid, is)) id.splice(i, 1);
        }

        for (let i = 0; i < this.people.length; i++) {
            search(id, this.people[i].uid, (id, uid, is) => {
                if (id == uid) {
                    if (is != 'deleted')
                        alert(`Идентификатор "${uid}" уже добавлен`);
                    else
                        alert(`Идентификатор "${uid}" уже добавлен, но аккаунт с ним был удален`)
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

        // запрашивает у ВК пользователей
        if (id.toString != '') {
            this.reload = false;
            this.http({
                url: 'https://api.vk.com/method/users.get',
                jsonp: 'callback',
                dataType: 'jsonp',
                data: {
                    user_ids: id.join(','),
                    access_token: this.access_token
                },
                success: (response) => {
                    if (response.error)
                        alert(response.error.error_msg);
                    else
                        this.people = this.people.concat(response.response);
                }
            }).then(() => this.reload = true);
        }
    }

    // TODO: удаление пользователя
    remove(id) {
        if (this.people && this.people[id]) return this.people.splice(id, 1);
    }

    // TODO: вывод всех друзей пользователей
    friend() {
        // так же, как и в методе 
        if (!this.people || !this.people[0] || !Array.isArray(this.people) || this.reload == false) return false;
        this.reload = false;

        this.friends = new Object();
        this.frOpacity = 0;
        let listener = 0;

        this.people.forEach((el) => {
            // запрашивает друзей пользователей
            this.http({
                url: 'https://api.vk.com/method/friends.get',
                jsonp: 'callback',
                dataType: 'jsonp',
                data: {
                    user_id: el.uid,
                    fields: 'nickname, domain, sex, bdate',
                    access_token: this.access_token
                },
                success: (response) => {
                    // собираем друзей
                    el.friends = response.response;
                    for (let i in el.friends) {
                        this.friends[el.friends[i].uid] = this.friends[el.friends[i].uid] || {
                            uid: new Array(),
                            name: `${el.friends[i].last_name} ${el.friends[i].first_name}`,
                            domain: el.friends[i].domain,
                            sex: (el.friends[i].sex == 1 ? 'Женщина' : 'Мужчина'),
                            date: (el.friends[i].bdate == undefined ? 'неизвестно' : el.friends[i].bdate),
                            id: el.friends[i].uid,
                            deactivated: el.friends[i].deactivated
                        }
                        this.friends[el.friends[i].uid].uid.push(el.friends[i].uid);
                        if (this.friends[el.friends[i].uid].uid.length > this.frOpacity)
                            this.frOpacity = this.friends[el.friends[i].uid].uid.length;
                    }
                }
            }).then(() => {
                listener++;

                // после того, как все запросы закончатся, пойдет фильтрация элементов
                if (listener == this.people.length) {
                    this.frOpacity = 30 / this.frOpacity / 100;

                    let friends = new Array();
                    for (let i in this.friends) {
                        if (this.friends[i] && this.friends[i].deactivated != 'deleted')
                            friends.push(this.friends[i]);
                    }

                    this.friends = friends.sort((a, b) => {
                        if (!a.name || !b.name) return 0;
                        if (a.name > b.name) return 1;
                        else if (a.name < b.name) return -1;
                        else return 0;
                    });

                    this.reload = true;
                }
            });
        })
    }
}