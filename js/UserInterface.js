define(function () {
        "use strict";

        var UserInterface = function (layerManager, geojson) {
            this.layerManager = layerManager;
            this.geojson=geojson;

        };


        UserInterface.prototype.listeners = function() {
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

                /**/
                /* Transform the binary octet stream to a png image */
                /**/
                var arrayBufferToBase64 = function (arrayBuffer) {
										var base64 = ''
										var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
										var bytes = new Uint8Array(arrayBuffer);
										var byteLength = bytes.byteLength;
										var byteRemainder = byteLength % 3;
										var mainLength = byteLength - byteRemainder;
										var a, b, c, d;
										var chunk;
										// Main loop deals with bytes in chunks of 3
										for (var i = 0; i < mainLength; i = i + 3) {
											// Combine the three bytes into a single integer
											chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]

											// Use bitmasks to extract 6-bit segments from the triplet
											a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
											b = (chunk & 258048) >> 12 // 258048   = (2^6 - 1) << 12
											c = (chunk & 4032) >> 6 // 4032     = (2^6 - 1) << 6
											d = chunk & 63               // 63       = 2^6 - 1

											// Convert the raw binary segments to the appropriate ASCII encoding
											base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
										}

										// Deal with the remaining bytes and padding
										if (byteRemainder == 1) {
											chunk = bytes[mainLength]

											a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2

											// Set the 4 least significant bits to zero
											b = (chunk & 3) << 4 // 3   = 2^2 - 1

											base64 += encodings[a] + encodings[b] + '=='
										} else if (byteRemainder == 2) {
											chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]

											a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
											b = (chunk & 1008) >> 4 // 1008  = (2^6 - 1) << 4

											// Set the 2 least significant bits to zero
											c = (chunk & 15) << 2 // 15    = 2^4 - 1

											base64 += encodings[a] + encodings[b] + encodings[c] + '='
										}

										return base64
									};

                  /**/
                  /* Going with an XMLHttpRequest */
                  /**/
									var xhr = new XMLHttpRequest();
									xhr.open('POST', "http://131.175.143.84/rasdaman74/ows/wcps", true);
									xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
									xhr.responseType = 'arraybuffer';
									xhr.onload = function (event) {
										var responseArray = arrayBufferToBase64(this.response);
										console.log(responseArray)

									  // THIS fail the image is not found 404
                    var surfaceImageLayer = new WorldWind.RenderableLayer();
                    surfaceImageLayer.displayName = "Rasdaman Coverage";
                    surfaceImageLayer.addRenderable(new WorldWind.SurfaceImage(new WorldWind.Sector(-90, 90, -180, 180), '<img src="data:image/png;base64,'+responseArray+'"></img>')); //milano
                    wwd.addLayer(surfaceImageLayer);
                    wwd.redraw();
                    // Simple example adding the image to a div - this works correctly
                    $('#wcpsimage').html('<img src="data:image/png;base64,'+responseArray+'"></img>');
								}

								xhr.send('xml=<?xml version="1.0" encoding="UTF-8" ?><ProcessCoveragesRequest xmlns="http://www.opengis.net/wcps/1.0" service="WCPS" version="1.0.0">  <query>    <abstractSyntax>      for f in (Nhigh_schools_200) return encode( f*200,  "png")    </abstractSyntax>  </query></ProcessCoveragesRequest>');

                /**/
                /* The ajax response is composed by PNG chunks and is not usable */
                /**/
									// $.ajax({
									// 	type: "POST",
									// 	url: "http://131.175.143.84/rasdaman74/ows/wcps",
									// 	data: {query:'for f in (Narea_cani_double_20), i in (Naree_verdi_double) return encode( switch case (f*0.2+i*0.5) = 1 return {red: 255; green: 255; blue: 255} case 0.7 > (f*0.2+i*0.5) return {red: 0; green: 0; blue: 255} case 0.5 > (f*0.2+i*0.5) return {red: 255; green: 255; blue: 0} case 0.2 > (f*0.2+i*0.5)  return {red: 255; green: 140; blue: 0} default return {red: 255; green: 0; blue: 0},  "png")'},
									// 	success: function(data, textStatus, jqXHR)
									// 	{
			            //     addLayer(jqXHR.responseText)
									// 	},
                  //
									// });


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
        return UserInterface
    });
