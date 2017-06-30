import { Component } from '@angular/core';
import { environment } from '../environments/environment';
import _ from "lodash";

declare var $: any;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    server = environment.server;
    externals: string[] = [];
    donorData: any = {};
    profileData: any = {};
    linked = false;
    
    constructor() {
        //this.loadExtScripts();
    };

    openBioModal(e): void {
        this.donorData = e;
        this.linked = false;
        $('#donate').modal('show');
    }

    openProfileModal(e): void {
        this.profileData = e;
        $('#profile').modal('show');
    }

    edit(): void {
        this.linked = true;
        $('#donate').modal('show');
    }

    loadExtScripts(): void {
        _.each(this.externals, v => {
            const node = document.createElement('script');
            node.src = v;
            node.type = 'text/javascript';
            node.async = true;
            node.charset = 'utf-8';
            document.getElementsByTagName('head')[0].appendChild(node);
        });
    }
}
