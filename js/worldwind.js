var wwd;
var nav;


define(['./LayerManager','src/WorldWind'],
    function (LayerManager) {

        var worldwind = function () {
        var self=this;
            wwd = new WorldWind.WorldWindow("canvasOne");

            var layers = [


                {layer: new WorldWind.ViewControlsLayer(wwd), enabled: true}
            ];

            for (var l = 0; l < layers.length; l++) {
                layers[l].layer.enabled = layers[l].enabled;
                wwd.addLayer(layers[l].layer);
            }

            // Create a layer manager for controlling layer visibility.
            this.layerManager= new LayerManager(wwd);


            wwd.navigator.lookAtLocation.latitude = 45.466;
            wwd.navigator.lookAtLocation.longitude = 9.1822;
            wwd.navigator.range = 35000;

            this.layerManager.flat();

            var request = new XMLHttpRequest();
            request.open("GET", "http://ows.terrestris.de/osm/service?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetCapabilities", true);
            request.onreadystatechange = function () {
                if (request.readyState === 4 && request.status === 200) {
                    var xmlDom = request.responseXML;

                    if (!xmlDom && request.responseText.indexOf("<?xml") === 0) {
                        xmlDom = new window.DOMParser().parseFromString(request.responseText, "text/xml");
                    }
                    var wmsCapsDoc = new WorldWind.WmsCapabilities(xmlDom);
                    var config = WorldWind.WmsLayer.formLayerConfiguration(wmsCapsDoc, null);
                    config.title = "OpenStreetMap";
                    config.layerNames = "OSM-WMS";
                    var layer = new WorldWind.WmsLayer(config, null);
                    layer.detailControl = 0.9;
                    wwd.addLayer(layer);
                    self.layerManager.synchronizeLayerList();


                }

            };

            request.send(null);
        };

        return worldwind;

    });

