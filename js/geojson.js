define(function () {
    "use strict";
    var GeoJson = function (layerManager) {
        this.layerManager = layerManager;

        var layers = [];
        this.layers = layers;


    };


    GeoJson.prototype.add = function (name, label, active) {
        var self = this;
        var resourcesUrl = "geojson/";


        var polygonLayer = new WorldWind.RenderableLayer(label);
        var polygonGeoJSON = new WorldWind.GeoJSONParser(resourcesUrl + name + ".geojson");

        var placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
        placemarkAttributes.imageScale = 0.2;
        placemarkAttributes.imageSource = 'icons/' + name + '.png';


        var shapeConfigurationCallback = function (geometry, properties) {
            var configuration = {};

            if (geometry.isPointType() || geometry.isMultiPointType()) {
                configuration.attributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
                /*
                 if (properties && (properties.name || properties.Name || properties.NAME)) {
                 configuration.name = properties.name || properties.Name || properties.NAME;
                 }
                 */

            }
            else if (geometry.isLineStringType() || geometry.isMultiLineStringType()) {
                configuration.attributes = new WorldWind.ShapeAttributes(null);
                configuration.attributes.drawOutline = true;

                configuration.attributes.outlineColor = new WorldWind.Color(
                    0.5 * configuration.attributes.interiorColor.red,
                    0.5 * configuration.attributes.interiorColor.green,
                    0.5 * configuration.attributes.interiorColor.blue,
                    1.0);
                configuration.attributes.outlineWidth = 0.4;
            }
            else if (geometry.isPolygonType() || geometry.isMultiPolygonType()) {
                configuration.attributes = new WorldWind.ShapeAttributes(null);
                configuration.attributes.outlineWidth = 0.4;
                configuration.attributes.interiorColor = new WorldWind.Color(
                    1 + 0.5,
                    0.375 + 0.5,
                    0.375 + 0.5,
                    0.4);

                configuration.attributes.outlineColor = new WorldWind.Color(
                    0.5 * configuration.attributes.interiorColor.red,
                    0.5 * configuration.attributes.interiorColor.green,
                    0.5 * configuration.attributes.interiorColor.blue,
                    1.0);
            }

            return configuration;
        };
        try {

            var callback = function () {
                self.eyeDistance.call(self, polygonLayer);
            }
            polygonGeoJSON.load(callback, shapeConfigurationCallback, polygonLayer);
            active ? true : false;
            polygonLayer.enabled = active;

        } catch (e) {
            console.log("No vector available" + e);
        }

    };

    GeoJson.prototype.eyeDistance = function (layer) {
        if (layer.renderables) {
            wwd.addLayer(layer);
            if (layer.displayName !== "Area") {
                this.layers.push(layer);
            }
            for (var x in layer.renderables) {
                var o = layer.renderables[x];
                o.eyeDistanceScaling = true;
                o.eyeDistanceScalingThreshold = 10000;
            }
            this.layerManager.synchronizeLayerList();
        }
    };

    GeoJson.prototype.clean = function () {
        var length = this.layers.length;
        for (var x = 0; x <= length; x++) {
            wwd.removeLayer(this.layers[x]);
        }

        this.layers = [];

    };
    return GeoJson;
})
;