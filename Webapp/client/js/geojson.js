define(function () {
    "use strict";
    var GeoJson = function (layerManager) {
        this.layerManager = layerManager;
        var layers = [];
        this.layers = layers;

    };

    GeoJson.prototype.add = function (name, label, active, callbackFunction) {
        var self = this;
        var resourcesUrl = "geojson/";

        if (label == "Neighborhoods") {
            var polygonLayer = new WorldWind.RenderableLayer(label);
        } else {
            var polygonLayer = new WorldWind.RenderableLayer(label + " ");
        }
        var polygonGeoJSON = new WorldWind.GeoJSONParser(resourcesUrl + name + ".geojson");

        var placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
        placemarkAttributes.imageScale = 0.2;
        placemarkAttributes.imageSource = 'icons/' + name + '.png';


        var shapeConfigurationCallback = function (geometry, properties) {
            var configuration = {};

            if (geometry.isPointType() || geometry.isMultiPointType()) {
                configuration.attributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);

            }
            else if (geometry.isLineStringType() || geometry.isMultiLineStringType()) {
                configuration.attributes = new WorldWind.ShapeAttributes(null);
                configuration.attributes.drawOutline = true;
                configuration.attributes.outlineWidth = 0.50;
            }
            else if (geometry.isPolygonType() || geometry.isMultiPolygonType()) {
                configuration.attributes = new WorldWind.ShapeAttributes(null);
                configuration.attributes.outlineWidth = 0.45;
                configuration.attributes.interiorColor = new WorldWind.Color(0,0,0,0);

                configuration.attributes.outlineColor = new WorldWind.Color(0,0,0,0.8);
            }

            return configuration;
        };
        try {

            var callback = function () {
                self.eyeDistance.call(self, polygonLayer);
                if (callbackFunction && typeof (callbackFunction) == "function") {
                    callbackFunction();
                }
            }
            try {
                polygonGeoJSON.load(callback, shapeConfigurationCallback, polygonLayer);
                active ? true : false;
                polygonLayer.enabled = active;
            } catch (e) {
                console.log("No vector available" + e);
            }

        } catch (e) {
            console.log("No vector available" + e);
        }

    };

    GeoJson.prototype.milano = function (callback) {
        var resourcesUrl = "geojson/milano_grid.json";

        var self = this;
        $.ajax({
            url: "geojson/milano_grid.json",
            success: function (res) {
                self.JSONgrid = JSON.stringify(res);
                var polygonGeoJSON = new WorldWind.GeoJSONParser(JSON.stringify(res));
                polygonGeoJSON.load(callback, shapeConfigurationCallback, polygonLayer);
            }
        });

        var polygonLayer = new WorldWind.RenderableLayer("CityFocus Result");


        var shapeConfigurationCallback = function (geometry, properties) {
            var configuration = {};

            if (geometry.isPolygonType() || geometry.isMultiPolygonType()) {
                configuration.attributes = new WorldWind.ShapeAttributes(null);
                configuration.attributes.outlineWidth = 0.0;
                configuration.attributes.interiorColor = new WorldWind.Color(
                    0, 0, 0, 0);


                configuration.attributes.drawOutline = false;
            }

            return configuration;
        };
        polygonLayer.enabled = false;
        polygonLayer.pickEnabled = false;
        polygonLayer.opacity = 0.5;
        polygonLayer.raster = true;
        this.grid = polygonLayer;
        wwd.addLayer(polygonLayer);
        // this.layerManager.synchronizeLayerList();

    };

    GeoJson.prototype.getColor = function (weight, inputColors) {
        var p, colors = [];
        if (weight < 50) {
            colors[1] = inputColors[0];
            colors[0] = inputColors[1];
            p = weight / 50;
        } else {
            colors[1] = inputColors[1];
            colors[0] = inputColors[2];
            p = (weight - 50) / 50;
        }
        var w = p * 2 - 1;
        var w1 = (w / 1 + 1) / 2;
        var w2 = 1 - w1;
        var rgb = [Math.round(colors[0][0] * w1 + colors[1][0] * w2),
            Math.round(colors[0][1] * w1 + colors[1][1] * w2),
            Math.round(colors[0][2] * w1 + colors[1][2] * w2)
        ];
        return [rgb[0], rgb[1], rgb[2], 255];
    };


    GeoJson.prototype.eyeDistance = function (layer) {
        if (layer.renderables) {
            wwd.addLayer(layer);
            if (layer.displayName !== "Neighborhoods") {
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