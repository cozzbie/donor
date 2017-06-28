import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { EsriLoaderService } from 'angular-esri-loader';

@Component({
    selector: 'app-mapper',
    templateUrl: './mapper.component.html',
    styleUrls: ['./mapper.component.scss']
})
export class MapperComponent implements OnInit {
    @ViewChild('map') mapElement: ElementRef;
    public mapView: any;
    geolocation: any[] = [9.0820, 8.6753];

    constructor(private esriLoader: EsriLoaderService) {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(position => {
                this.geolocation = [position.coords.latitude, position.coords.longitude];
                this.init(this.geolocation);
            });
        }else {
            this.init(this.geolocation);
        }
    }

    init(g): any {
        // only load the ArcGIS API for JavaScript when this component is loaded
        return this.esriLoader.load({
            // use a specific version of the JSAPI
            url: 'https://js.arcgis.com/4.3/'
        }).then(() => {
            // load the needed Map and MapView modules from the JSAPI
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
                const map: any = new Map({
                    // basemap: 'hybrid',
                    basemap: 'topo-vector',
                    // basemap: 'satellite',
                    // basemap: 'dark-gray-vector',
                    // basemap: 'streets-vector',
                    // basemap: 'streets-night-vector',
                    // basemap: 'oceans',
                });

                const featureLayer = new FeatureLayer({
                    url: "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trailheads/FeatureServer/0",
                    outFields: ["TRL_NAME", "CITY_JUR", "LAT", "LON"],
                    popupTemplate: {
                        title: "{TRL_NAME}",
                        content: "This trail is in {CITY_JUR} and located at {LAT},{LON}."
                    }
                });

                map.add(featureLayer);

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

                this.mapView = new MapView({
                    container: this.mapElement.nativeElement,
                    center: g,
                    zoom: 7,
                    map
                });

                const search = new Search({
                    view: this.mapView
                });
                // search.defaultSource.withinViewEnabled = true; // Limit search to visible map area only
                function showPopup(address, pt) {
                    console.log(pt.latitude);
                    this.mapView.popup.open({
                        title: "Find Address Result",
                        content: address + "<br><br> Lat: " + Math.round(pt.latitude * 100000) / 100000 + " Lon: " + Math.round(pt.longitude * 100000) / 100000,
                        location: pt
                    });
                }
                this.mapView.ui.add(search, "top-right"); // Add to the view
                this.mapView.on("click", evt => {
                    search.clear();
                    this.mapView.popup.clear();
                    const locatorSource = search.defaultSource;
                    locatorSource.locator.locationToAddress(evt.mapPoint)
                        .then(response => {
                            const address = response.address.Match_addr;
                            showPopup(address, evt.mapPoint);
                        }, err => {
                            showPopup("No address found for this location.", evt.mapPoint);
                        });
                });

                // Create a point
                const point = new Point({
                    longitude: this.geolocation[0],
                    latitude: this.geolocation[1]
                });

                //Create a symbol for drawing the point
                // const markerSymbol = new SimpleMarkerSymbol({
                //     color: [226, 119, 40],
                //     outline: {
                //         color: [255, 255, 255],
                //         width: 1
                //     }
                // });

                const markerSymbol = new SimpleMarkerSymbol({
                    color: [225, 0, 0, 1],
                    size: 14,
                    outline: {
                        style: "none",
                        color: [225, 0, 0, 1]
                    },
                    style: SimpleMarkerSymbol.STYLE_PATH,
                    path: "M16,3.5c-4.142,0-7.5,3.358-7.5,7.5c0,4.143,7.5,18.121,7.5,18.121S23.5,15.143,23.5,11C23.5,6.858,20.143,3.5,16,3.5z M16,14.584c-1.979,0-3.584-1.604-3.584-3.584S14.021,7.416,16,7.416S19.584,9.021,19.584,11S17.979,14.584,16,14.584z"
                });

                // Create a graphic and add the geometry and symbol to it
                const pointGraphic = new Graphic({
                    geometry: point,
                    symbol: markerSymbol
                });

                // Add the graphic to the view
                this.mapView.graphics.add(pointGraphic);

                // markerSymbol2.setPath("M16,3.5c-4.142,0-7.5,3.358-7.5,7.5c0,4.143,7.5,18.121,7.5,18.121S23.5,15.143,23.5,11C23.5,6.858,20.143,3.5,16,3.5z M16,14.584c-1.979,0-3.584-1.604-3.584-3.584S14.021,7.416,16,7.416S19.584,9.021,19.584,11S17.979,14.584,16,14.584z");
                // markerSymbol2.setStyle(SimpleMarkerSymbol.STYLE_PATH);

                // this.mapView = new SceneView({
                //     container: this.mapElement.nativeElement,
                //     center: [-118.24368, 34.05293],
                //     zoom: 12,
                //     map
                // });

                // this.mapView.then(function () {
                //     this.mapView.goTo({
                //         center: [-118.35, 34.05],
                //         tilt: 70,
                //         zoom: 9
                //     })
                // });
            });
        });
    }

    ngOnInit() {
        
    }

}
