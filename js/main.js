//Coded by Zoey Colglazier, April 2020
(function(){
  var attrArray =["Total Popu", "Total - Male", "Total - Female", "Total - Under 18 years", "Total - 18-64 years", "Total - 65 years and over"];
  var expressed = attrArray[0];
  //console.log(expressed)
  window.onload = setMap();

function setMap(){
    var width = window.innerWidth*0.5,
        height = 460;

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
        var colorScale = setColorScale(wicounties);
        setGraticule(map,path);
        setEnumUnits(wicounties, map, path, colorScale);
        setChart(wicounties, colorScale);
    };
    function setColorScale(data){
        console.log("reached color scale")
        var colorClasses = [
          "#ffffcc",
          "#a1dab4",
          "#41b6c4",
          "#2c7fb8",
          "#253494"
        ];
        var colorScale = d3.scaleThreshold()
          .range(colorClasses);
        var domainArray = [];
        for (var i=0; i<data.length; i++){
          var val = parseFloat(data[i].properties[expressed]);
          console.log(data[i].properties[expressed])
          domainArray.push(val);
        };
        var clusters = ss.ckmeans(domainArray, 5);
        domainArray = clusters.map(function(d){
          return d3.min(d);
        });
        domainArray.shift();
        colorScale.domain(domainArray);
        //console.log(domainArray);
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

      function setEnumUnits(wicounties, map, path, colorScale){
        console.log("coloring")
        var county = map.selectAll(".counties")
            .data(wicounties)
            .enter()
            .append("path")
            .attr("class", function(d){
              return "counties " + d.properties.COUNTY_NAM;
              })
            .attr("d", path)
            .style("fill", function(d){
              console.log(d.properties)
              var value = d.properties[expressed];
              console.log(value)
              if(value) {
                console.log(colorScale(d.properties[expressed]))
                return colorScale(d.properties[expressed]);
              } else{
                return "#ccc";
            }
            });
      };

      function setChart(wicounties, colorScale){
        var chartWidth = window.innerWidth*0.425,
            chartHeight = 460;

        var chart = d3.select("body")
            .append("svg")
            .attr("width", chartWidth)
            .attr("height", chartHeight)
            .attr("class", "chart");

        var yScale = d3.scaleLinear()
            //console.log(chartHeight)
            .range([0, chartHeight])
            .domain([0, d3.max(wicounties, function (d){
              return parseFloat(d.properties[expressed])*1.2
            })]);

        var bars = chart.selectAll(".bars")
            .data(wicounties)
            .enter()
            .append("rect")
            .sort(function(a, b){
                return a[expressed]-b[expressed]
            })
            .attr("class", function(d){
                return "bars" + d.properties.COUNTY_NAM;
            })
            .attr("width", chartWidth / wicounties.length - 1)
            .attr("x", function(d, i){
                return i*(chartWidth/wicounties.length);
            })
            .attr("height", function(d){
                //console.log(expressed)
                //console.log("look here")
                //console.log(d.properties)
                //console.log(expressed)
                //console.log(d.properties["Total Popu"])
                //console.log(yScale(parseFloat(d.properties[expressed])))
                return yScale(parseFloat(d.properties[expressed]));
            })
            .attr("y", function(d){
              return chartHeight - yScale(parseFloat(d.properties[expressed]));
            })
            .style("fill", function(d){
                return colorScale(d.properties[expressed]);
            });

        var numbers = chart.selectAll(".numbers")
            .data(wicounties)
            .enter()
            .append("text")
            .sort(function(a, b){
                //console.log(a[expressed]-b[expressed])
                return a[expressed]-b[expressed]
            })
            .attr("class", function(d){
                return "numbers " + d.COUNTY_NAM;
            })
            .attr("text-anchor", "middle")
            .attr("x", function(d, i){
                var fraction = chartWidth / wicounties.length;
                return i * fraction + (fraction - 1) / 2;
            })
            .attr("y", function(d){
                console.log(d.properties[expressed])
                console.log(yScale(parseFloat(d.properties[expressed])))
                return chartHeight - yScale(parseFloat(d.properties[expressed])) + 15;
            })
            .text(function(d){
                return d.properties[expressed];
            });

        var chartTitle = chart.append("text")
            .attr("x", 20)
            .attr("y", 40)
            .attr("class", "chartTitle")
            .text(attrArray[0] + " in each county");
      };
};

})();
//setMap()
