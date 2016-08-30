define(function () {
    "use strict";

    var UserInterface = function (layerManager, geojson) {
        this.layerManager = layerManager;
        this.geojson = geojson;
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
            var val=val.value.newValue;
            self.geojson.grid.opacity=val/10;
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
                }
            });

        });
    };


    UserInterface.prototype.addLayer = function (request) {


        var grid = this.geojson.grid;
        this.convertToshape(grid, request);

       // $("#opacity").show();
        wwd.redraw();
    }

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

            r.pathType = WorldWind.LINEAR;
            r.maximumNumEdgeIntervals = 1;
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
            r._attributes._interiorColor = self.map[value];

        }

        for (var x = 0; x < grid.renderables.length; x++) {
            grid.renderables[x].enabled = true;
        }

        grid.enabled = true;
        grid.opacity=0.5;
        geojson.layerManager.synchronizeLayerList();
    };
    return UserInterface
})
