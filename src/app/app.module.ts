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
import { UserService } from './providers/user';

import { EsriLoaderService } from 'angular-esri-loader';


@NgModule({
    declarations: [
        AppComponent,
        MapperComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        CustomFormsModule,
        EsriLoaderModule
    ],
    providers: [EsriLoaderService, UserService],
    bootstrap: [AppComponent]
})
export class AppModule { }
