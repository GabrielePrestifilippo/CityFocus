$(function () {
    $("#header").load("header.html");
    $("#footer").load("footer.html");
});

require(['js/worldwind','js/results'],
    function (worldwind, results) {
       worldwind = new worldwind();

       var results = new results(worldwind.layerManager);
        results.listeners();


        //wwd.layers[2].renderables[3]._attributes._interiorColor=new WorldWind.Color(0,0,0,1)
    });
