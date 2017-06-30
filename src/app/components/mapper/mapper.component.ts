import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { EsriLoaderService } from 'angular-esri-loader';
import { Socks } from '../../providers/socks';
import { DonorService } from '../../providers/donor';

import { Observable } from "rxjs/Rx";
import { Store } from "@ngrx/store";
import { AppState } from "../../redux/state";
import { UserState } from "../../redux/user";

import { User } from "../../interfaces/user";

import _ from "lodash";

@Component({
    selector: 'app-mapper',
    templateUrl: './mapper.component.html',
    styleUrls: ['./mapper.component.scss']
})
export class MapperComponent implements OnInit {
    @Output() biopopup: EventEmitter<any> = new EventEmitter<any>();
    @Output() profilepopup: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('map') mapElement: ElementRef;
    geolocation: any[] = [9.0765, 7.3986];
    userState: Observable<UserState>;
    user: User;
    isMapLoading = true;
    mapinfo = "loading areas near you...";
    socket;

    constructor(private store: Store<AppState>, private esriLoader: EsriLoaderService, private socks: Socks, private donorSvc: DonorService) {
        this.userState = <Observable<UserState>>store.select("user");
        this.userState.subscribe(s => this.user = s.user);

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

                    pointGraphic.watch("click", function(evt){
                        console.log("Should open profile", pointGraphic.attributes.person);
                        showProfilePopup(pointGraphic.attributes.person);
                    });

                    mapView.graphics.add(pointGraphic);

                    // console.log("New location added", longlat);
                }

                function removeMarker(component): void {
                    mapView.graphics.remove(component);
                }

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

                function showProfilePopup(data) {
                    this.profilepopup.emit(data);
                }

                function showDonatePopup(address, pt) {
                    this.biopopup.emit({ address: address, point: pt });
                }

                function showMapPopup(address, pt) {
                    mapView.popup.open({
                        title: "Address",
                        content: address + "<br><br> Lat: " + Math.round(pt.latitude * 100000) / 100000 + " Lon: " + Math.round(pt.longitude * 100000) / 100000,
                        location: pt
                    });

                    showDonatePopup(address, pt);
                };

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

                mapView.on("click touchstart", evt => {
                    search.clear();
                    mapView.popup.clear();
                    const locatorSource = search.defaultSource;
                    locatorSource.locator.locationToAddress(evt.mapPoint)
                        .then(response => {
                            const address = response.address.Match_addr;
                            showMapPopup.call(this, address, evt.mapPoint);
                        }, err => {
                            console.log("It failed fam");
                            showMapPopup.call(this, "No address found for this location.", evt.mapPoint);
                        });
                });

                mapView.on("drag", evt => {
                    const center = mapView.extent.center;
                    const persons = _.filter(mapView.graphics.items, graphic => graphic.attributes.type === "person");
                    const ids = _.map(persons, person => person.attributes.person._id);
                    const point = [center.longitude, center.latitude];
                });

                mapView.then(() => {
                    this.isMapLoading = false;
                    this.donorSvc.find(g)
                        .subscribe(d => {
                            Observable.interval(500).take(d.donors.length)
                                .subscribe(i => addMarker(d.donors[i]));
                        });

                }, e => this.mapinfo = "Map loading error");

                this.socket.on("coords", d => {
                    _.each(d.donors, c => addMarker(c));
                });

                this.socket.on("leave", d => {
                    const person = _.find(mapView.graphics, graphic => (graphic.attributes.type === "person" && graphic.attributes.person._id === d._id));
                    if (person) removeMarker(person);
                });

                // mapView = new SceneView({
                //     container: this.mapElement.nativeElement,
                //     center: [-118.24368, 34.05293],
                //     zoom: 12,
                //     map
                // });

                // mapView.then(function () {
                //     mapView.goTo({
                //         center: [-118.35, 34.05],
                //         tilt: 70,
                //         zoom: 9
                //     })
                // });

                // const featureLayer = new FeatureLayer({
                //     url: "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trailheads/FeatureServer/0",
                //     outFields: ["TRL_NAME", "CITY_JUR", "LAT", "LON"],
                //     popupTemplate: {
                //         title: "{TRL_NAME}",
                //         content: "This trail is in {CITY_JUR} and located at {LAT},{LON}."
                //     }
                // });

                // map.add(featureLayer);

                // const featureLayer2 = new FeatureLayer({
                //     url: "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trails/FeatureServer",
                //     outFields: ["*"],
                //     popupTemplate: {
                //         title: "{TRL_NAME}",
                //         content: "{*}"
                //     },
                //     definitionExpression: "ELEV_GAIN < 250"
                // });

                // const renderer = UniqueValueRenderer.fromJSON({
                //     "type": "uniqueValue",
                //     "field1": "USE_BIKE",
                //     "uniqueValueInfos": [
                //         {
                //             "value": "Yes",
                //             "label": "Yes",
                //             "symbol": {
                //                 "color": [
                //                     0,
                //                     112,
                //                     255,
                //                     255
                //                 ],
                //                 "width": 1.5,
                //                 "type": "esriSLS",
                //                 "style": "esriSLSSolid"
                //             }
                //         },
                //         {
                //             "value": "No",
                //             "label": "No",
                //             "symbol": {
                //                 "color": [
                //                     20,
                //                     0,
                //                     0,
                //                     0
                //                 ],
                //                 "width": 1.5,
                //                 "type": "esriSLS",
                //                 "style": "esriSLSSolid"
                //             }
                //         }
                //     ]
                // });

                // featureLayer2.renderer = renderer;
                // map.add(featureLayer2);
            });
        });
    }

    ngOnInit() {
        
    }

}
