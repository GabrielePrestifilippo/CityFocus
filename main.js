$(function () {
    $("#header").load("header.html");
    $("#footer").load("footer.html");
});

require(['js/worldwind','js/results'],
    function (worldwind, results) {
       worldwind = new worldwind();

       var results = new results(worldwind.layerManager);
        results.listeners();

    });
