define(function () {
    "use strict";

    var UserInterface = function (layerManager, geojson) {
        this.layerManager = layerManager;
        this.geojson = geojson;
        this.geojson.milano();
        this.map = {};

    };


    UserInterface.prototype.listeners = function () {
        var self = this;


        $(".slider").slider({
            ticks: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
            ticks_snap_bounds: 10,
            value: 0

        });

        $('a').tooltip();

        $('a').click(function () {
            $('a').tooltip('hide');
        })

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
                    self.geojson.add(id, name);
                    allValues.push([id, value]);
                }

            });

            var query = 'for c in (Natms_200) return encode(c*100, "csv")';
            var data;
            $.ajax({
                type: "POST",
                url: 'http://131.175.143.84/rasdaman74/ows/wcps',
                data: {query: query},
                success: function (res) {
                    //console.log(res);
                    self.addLayer(res);
                    data = res
                }
            });

        });
    };


    UserInterface.prototype.addLayer = function (request) {
        /*
         var surfaceImageLayer = new WorldWind.RenderableLayer();
         surfaceImageLayer.displayName = "Rasdaman Coverage";
         surfaceImageLayer.addRenderable(new WorldWind.SurfaceImage(new WorldWind.Sector(-90, 90, -180, 180), request)); //milano
         wwd.addLayer(surfaceImageLayer);
         wwd.redraw();
         */


        var grid = this.geojson.grid;
        this.convertToshape(grid, request);


        var callback = function (res) {

        };

        wwd.redraw();
    }

    UserInterface.prototype.convertToshape = function (grid, data) {


        var csv = [];

        data = data.split("},");

        for (var x = 0; x < data.length; x++) {
            var str = data[x].replace(/\{|\}/g, '');
            str = str.split(",");

            for (var y = 0; y < str.length; y++) {

                var temp = Number(str[y]);

                csv.push(temp);

            }
        }


        var self = this;
        var colors = [[255, 0, 0], [255, 255, 0], [0, 255, 0]];

        var rightIndex = 94;
        var topIndex = 85;

        for (var x = 0; x < grid.renderables.length; x++) {

            topIndex--;

            if(topIndex==0){
                topIndex=84;
                rightIndex--;
            }

            var r = grid.renderables[(94 * topIndex) - rightIndex];

            r.pathType = WorldWind.LINEAR;
            r.maximumNumEdgeIntervals = 1;
            var value = csv[x];
            if (!self.map[value]) {
                var col = geojson.getColor(((value - 0) / (100 - 0)) * 100, colors);
                col = WorldWind.Color.colorFromBytes(col[0], col[1], col[2], col[3]);
                self.map[value] = col;
            }
            r._attributes._interiorColor = self.map[value];

        }

        grid.enabled = true;
        wwd.redraw();
    };
    return UserInterface
})
;