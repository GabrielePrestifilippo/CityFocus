define(function () {
    "use strict";
    var GeoJson = function (layerManager) {
        this.layerManager=layerManager;

        var layers = [];
        this.layers = layers;

        this.map = {
            'Narea_cani': [100, 255, 0],
            'Naree_verdi_clean': [0, 255, 0],
            'Nwater': [0, 10, 255],
            'Nparchi': [10, 240, 10]
        };
    };



    GeoJson.prototype.add = function (name, label) {
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

                if (properties && (properties.name || properties.Name || properties.NAME)) {
                 configuration.name = properties.name || properties.Name || properties.NAME;
                 }


            }
            else if (geometry.isLineStringType() || geometry.isMultiLineStringType()) {
                configuration.attributes = new WorldWind.ShapeAttributes(null);
                configuration.attributes.drawOutline = true;
                var r = self.map[name][0];
                var g = self.map[name][1];
                var b = self.map[name][2];
                configuration.attributes.outlineColor = new WorldWind.Color(
                    r * configuration.attributes.interiorColor.red,
                    g * configuration.attributes.interiorColor.green,
                    b * configuration.attributes.interiorColor.blue,
                    1.0);
                configuration.attributes.outlineWidth = 1.0;
            }
            else if (geometry.isPolygonType() || geometry.isMultiPolygonType()) {
                configuration.attributes = new WorldWind.ShapeAttributes(null);
                var r = self.map[name][0];
                var g = self.map[name][1];
                var b = self.map[name][2];
                configuration.attributes.interiorColor = new WorldWind.Color(
                    r,
                    g,
                    b,
                    0.1);

                configuration.attributes.outlineColor = new WorldWind.Color(
                    0.5 * configuration.attributes.interiorColor.red,
                    0.5 * configuration.attributes.interiorColor.green,
                    0.5 * configuration.attributes.interiorColor.blue,
                    1.0);
            }

            return configuration;
        };

        var callback = function () {
            self.eyeDistance.call(self, polygonLayer);
        }
        polygonGeoJSON.load(callback, shapeConfigurationCallback, polygonLayer);
        wwd.addLayer(polygonLayer);
        this.layerManager.synchronizeLayerList();
    };

    GeoJson.prototype.eyeDistance = function (layer) {
        this.layers.push(layer);

        for (var x in layer.renderables) {
            var o = layer.renderables[x];
            o.eyeDistanceScaling = true;
            o.eyeDistanceScalingThreshold = 10000;
        }
    };


    GeoJson.prototype.clean = function () {
        for (var x in this.layers) {
            wwd.removeLayer(this.layers[x]);
        }
        this.layers = [];
    };
    return GeoJson;
});