import { Component, OnInit, Input } from '@angular/core';

declare var $: any;

@Component({
    selector: 'app-donor',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
    donor: any = {};
    secret: any = { email: "hidden", phone: "hidden" };
    @Input() set profile(v) {
        if (v) this.donor = v;
    };

    constructor() {}

    ngOnInit() {}

    view(): void {}

    reveal(): void {
        this.secret.email = this.donor.email;
        this.secret.phone = this.donor.phone;
    }

    reset(): void {
        this.secret.email = "hidden";
        this.secret.phone = "hidden";
    }

}
