import { inject } from 'aurelia-framework';
import bootstrap from 'bootstrap';
import { Result } from './result';

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
        this.access_token = 'd597a2952311278d07a83d065c2a827ac5442c109f852567f2fed2759b0f77ed07f3b0fc3e34ae19de962';
        this.result = result;
        this.reload = true;
    }

    // роуты на 2 страницы
    configureRouter(config, router) {     
        config.title = 'Aurelia';
        config.map([
            {
                route: ['', 'app'],
                moduleId: './templates/result/result',

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