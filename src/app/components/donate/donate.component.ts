import { Component, OnInit, ViewChild, ElementRef, Input, Output, ChangeDetectorRef, EventEmitter } from '@angular/core';
import { FormControl, FormBuilder, FormGroup } from '@angular/forms';
import { CustomNG2Validators } from "../../providers/custom-validators";
import { DonorService } from '../../providers/donor';
import { CustomValidators } from 'ng2-validation';
import { Socks } from '../../providers/socks';

import { Observable } from "rxjs/Rx";

import { User } from "../../classes/user";

import _ from "lodash";

declare var $: any;

@Component({
    selector: 'app-donate',
    templateUrl: './donate.component.html',
    styleUrls: ['./donate.component.scss']
})
export class DonateComponent implements OnInit {
    //Initializations
    @Output() closemodal: EventEmitter<any> = new EventEmitter<any>(); //Output events to app.component to open #donate modal

    donorForm: FormGroup;
    donorData: User = new User();
    transacting: boolean;
    isLink = false;
    isSearching = false;
    notification: any = { status: false, header: "", message: "" };
    socket;

    //Dynamic Angular inputs for watch for changes on inputs.
    //@dData: donors data being loaded from parent i.e app.component
    //@linked: watch to see if user is going to be entering his link for updates
    //then load this same component

    @Input() set dData(v) {
        if (v.address) Object.assign(this.donorData, { coords: { address: v.address, coordinates: [v.point.longitude, v.point.latitude] }});
    };
    @Input() set linked(v: boolean) {
        this.isLink = v;
        //Disable or enable inputs for ease of use
        if (this.isLink) {
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

    constructor(private fb: FormBuilder, private donorSvc: DonorService, private socks: Socks, private cdRef: ChangeDetectorRef) {

        //Form validation initializers
        this.donorForm = this.fb.group({
            'link': [this.donorData.link, CustomNG2Validators.compose([])],
            'firstname': [this.donorData.firstname, CustomNG2Validators.compose([CustomNG2Validators.required, CustomNG2Validators.minLength(2)])],
            'lastname': [this.donorData.lastname, CustomNG2Validators.compose([CustomNG2Validators.required, CustomNG2Validators.minLength(2)])],
            'phone': [this.donorData.phone, CustomNG2Validators.compose([CustomNG2Validators.required, CustomValidators.phone])],
            'email': [this.donorData.email, CustomNG2Validators.compose([CustomNG2Validators.required, CustomValidators.email])],
            'blood_group': [this.donorData.blood_group, CustomNG2Validators.compose([CustomNG2Validators.required, CustomNG2Validators.minLength(1), , CustomNG2Validators.maxLength(2)])],
        });

        this.socket = socks.socket();
    }

    ngOnInit() {

        //Users link is set with six characters
        //User formcontrol with Observables to tie user data search all in.

        this.donorForm.controls['link']
            .valueChanges
            .debounceTime(500)
            // .distinctUntilChanged()
            .filter(y => y && y.length === 6 && this.isLink) //Make sure request is only made when 6 characters have been made
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

    //Submits a new request for user addition.
    submit(): void {
        this.transacting = true;
        this.donorSvc.create(this.donorData)
            .subscribe(d => {
                this.transacting = false;
                if (d.success) {
                    this.donorData.link = d.link;
                    this.notification = { status: true, header: "Success", message: `Your submission was successful. Please save this link, <h4>${this.donorData.link}</h4> and use it to edit your entry if you feel the need to.` };
                    this.socket.emit("hasJoined"); //Let the community you have joined.
                } else {
                    this.notification = { status: false, header: "Error", message: "An error occured during submission. Please try again." };
                }
            });
    }

    //Updates a users information.
    update(): void {
        this.donorSvc.update(this.donorData)
            .subscribe(d => {
                if (d.success) {
                    this.notification = { status: true, header: "Success", message: `Your update was successful.` };
                } else this.notification = { status: false, header: "Error", message: "An error occured during your update. Please try again." };
            });
    }

    //Removes a user from the donor DB
    delete(): void {
        if (!this.donorData) return;
        
        this.donorSvc.delete(this.donorData.link)
            .subscribe(d => {
                if (d.success) {
                    this.notification = { status: true, header: "Success", message: `You have successfully deleted your data. Window will close in 3 seconds` };
                    this.socket.emit("hasLeft", { id: this.donorData._id }); //On successful removal, broadcast to the rest of the donor world.
                    this.donorData = new User();
                    this.cdRef.detectChanges();
                    setTimeout(() => {
                        this.closemodal.emit();
                        this.hideMessage();
                    }, 3000);
                } else this.notification = { status: false, header: "Error", message: "An error occured. Please try again." };
            });
    }

    hideMessage(): void {
        this.notification = {status: false, header: "", message: ""};
    }

    //Semantic-UI component initializers
    initJSSemantics(): void {
        setTimeout(() => {
            $('.ui.dropdown').dropdown({ keepOnScreen: true });
            $('.activating.element').popup();
        }, 1000);
    }

}
