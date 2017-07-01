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

    //Opens up the #donate modal for the addition of a new donor
    openBioModal(e): void {
        this.donorData = e;
        this.linked = false;
        $('#donate').modal('show');
    }

    //Opens up the #profile modal for the viewing of a remote donors details
    openProfileModal(e): void {
        this.profileData = e;
        $('#profile').modal('show');
    }

    //Opens up the #donate modal for the viewing of a remote donors details
    edit(): void {
        this.linked = true;
        $('#donate').modal('show');
    }

    //Close a modal
    closemodal(): void {
        this.linked = false;
        $('#donate').modal('hide');
    }

    //If we have scripts we would love to load from external sources...heres a good place to load theem from
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
