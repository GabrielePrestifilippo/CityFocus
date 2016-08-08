var wwd;
var nav;
requirejs(['./LayerManager'],
    function (LayerManager) {
        "use strict";

        WorldWind.Logger.setLoggingLevel(WorldWind.Logger.LEVEL_WARNING);

        wwd = new WorldWind.WorldWindow("canvasOne");

        var layers = [

            {layer: new WorldWind.BingRoadsLayer(null), enabled: true},
            {layer: new WorldWind.OpenStreetMapImageLayer(null), enabled: false},
            {layer: new WorldWind.CompassLayer(), enabled: true},
            {layer: new WorldWind.CoordinatesDisplayLayer(wwd), enabled: true},
            {layer: new WorldWind.ViewControlsLayer(wwd), enabled: true}
        ];

        for (var l = 0; l < layers.length; l++) {
            layers[l].layer.enabled = layers[l].enabled;
            wwd.addLayer(layers[l].layer);
        }

        // Create a layer manager for controlling layer visibility.
        var layerManger = new LayerManager(wwd);

        wwd.navigator.lookAtLocation.latitude= 45.466;
        wwd.navigator.lookAtLocation.longitude = 9.1822;
        wwd.navigator.range = 35000;
        wwd.layers[0].detailControl=0.6;
        layerManger.flat();

    });