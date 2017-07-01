import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { EsriLoaderService } from 'angular-esri-loader';
import { Socks } from '../../providers/socks';
import { DonorService } from '../../providers/donor';

import { Observable } from "rxjs/Rx";

import { User } from "../../classes/user";

import _ from "lodash";

@Component({
    selector: 'app-mapper',
    templateUrl: './mapper.component.html',
    styleUrls: ['./mapper.component.scss']
})
export class MapperComponent implements OnInit {
    @Output() biopopup: EventEmitter<any> = new EventEmitter<any>(); //Output events to app.component to open #donate modal
    @Output() profilepopup: EventEmitter<any> = new EventEmitter<any>();  //Output events to app.component to open #profile modal
    @ViewChild('map') mapElement: ElementRef; //Map element container

    geolocation: any[] = [7.3986, 9.0765]; //The default location to load if users decide they dont want to allow geolocation
    isMapLoading = true;
    mapinfo = "map rendering...";
    socket;

    constructor(private esriLoader: EsriLoaderService, private socks: Socks, private donorSvc: DonorService) {

        //Test users browser for compatibilty
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(position => {
                this.geolocation = [position.coords.longitude, position.coords.latitude];
                this.init(this.geolocation);
            });
        }else {
            this.init(this.geolocation);
        }

