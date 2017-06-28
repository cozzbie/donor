import { Injectable } from "@angular/core";
import { Http, Response, URLSearchParams } from '@angular/http';
import { Observable, Subscription } from "rxjs/Rx";
import { environment } from '../../environments/environment';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class UserService {
    server = environment.server;
    
    constructor(private http: Http) {}

    donate(o): Observable<any> {
        const obs = this.http.post(this.server + "web/user", o);
        return this.processObservable(obs);
    }

    edit(o): Observable<any> {
        const obs = this.http.post(this.server + "web/user", o);
        return this.processObservable(obs);
    }

    delete(o): Observable<any> {
        const obs = this.http.post(this.server + "web/user", o);
        return this.processObservable(obs);
    }

    processObservable(obs: Observable<Object>): Observable<Object[]> {
        return obs.map((res: Response) => res.json())
                    .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }
}
