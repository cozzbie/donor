import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { FormControl, FormBuilder, FormGroup } from '@angular/forms';
import { CustomNG2Validators } from "../../providers/custom-validators";
import { DonorService } from '../../providers/donor';
import { CustomValidators } from 'ng2-validation';
import { Socks } from '../../providers/socks';

import { Observable } from "rxjs/Rx";
import { Store } from "@ngrx/store";
import { AppState } from "../../redux/state";
import { UserState } from "../../redux/user";

import { User } from "../../interfaces/user";

import _ from "lodash";

declare var $: any;

@Component({
    selector: 'app-donate',
    templateUrl: './donate.component.html',
    styleUrls: ['./donate.component.scss']
})
export class DonateComponent implements OnInit {
    donorForm: FormGroup;
    donorData: any = {};
    donorState: Observable<UserState>;
    donor: User;
    transacting: boolean;
    isLink = false;
    isSearching = false;
    notification: any = { status: false, header: "", message: "" };
    socket;

    @Input() set dData(v) {
        if (v.address) Object.assign(this.donorData, { coords: { address: v.address, coordinates: [v.point.longitude, v.point.latitude] }});
    };
    @Input() set linked(v: boolean) {
        if (v) {
            _.each(this.donorForm.controls, (c, k) => {
                if (k === "link") c.enable();
                else c.disable();
            });
        }else {
            _.each(this.donorForm.controls, (c, k) => {
                if (k === "link") c.disable();
                else c.enable();
            });
        }
    };

    constructor(private store: Store<AppState>, private fb: FormBuilder, private donorSvc: DonorService, private socks: Socks) {
        this.donorState = <Observable<UserState>>store.select("user");
        this.donorState.subscribe(s => this.donor = s.user);

        this.donorForm = this.fb.group({
            'link': [this.donorData.link, CustomNG2Validators.compose([])],
            'firstname': [this.donorData.firstname, CustomNG2Validators.compose([CustomNG2Validators.required, CustomNG2Validators.minLength(2)])],
            'lastname': [this.donorData.lastname, CustomNG2Validators.compose([CustomNG2Validators.required, CustomNG2Validators.minLength(2)])],
            'phone': [this.donorData.contact, CustomNG2Validators.compose([CustomNG2Validators.required, CustomValidators.phone])],
            'email': [this.donorData.email, CustomNG2Validators.compose([CustomNG2Validators.required, CustomValidators.email])],
            'blood_group': [this.donorData.blood_group, CustomNG2Validators.compose([CustomNG2Validators.required, CustomNG2Validators.minLength(1), , CustomNG2Validators.maxLength(2)])],
        });

        this.socket = socks.socket();
    }

    ngOnInit() {
        this.donorForm.controls['link']
            .valueChanges
            .debounceTime(500)
            // .distinctUntilChanged()
            .filter(y => y && y.length === 6)
            .switchMap(search => {
                this.isSearching = true;
                return this.donorSvc.me(search);
            })
            .subscribe((res: any) => {
                this.isSearching = false;

                Object.assign(this.donorData, res.me);
                if (this.donorData._id){
                    _.each(this.donorForm.controls, (c, k) => {
                        if (k !== "link") c.enable();
                    });
                }
                this.hideMessage();
            }, e => {
                console.log(e);
                this.isSearching = false;
                this.hideMessage();
            });
    }

    submit(): void {
        this.transacting = true;
        this.donorSvc.create(this.donorData)
            .subscribe(d => {
                this.transacting = false;
                if (d.success) {
                    this.donorData.link = d.link;
                    this.notification = { status: true, header: "Success", message: `Your submission was successful. Please save this link, <h4>${this.donorData.link}</h4> and use it to edit your entry if you feel the need to.` };
                    this.socket.emit("hasJoined");
                } else this.notification = { status: false, header: "Error", message: "An error occured during submission. Please try again." };
            });
    }

    update(): void {
        this.donorSvc.update(this.donorData)
            .subscribe(d => {
                if (d.success) {
                    this.notification = { status: true, header: "Success", message: `Your update was successful.` };
                } else this.notification = { status: false, header: "Error", message: "An error occured during your update. Please try again." };
            });
    }

    delete(): void {
        if (!this.donorData) return;
        
        this.donorSvc.delete(this.donorData.link)
            .subscribe(d => {
                if (d.success) {
                    this.notification = { status: true, header: "Success", message: `You have successfully deleted your data.` };
                    this.socket.emit("hasLeft", { id: this.donorData._id });
                    this.donorData = {};
                } else this.notification = { status: false, header: "Error", message: "An error occured. Please try again." };
            });
    }

    hideMessage(): void {
        this.notification = {status: false, header: "", message: ""};
    }

    initJSSemantics(): void {
        setTimeout(() => {
            $('.ui.dropdown').dropdown({ keepOnScreen: true });
            $('.activating.element').popup();
        }, 1000);
    }

}
