// Map class that is used as a wrapper for the MapBox api
"use strict"; // TODO: No longer needed n ECMA6
class Map {
  //class that is responsible for loading the map box styles, controls and graphics layers
  //also use it to fly to a specified locaion on the Map
  constructor() {}
  mapInitialized(map, styleControls) {
    map.addControl(styleControls, "bottom-left");
    map.on("style.load", () => {
      this.mapLoaded(map);
    });
  }
  mapLoaded(map) {
    //Apply available styles from the MapBox API and the styles Dennis Designed
    // Insert the layer beneath any symbol layer.
    let layers = map.getStyle().layers;
    let labelLayerId;
    for (let i = 0; i < layers.length; i++) {
      if (layers[i].type === "symbol" && layers[i].layout["text-field"]) {
        labelLayerId = layers[i].id;
        break;
      }
    }
    map.addLayer(
      {
        id: "3d-buildings",
        source: "composite",
        "source-layer": "building",
        filter: ["==", "extrude", "true"],
        type: "fill-extrusion",
        minzoom: 15,
        paint: {
          "fill-extrusion-color": "#aaa",

          // use an 'interpolate' expression to add a smooth transition effect to the
          // buildings as the user zooms in
          "fill-extrusion-height": [
            "interpolate",
            ["linear"],
            ["zoom"],
            15,
            0,
            15.05,
            ["get", "height"]
          ],
          "fill-extrusion-base": [
            "interpolate",
            ["linear"],
            ["zoom"],
            15,
            0,
            15.05,
            ["get", "min_height"]
          ],
          "fill-extrusion-opacity": 0.6
        }
      },
      labelLayerId
    );
    let localCompany = JSON.parse(window.localStorage.getItem("company"));
    let url = `https://open.mapquestapi.com/geocoding/v1/address?key=&location=${
      localCompany.cmpAddress
    }`;
    fetch(url) //fly to the specified location based on latitude and longitude
      .then(res => {
        return res.json();
      })
      .then(json => {
        let res_loc = {
          center: [
            json.results[0].locations[0].latLng.lng,
            json.results[0].locations[0].latLng.lat
          ],
          zoom: 15
        };
        map.flyTo(res_loc);
      })
      .catch(err => {
        console.log(err);
      });
  }
}
export default Map;
