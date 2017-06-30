import { Injectable } from "@angular/core";
import { Http, Response, URLSearchParams } from '@angular/http';
import { Observable, Subscription } from "rxjs/Rx";
import { environment } from '../../environments/environment';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';

import _ from "lodash";

@Injectable()
export class DonorService {
    server = environment.server;
    
    constructor(private http: Http) {}

    create(o): Observable<any> {
        const obs = this.http.post(this.server + "api/me", o);
        return this.processObservable(obs);
    }

    me(link): Observable<any> {
        const params = new URLSearchParams();
        params.set("link", link);

        const obs = this.http.get(this.server + "api/me", { search: params });
        return this.processObservable(obs);
    }

    find(o: any[]): Observable<any> {
        const params = new URLSearchParams();
        _.each(o, v => params.append("coords", v));

        const obs = this.http.get(this.server + "api/donors/", {search: params});
        return this.processObservable(obs);
    }

    update(o): Observable<any> {
        const obs = this.http.put(this.server + "api/me", o);
        return this.processObservable(obs);
    }

    delete(l): Observable<any> {
        const params = new URLSearchParams();
        params.set("link", l);

        const obs = this.http.delete(this.server + "api/me", { search: params });
        return this.processObservable(obs);
    }

    processObservable(obs: Observable<Object>): Observable<Object[]> {
        return obs.map((res: Response) => res.json())
                    .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }
}