        this.socket = socks.socket();
    }

    init(g): any {
        //Load ARCGIS's lib
        return this.esriLoader.load({
            url: 'https://js.arcgis.com/4.3/'
        }).then(() => {
            this.esriLoader.loadModules([
                'esri/Map',
                'esri/views/MapView',
                "esri/layers/FeatureLayer",
                "esri/views/SceneView",
                "esri/renderers/UniqueValueRenderer",
                "esri/widgets/Search",
                "esri/Graphic",
                "esri/geometry/Point",
                "esri/symbols/SimpleMarkerSymbol",
            ]).then(([
                Map,
                MapView,
                FeatureLayer,
                SceneView,
                UniqueValueRenderer,
                Search,
                Graphic,
                Point,
                SimpleMarkerSymbol
            ]) => {

                let mapView;

                
                /**
                 * Adds a marker to the map
                 * @param  {any} person
                 */

                function addMarker(person: any): void {
                    const point = new Point({
                        longitude: person.coords.coordinates[0],
                        latitude: person.coords.coordinates[1]
                    });

                    const pointGraphic = new Graphic({
                        geometry: point,
                        symbol: createMarker(),
                        attributes: {
                            type: "person",
                            person
                        }
                    });

                    mapView.graphics.add(pointGraphic);
                }

                /**
                 * Removes a marker from the map
                 * @param  {any} component -- Graphics component to be removed
                 */

                function removeMarker(component): void {
                    mapView.graphics.remove(component);
                }

                //Creates a specific type of marker
                function createMarker(): any {
                    return new SimpleMarkerSymbol({
                        color: [225, 0, 0, 1],
                        size: 16,
                        outline: {
                            style: "none",
                            color: [225, 0, 0, 1]
                        },
                        style: SimpleMarkerSymbol.STYLE_PATH,
                        path: "M16,3.5c-4.142,0-7.5,3.358-7.5,7.5c0,4.143,7.5,18.121,7.5,18.121S23.5,15.143,23.5,11C23.5,6.858,20.143,3.5,16,3.5z M16,14.584c-1.979,0-3.584-1.604-3.584-3.584S14.021,7.416,16,7.416S19.584,9.021,19.584,11S17.979,14.584,16,14.584z"
                    });
                }

                /**
                 * Emits a value to app.component to open up #profile modal
                 * @param  {any} data
                 */

                function showProfilePopup(data) {
                    this.profilepopup.emit(data);
                }

                /**
                 * Emits a value to app.component to open up #donor modal
                 * @param  {any} address User geolocation coordinates
                 * @param  {any} pt
                 */

                function showDonatePopup(address, pt) {
                    this.biopopup.emit({ address: address, point: pt });
                }

                /**
                 * Loads ARCGIS map popup
                 * @param  {any} address User physical address
                 * @param  {any} pt Users geolocation coordinates
                 */

                function showMapPopup(address, pt) {
                    mapView.popup.open({
                        title: "Address",
                        content: address + "<br><br> Lat: " + Math.round(pt.latitude * 100000) / 100000 + " Lon: " + Math.round(pt.longitude * 100000) / 100000,
                        location: pt
                    });

                    showDonatePopup.call(this, address, pt);
                };

                //Requests donors via the socket
                function requestDonors(){
                    const center = mapView.extent.center;
                    const persons = _.filter(mapView.graphics.items, graphic => graphic.attributes.type === "person");
                    const ids = _.map(persons, person => person.attributes.person._id);

                    this.socket.emit("request", { ids, center: [center.longitude, center.latitude] });
                }

                //Load up markers smartly without slamming all the locations at once on the screen.
                function smartLoadMarkers(donors){
                    Observable.interval(500).take(donors.length)
                        .subscribe(i => addMarker(donors[i]));
                }

                const map: any = new Map({
                    // basemap: 'hybrid',
                    // basemap: 'osm',
                    // basemap: 'terrain',
                    // basemap: 'topo',
                    // basemap: 'topo-vector',
                    // basemap: 'satellite',
                    // basemap: 'dark-gray-vector',
                    // basemap: 'streets-vector',
                    // basemap: 'streets',
                    // basemap: 'streets-relief-vector',
                    // basemap: 'streets-night-vector',
                    basemap: 'streets-navigation-vector',
                    // basemap: 'streets-night-vector',
                    // basemap: 'oceans',
                    // basemap: 'national-geographic',
                    // basemap: 'dark-gray',
                    // basemap: 'gray',
                    // basemap: 'gray-vector',
                });

                mapView = new MapView({
                    container: this.mapElement.nativeElement,
                    center: g,
                    zoom: 12,
                    map
                });

                const search = new Search({
                    view: mapView
                });

                mapView.ui.add(search, "top-right");

                mapView.on("click", evt => {
                    
                    //Detect if a marker has been hit
                    mapView.hitTest({ x: evt.x, y: evt.y })
                        .then(response => {
                            if (response.results[0]) {
                                //If a marker is hit, lets display the information on the marker
                                const graphic = response.results[0].graphic;
                                showProfilePopup.call(this, graphic.attributes.person);
                            } else {
                                //Else, prompt user with new form to join donor community 
                                search.clear();
                                mapView.popup.clear();
                                const locatorSource = search.defaultSource;
                                locatorSource.locator.locationToAddress(evt.mapPoint)
                                    .then(resp => {
                                        const address = resp.address.Match_addr;
                                        showMapPopup.call(this, address, evt.mapPoint);
                                    }, err => {
                                        console.log("It failed fam");
                                        showMapPopup.call(this, "No address found for this location.", evt.mapPoint);
                                    });
                            }
                            
                        }, e => console.log(e));
                });

                //We dont want a situation where every single pan/drag leads to a server request
                //Observables handle this quite well.

                const source = Observable.create(obs => {
                    mapView.on("drag", evt => obs.next());
                    mapView.on("mouse-wheel", evt => obs.next());
                });

                //Make sure user has stopped panning before loading new points.
                source.debounceTime(1000).subscribe(d => requestDonors.call(this));
                

                //Load up the map
                mapView.then(() => {
                    this.isMapLoading = false;
                    this.donorSvc.find(g)
                        .subscribe(d => smartLoadMarkers(d.donors));

                }, e => this.mapinfo = "Map loading error");

                //Lets us know someone knew has joined and requests new locations if applicable
                this.socket.on("joined", d => requestDonors.call(this));

                //Lets us handle the availability of new coordinates as map actions occur
                this.socket.on("coords", d => smartLoadMarkers(d.donors));

                //Lets us handle the removal of a person/donor
                this.socket.on("leave", d => {
                    const person = _.find(mapView.graphics.items, graphic => (graphic.attributes.type === "person" && graphic.attributes.person._id === d.id));
                    if (person) removeMarker(person);
                });

            });
        });
    }

    ngOnInit() {
        
    }

}
