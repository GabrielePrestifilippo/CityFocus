
define(function () {
    "use strict";

    var UserInterface = function (layerManager, geojson) {
        this.layerManager = layerManager;
        this.geojson = geojson;
        this.rasters=[];
        this.map = {};
    };


    UserInterface.prototype.listeners = function () {
        var self = this;


        $(".slider").slider({
            ticks: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
            ticks_snap_bounds: 10,
            value: 0
        });

        var opacitySlider = $("#opacity_slider").slider({
            value: 4
        });

        opacitySlider.change(function (val) {
            var val = val.value.newValue;
            for(var x in self.geojson.grid.renderables){
                self.geojson.grid.renderables[x].attributes.interiorColor.alpha=val/10;
            }
           // self.geojson.grid.opacity = val / 10;
        });

        $('a').tooltip();

        $('a').click(function () {
            $('a').tooltip('hide');
        });

        $('#expandLayer').click(function () {
            var open = $("#layerList").attr("data-open");
            if (open == "false") {
                $("#layerList").css("max-height", "400px");
                $("#layerList").attr("data-open", true);
            } else {
                $("#layerList").css("max-height", "0px");
                $("#layerList").attr("data-open", "false")
            }
        });

        $('#expandRaster').click(function () {
            var open = $("#rasterList").attr("data-open");
            if (open == "false") {
                $("#rasterList").css("max-height", "400px");
                $("#rasterList").attr("data-open", true);
            } else {
                $("#rasterList").css("max-height", "0px");
                $("#rasterList").attr("data-open", "false")
            }
        });


        $("#reset").click(function () {
            $(".slider").slider("setValue",0);
            $("#reset").hide();
            self.geojson.clean();
            var length = self.rasters.length;
            for (var x = 0; x <= length; x++) {
                wwd.removeLayer(self.rasters[x]);
            }
            for (var x = 0; x <wwd.layers[3].renderables.length; x++) {
                wwd.layers[3].renderables[x].enabled=false;
            }
            $("#criteria_selected").html("");
            wwd.redraw();
            layerManager.synchronizeLayerList();
            wwd.layers[3].enabled=false;
            });

        $("#submitQuery").click(function () {
            $('html, body').animate({
                scrollTop: $('#footer').offset().top
            }, 'slow');
            $("#reset").show();
            var count = 0;
            var idSlider = [];
            self.geojson.clean();
            for (var x = 0; x <wwd.layers[3].renderables.length; x++) {
                wwd.layers[3].renderables[x].enabled=true;
            }
            $(".name_slider div").each(function () {
                if (this.id) {
                    idSlider.push(this.id);
                    count++;
                }
            });
            var allValues = [];
            $("#criteria_selected").html("");
            idSlider.forEach(function (id, x) {
                idSlider[x] = [];
                var value = $("#" + id).slider().slider('getValue');
                if (Number(value) > 0) {
                    value = (Math.round(value / 10) * 10);
                    idSlider[x].push(id);
                    var name = $("#" + id).parent().find("label").text();
                    var div = '<div class="selected">' + name + ' - <strong>' + value + '%</strong></div>';
                    $("#criteria_selected").append(div);
                    try {
                        self.geojson.add(id, name);
                    } catch (e) {
                        console.log("Json not available for:" + id)
                    }
                    ;
                    allValues.push([id, value]);
                }

            });


            var letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p',
                'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
            var query = 'for';
            for (var x = 0; x < allValues.length; x++) {
                query += ' ' + letters[x] + ' in (' + allValues[x][0] + ')';
                if (x < allValues.length - 1) {
                    query += ',';
                }
            }
            query += ' return encode( ( (';
            var sum = 0;
            for (var x = 0; x < allValues.length; x++) {
                query += letters[x] + '*' + allValues[x][1];
                sum += allValues[x][1];
                if (x < allValues.length - 1) {
                    query += ' + ';
                } else {
                    query += ')/' + (sum / 100);
                }
            }
            query += '), "csv") )';


            var data;
            $.ajax({
                type: "POST",
                url: 'http://131.175.143.84/rasdaman74/ows/wcps',
                data: {query: query},
                success: function (res) {
                    self.addLayer(res);
                    data = res
                    self.addRasters(allValues);
                }
            });


        });
    };

    UserInterface.prototype.addLayer = function (request) {


        var grid = this.geojson.grid;
        this.convertToshape(grid, request);

        $("#expandRaster").show();
        $("#expandLayer").show();
        $("#selectedCriteriaDiv").show();

       //$("#opacity").show();
        wwd.redraw();
    };

    UserInterface.prototype.addRasters = function (allValues) {
        var self = this;
        for (var x = 0; x < allValues.length; x++) {
            var query = 'for a in (' + allValues[x][0] + ')  return encode ( a*100, "csv") ';

            var ajax = function (z) {
                $.ajax({
                    type: "POST",
                    url: 'http://131.175.143.84/rasdaman74/ows/wcps',
                    data: {query: query},
                    success: function (res) {
                        self.addSingleRaster(res, allValues[z][0]);
                    }
                });
            }

            ajax(x);
        }
    };

    UserInterface.prototype.addSingleRaster = function (res, name) {

        var self = this;
        var label = $("#" + name).parent().find("label").text();
        var polygonLayer = new WorldWind.RenderableLayer(label + " Criterion Map");

        var polygonGeoJSON = new WorldWind.GeoJSONParser(geojson.JSONgrid);
        var shapeConfigurationCallback = function (geometry, properties) {
            var configuration = {};
            if (geometry.isPolygonType() || geometry.isMultiPolygonType()) {
                configuration.attributes = new WorldWind.ShapeAttributes(null);
                configuration.attributes.outlineWidth = 0.0;
                configuration.attributes.drawOutline = false;
            }
            return configuration;
        };
        self.rasters.push(polygonLayer);
        var callback = function (polygonLayer) {
            self.convertToshape(polygonLayer, res);
            polygonLayer.raster = true;
            polygonLayer.enabled = false;
            wwd.addLayer(polygonLayer);
            self.geojson.layers.push(polygonLayer);
            layerManager.synchronizeLayerList();
        }
        polygonGeoJSON.load(callback, shapeConfigurationCallback, polygonLayer);


    };

    UserInterface.prototype.convertToshape = function (grid, data) {

        var csv = [];

        data = data.split("},");
        var max = 0;
        for (var x = 0; x < data.length; x++) {
            var str = data[x].replace(/\{|\}/g, '');
            str = str.split(",");

            for (var y = 0; y < str.length; y++) {

                var temp = Number(str[y]);
                max = Math.max(max, temp);
                csv.push(temp);

            }
        }


        var self = this;
        var colors = [[141, 193, 197], [255, 237, 170], [215, 25, 28]];

        var rightIndex = 94;
        var topIndex = 85;
        for (var x = 0; x < grid.renderables.length; x++) {
            grid.renderables[x].stateKeyInvalid = true;
            grid.renderables[x].enabled = false;
        }

        for (var x = 0; x < grid.renderables.length; x++) {

            topIndex--;

            if (topIndex == 0) {
                topIndex = 84;
                rightIndex--;
            }

            var r = grid.renderables[(94 * topIndex) - rightIndex];

            //r.pathType = WorldWind.LINEAR;
           // r.maximumNumEdgeIntervals = 1;
            var value = csv[x];
            value = Math.round(value / 10) * 10;
            if (!self.map[value]) {

                var col = geojson.getColor(((value - 0) / (max - 0)) * 100, colors);

                if (value == 0) {
                    col = WorldWind.Color.colorFromBytes(col[0], col[1], col[2], 40);
                } else {
                    col = WorldWind.Color.colorFromBytes(col[0], col[1], col[2], 126);
                }
                self.map[value] = col;
            }
            r.attributes.interiorColor = self.map[value];

        }

        for (var x = 0; x < grid.renderables.length; x++) {
            grid.renderables[x].enabled = true;
        }

        grid.enabled = true;
        grid.opacity = 0.5;
        layerManager.synchronizeLayerList();
    };

    return UserInterface
})

