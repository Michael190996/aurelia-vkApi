import { inject }  from 'aurelia-framework';
import { Result }  from './result';
import   bootstrap from 'bootstrap';

@inject(bootstrap, Result)
export class App {
    set reload(a) {
        return this.result.reload = a;
    }
    
    get reload() {
        return this.result.reload;
    }
    
    constructor(bootstrap, result) {
        this.bootstrap = bootstrap;
        this.access_token = result.access_token;
        this.queryVk = result.queryVk;
        this.result = result;
        this.reload = true;
    }

    // роуты на 2 страницы
    configureRouter(config, router) {     
        config.title = 'Aurelia';
        config.map([
            {
                route: ['', 'app'],
                moduleId: './templates/result/result'
         }, {
                route: ['users', 'users/:id'],
                name: 'users',
                moduleId: './templates/users/users',
                nav: true,
                title: 'users'
         }
      ]);
      this.router = router;
    }
}
