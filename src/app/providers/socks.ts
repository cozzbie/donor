import { Injectable, Inject } from "@angular/core";
import { Observable } from "rxjs/Rx";
import { environment } from '../../environments/environment';

declare var io: any;

@Injectable()
export class Socks {
    socks;
    server = environment.server;

    constructor( ) {
        this.socks = io(this.server);
    }

    init() {
        this.socks.on('connect', () => {
            console.log("Connected");
            this.listeners();
        });

        this.socks.on("reconnect", () => {
            console.log("Socket reconnect called");
        });

        this.socks.on("connecting", () => {
            console.log("Socket is connecting");
        });

        this.socks.on("reconnecting", () => {
            console.log("Socket is reconnecting");
        });

        this.socks.on("connect_failed", () => {
            console.log("Socket connect failed");
        });

        this.socks.on('reconnecting', () => {
            console.log("Socket is reconnecting.");
        });

        this.socks.on('reconnect_failed', () => {
            console.log("Reconnect failed");
        });

        this.socks.on('close', () => {
            console.log("Socket closed");
        });

        this.socks.on('disconnect', () => {
            console.log("Socket disconnect");
        });

        this.socks.on('connect_error', (err) => {
            console.log('Error connecting to server');
        });
    }

    listeners() {
        this.socks.on('err', (err) => console.log(err.message));
    }

    socket() {
        return this.socks;
    }

    connect() {
        this.socks.connect();
    }

    
}
