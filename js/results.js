$(function () {
    $(".slider").slider({
        orientation: "horizontal",
        range: "min",
        max: 100,
        value: 0
    });

    $("#air_slider").slider("value", 255);

});


$("#submitQuery").click(function(){
    var countSlider=46;
    var count=0;
    var idSlider=[];

    $(".name_slider div").each(function(){
        if (count<countSlider && this.id) {
            idSlider.push(this.id);
            count++;
        }
    });

    idSlider.forEach(function(value, x){
        idSlider[x]=[];
        idSlider[x].push(value);
        idSlider[x].push($("#"+value).slider( "option", "value" ));

    });
    console.log(idSlider);

    //query="image>>for c in ( AvgLandTemp ) return encode(coverage myCoverage over $p x(0:100), $q y(0:100) values $p/2+$q/2, "png")"



   // var request = 'http://ows.rasdaman.org/rasdaman/ows?query=' + query;
    //addLayer(request)

});

function addLayer(request){

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
