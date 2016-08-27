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


            allValues = [['Ncafe_200', 50], ['Natms_200', 50], ['Nhigh_schools_200', 80]];
            var letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r'];
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


            //var query = 'for c in (Ncafe_200), i in (Natms_200), e in (Nhigh_schools_200) ' +
            // 'return encode( (c*50 + i * 50 + e*50) ,"csv" ) )';
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

        var grid = this.geojson.grid;
        this.convertToshape(grid, request);
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

            if (topIndex == 0) {
                topIndex = 84;
                rightIndex--;
            }

            var r = grid.renderables[(94 * topIndex) - rightIndex];

            r.pathType = WorldWind.LINEAR;
            r.maximumNumEdgeIntervals = 1;
            var value = csv[x];
            if (!self.map[value]) {

                var col = geojson.getColor(((value - 0) / (100 - 0)) * 100, colors);
                if (value == 0) {
                    col = WorldWind.Color.colorFromBytes(col[0], col[1], col[2], 0);
                } else {
                    col = WorldWind.Color.colorFromBytes(col[0], col[1], col[2], 60);
                }
                self.map[value] = col;
            }
            r._attributes._interiorColor = self.map[value];

        }
        //bbox= xMin, yMin 9.03832,45.3854 : xMax,yMax 9.27921,45.5369

        grid.enabled = true;
        geojson.layerManager.synchronizeLayerList();
    };
    return UserInterface
})
;