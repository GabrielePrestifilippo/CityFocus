define(['js/geojson'],
    function (GeoJson) {
        "use strict";

        var results = function (layerManager) {
            this.layerManager = layerManager;
            this.geojson = new GeoJson(layerManager);

        };


        results.prototype.listeners = function() {
            var self=this;
            $(function () {
                $(".slider").slider({
                    orientation: "horizontal",
                    range: "min",
                    max: 100,
                    value: 0,
                    step: 10
                });

                $("#air_slider").slider("value", 255);

            });


            $("#submitQuery").click(function () {
                var count = 0;
                var idSlider = [];
                self.geojson.clean();

                $(".name_slider div").each(function () {
                    if (this.id) {
                        idSlider.push(this.id);
                        count++;
                    }
                });
                $("#criteria_selected").html("");
                idSlider.forEach(function (id, x) {
                    idSlider[x] = [];
                    var value = $("#" + id).slider("option", "value");
                    if (Number(value) > 0) {
                        idSlider[x].push(id);
                        var name = $("#" + id).parent().find("label").text();
                        var div = '<div class="selected">' + name + ' - <strong>' + value + '%</strong></div>';
                        $("#criteria_selected").append(div);
                        self.geojson.add(id, name);
                    }

                });
                //console.log(idSlider);

                //query="image>>for c in ( AvgLandTemp ) return encode(coverage myCoverage over $p x(0:100), $q y(0:100) values $p/2+$q/2, "png")"


                // var request = 'http://ows.rasdaman.org/rasdaman/ows?query=' + query;
                //addLayer(request)


            });

            function addLayer(request) {
                var surfaceImageLayer = new WorldWind.RenderableLayer();
                surfaceImageLayer.displayName = "Rasdaman Coverage";
                surfaceImageLayer.addRenderable(new WorldWind.SurfaceImage(new WorldWind.Sector(-90, 90, -180, 180), request)); //milano
                wwd.addLayer(surfaceImageLayer);
                wwd.redraw();
            }

            /*

             $("#r1").percentageLoader({
             width : 100, height : 100, progress : 0.9, value : '90%'});

             $("#r2").percentageLoader({
             width : 100, height : 100, progress : 0.7, value : '70%'});

             */
        };
        return results
    });