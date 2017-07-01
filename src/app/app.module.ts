import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
    Http, HttpModule, JsonpModule,
    RequestOptions,
    XHRBackend
} from '@angular/http';
import { CustomFormsModule } from 'ng2-validation';
import { EsriLoaderModule } from 'angular-esri-loader';

import { AppComponent } from './app.component';
import { MapperComponent } from './components/mapper/mapper.component';
import { DonateComponent } from './components/donate/donate.component';
import { ProfileComponent } from './components/profile/profile.component';

import { DonorService } from './providers/donor';
import { Socks } from './providers/socks';

import { EsriLoaderService } from 'angular-esri-loader';

@NgModule({
    declarations: [
        AppComponent,
        MapperComponent,
        DonateComponent,
        ProfileComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        CustomFormsModule,
        EsriLoaderModule,
    ],
    providers: [EsriLoaderService, DonorService, Socks],
    bootstrap: [AppComponent]
})
export class AppModule { }
