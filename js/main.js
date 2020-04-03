//Coded by Zoey Colglazier, April 2020
(function(){
  var attrArray =["Total Population in Poverty", "Total - Male", "Total - Female", "Total - Under 18 years", "Total - 18-64 years", "Total - 65 years and over"];
  var expressed = attrArray[0];

  window.onload = setMap();

function setMap(){
    var width = 1000,
        height = 500;

    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    var projection = d3.geoAlbers()
        .center([0, 41])
        .rotate([90, -4, 0])
        .parallels([25, 46.00])
        .scale(5000)
        .translate([width / 2, height / 2]);

    var path = d3.geoPath()
        .projection(projection);

    var promises = [];
    promises.push(d3.csv("data/data_cleaned.csv"));
    promises.push(d3.json("data/WI_correct.json"));
    Promise.all(promises).then(callback);

    function callback(data){
        csvData = data[0];
        counties = data[1];
        var wicounties = topojson.feature(counties, counties.objects.WI_correct).features;
        var colorScale = setColorScale(csvData);
        //console.log(wicounties)
        setGraticule(map,path);
        setEnumUnits(wicounties, map, path, colorScale);
    };
    function setColorScale(data){
        var colorClasses = [
          "#D4B9DA",
          "#C994C7",
          "#DF65B0",
          "#DD1C77",
          "#980043"
        ];
        var colorScale = d3.scaleThreshold()
          .range(colorClasses);
        var domainArray = [];
        for (var i=0; i<data.length; i++){
          var val = parseFloat(data[i][expressed]);
          domainArray.push(val);
        };
        var clusters = ss.ckmeans(domainArray, 5);
        domainArray = clusters.map(function(d){
          return d3.min(d);
        });
        domainArray.shift();
        colorScale.domain(domainArray);
        return colorScale;
    };

    function setGraticule(map, path){
        var graticule = d3.geoGraticule()
          .step([5, 5])

        var gratBackground = map.append("path")
          .datum(graticule.outline())
          .attr("class", "gratBackground")
          .attr("d", path)

        var gratLines = map.selectAll(".gratLines")
          .data(graticule.lines())
          .enter()
          .append("path")
          .attr("class", "gratLines")
          .attr("d", path);
      };

      function setEnumUnits(wicounties, map, path){
        var county = map.selectAll(".counties")
            .data(wicounties)
            .enter()
            .append("path")
            .attr("class", function(d){
              return "counties " + d.properties.COUNTY_NAM;
              })
            .attr("d", path);
      };
};

})();
//setMap()
