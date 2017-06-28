import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormBuilder, FormGroup } from '@angular/forms';
import { CustomNG2Validators } from "../../providers/custom-validators";
import { UserService } from '../../providers/user';
import { CustomValidators } from 'ng2-validation';

@Component({
    selector: 'app-donate',
    templateUrl: './donate.component.html',
    styleUrls: ['./donate.component.scss']
})
export class DonateComponent implements OnInit {
    donorForm: FormGroup;
    donorData: any = {};

    constructor(private fb: FormBuilder, private userSvc: UserService) {
        this.donorForm = this.fb.group({
            'firstname': [this.donorData.firstname, CustomNG2Validators.compose([CustomNG2Validators.required])],
            'lastname': [this.donorData.lastname, CustomNG2Validators.compose([CustomNG2Validators.required])],
            'phone': [this.donorData.contact, CustomNG2Validators.compose([CustomNG2Validators.required])],
            'email': [this.donorData.email, CustomNG2Validators.compose([CustomNG2Validators.required, CustomValidators.email])],
            'blood_group': [this.donorData.blood_group, CustomNG2Validators.compose([CustomNG2Validators.required])],
        });
    }

    ngOnInit() {}

}
