//Coded by Zoey Colglazier, April 2020
(function(){
  var attrArray =["Total Popu", "Total - Male", "Total - Female", "Total - Under 18 years", "Total - 18-64 years", "Total - 65 years and over"];
  var labelArray = ["Total Population", "Total - Male", "Total - Female", "Total - Under 18 years", "Total - 18-64 years", "Total - 65 years and over"]
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
    promises.push(d3.json("data/corrected_states.json"));
    Promise.all(promises).then(callback);

    function callback(data){
        csvData = data[0];
        counties = data[1];
        states = data[2];
        var wicounties = topojson.feature(counties, counties.objects.WI_correct).features;
        var allstates = topojson.feature(states, states.objects.corrected_states).features;
        // console.log(states)
        // console.log("topo")
        // console.log(allstates)
        var background_states = map.selectAll(allstates.features)

            .data(allstates)
            .enter()
            .append("path")
            .attr("class", "states")
            .attr("d", path);

        var colorScale = setColorScale(wicounties);
        // setGraticule(map,path);
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
          //console.log(data[i].properties[expressed])
          if(val) domainArray.push(val);
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

    // function setGraticule(map, path){
    //     var graticule = d3.geoGraticule()
    //       .step([5, 5])
    //
    //     var gratBackground = map.append("path")
    //       .datum(graticule.outline())
    //       .attr("class", "gratBackground")
    //       .attr("d", path)
    //
    //     var gratLines = map.selectAll(".gratLines")
    //       .data(graticule.lines())
    //       .enter()
    //       .append("path")
    //       .attr("class", "gratLines")
    //       .attr("d", path);
    //   };

      function setEnumUnits(wicounties, map, path, colorScale){
        var county = map.selectAll(".counties")
            .data(wicounties)
            .enter()
            .append("path")
            .attr("class", function(d){
              return "counties " + d.properties.COUNTY_NAM;
              })
            .attr("d", path)
            .style("fill", function(d){
              //console.log(d.properties)
              var value = d.properties[expressed];
              //console.log(value)
              if(value) {
                //console.log(colorScale(d.properties[expressed]))
                return colorScale(d.properties[expressed]);
              } else{
                return "#ccc";
            }
            });
      };

      function setChart(wicounties, colorScale){
        var chartWidth = window.innerWidth*0.425,
            chartHeight = 473,
            leftPadding = 50,
            rightPadding = 2,
            topBottomPadding = 5,
            chartInnerWidth = chartWidth - leftPadding - rightPadding,
            chartInnerHeight = chartHeight - topBottomPadding * 2,
            translate = "translate(" + leftPadding + "," + topBottomPadding + ")";

        var chart = d3.select("body")
            .append("svg")
            .attr("width", chartWidth)
            .attr("height", chartHeight)
            .attr("class", "chart");

        var chartBackground = chart.append("rect")
            .attr("class", "chartBackground")
            .attr("width", chartInnerWidth)
            .attr("height", chartInnerHeight)
            .attr("transform", translate);

        var yScale = d3.scaleLinear()
            //console.log(chartHeight)
            .range([chartHeight, 0])
            .domain([0, d3.max(wicounties, function (d){
              return parseFloat(d.properties[expressed])*1.2
            })]);

        var bars = chart.selectAll(".bars")
            .data(wicounties)
            .enter()
            .append("rect")
            .sort(function(a, b){
                return b.properties[expressed]-a.properties[expressed]
            })
            .attr("class", function(d){
                return "bars" + d.properties.COUNTY_NAM;
            })
            .attr("width", chartWidth / wicounties.length - 1)
            .attr("x", function(d, i){
                return i*(chartWidth/wicounties.length) + leftPadding;
            })
            .attr("height", function(d, i){
                use=d.properties[expressed]
                if (use){
                  return 463- yScale(parseFloat(d.properties[expressed]));
                }else{
                  return 0
                }
            })
            .attr("y", function(d, i){
              use=d.properties[expressed]
              if (use){
                return yScale(parseFloat(d.properties[expressed])) + topBottomPadding;
              }else{
                return 0
              }
            })
            .style("fill", function(d){
              var value = d.properties[expressed];
              if(value) {
                return colorScale(d.properties[expressed]);
              } else{
                return "#ccc";
              }
            });
        var chartTitle = chart.append("text")
            .attr("x", 60)
            .attr("y", 40)
            .attr("class", "chartTitle")
            .text(attrArray[0]+"lation in Poverty");

        var yAxis = d3.axisLeft()
            .scale(yScale);

        var axis = chart.append("g")
            .attr("class", "axis")
            .attr("transform", translate)
            .call(yAxis);

        var chartFrame = chart.append("rect")
            .attr("class", "chartFrame")
            .attr("width", chartInnerWidth)
            .attr("height", chartInnerHeight)
            .attr("transform", translate);
      };
};

})();
//setMap()
