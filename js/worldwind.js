var wwd;
var nav;
var accelerateRender=false;
var layerManager;
define(['./LayerManager'],
    function (LayerManager) {

        var worldwind = function (results) {
            this.results = results;
            wwd = new WorldWind.WorldWindow("canvasOne");

            var layers = [


                {layer: new WorldWind.ViewControlsLayer(wwd), enabled: true}
            ];

            for (var l = 0; l < layers.length; l++) {
                layers[l].layer.enabled = layers[l].enabled;
                wwd.addLayer(layers[l].layer);
            }

            // Create a layer manager for controlling layer visibility.
            this.layerManager = new LayerManager(wwd);
            layerManager = this.layerManager;

            wwd.navigator.lookAtLocation.latitude = 45.466;
            wwd.navigator.lookAtLocation.longitude = 9.1822;
            wwd.navigator.range = 35000;

            //this.layerManager.flat();



        };

        return worldwind;

    });

