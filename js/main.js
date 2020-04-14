//Coded by Zoey Colglazier, April 2020

//The Natural Earth background looks bad, so I'm working on getting a better one that doesn't look like it was traced in crayon

(function(){
  var attrArray =["Total Popu", "Total - Ma", "Total - Fe", "Total - Un", "Total - 18", "Total - 65"];
  var labelArray = ["Total Population", "Total - Male", "Total - Female", "Total - Under 18 years", "Total - 18-64 years", "Total - 65 years and over"]
  var expressed = attrArray[0];
  var chartWidth = window.innerWidth*0.475,
      chartHeight = 473,
      leftPadding = 50,
      rightPadding = 2,
      topBottomPadding = 5,
      chartInnerWidth = chartWidth - leftPadding - rightPadding,
      chartInnerHeight = chartHeight - topBottomPadding * 2,
      translate = "translate(" + leftPadding + "," + topBottomPadding + ")";
  var yScale;

  window.onload = setMap();

function setMap(){
    var width = window.innerWidth*0.45,
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
    promises.push(d3.json("data/actual_states.json"));
    Promise.all(promises).then(callback);

    function callback(data){
        csvData = data[0];
        counties = data[1];
        states = data[2];
        //console.log(states)
        var wicounties = topojson.feature(counties, counties.objects.WI_correct).features;
        var allstates = topojson.feature(states, states.objects.actual_states).features;

        var countiesWithData = wicounties.filter(county=>county.properties[expressed]);

        var background_states = map.selectAll(allstates.features)
            .data(allstates)
            .enter()
            .append("path")
            .attr("class", "states")
            .attr("d", path);
        createDropdown(countiesWithData);
        var colorScale = setColorScale(wicounties);
        //setGraticule(map,path);
        setEnumUnits(wicounties, map, path, colorScale);
        setChart(countiesWithData, colorScale);
    };

    function createDropdown(countiesWithData){
        var dropdown = d3.select("body")
            .append("select")
            .attr("class", "dropdown")
            .on("change", function(){
                changeAttribute(this.value, countiesWithData)
            });
        var attrOptions = dropdown.selectAll("attrOptions")
            .data(labelArray)
            .enter()
            .append("option")
            .attr("value", function(d){ return d })
            .text(function(d){ return d });
    };

    function changeAttribute(attribute, countiesWithData){
              correct_index = labelArray.indexOf(attribute);
              expressed = attrArray[correct_index];
              //hold = 0
              var colorScale = setColorScale(countiesWithData);
              var counties = d3.selectAll(".counties")
                  .transition()
                  .duration(1000)
                  .style("fill", function(d){
                      var value = d.properties[expressed];
                      //console.log(value)
                      if(value) {
                        return colorScale(value);
                      } else {
                        return "#ccc";
                      }
              });
              var bars = d3.selectAll(".bar")
                  .sort(function(a, b){
                      return b.properties[expressed] - a.properties[expressed];
                  })
                  .transition()
                  .delay(function(d,i){
                    return i*20
                  })
                  .duration(500);
              console.log("made it")
              updateChart(bars, countiesWithData.length, colorScale, countiesWithData)
      };

    function setColorScale(data){
        //console.log("reached color scale")
        //console.log(data)
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
          //console.log(expressed)
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
            })
            .on("mouseover", function(d){
              highlight(d.properties);
            })
            .on("mouseout", function(d){
              dehighlight(d.properties);
            })
            .on("mousemove", moveLabel);
        var desc = county.append("desc")
            .text('{"stroke": "#000", "stroke-width": "0.5px"}');
      };

      function dehighlight(props){
          //console.log("inside deh")
          var selected = d3.selectAll("." + props.COUNTY_NAM)
              .style("stroke", function(){
                  return getStyle(this, "stroke")
              })
              .style("stroke-width", function(){
                  return getStyle(this, "stroke-width")
              });
          //console.log("reached getstyle")
      function getStyle(element, styleName){
          var styleText = d3.select(element)
              .select("desc")
              .text();

          var styleObject = JSON.parse(styleText);
            return styleObject[styleName];
          };

      d3.select(".infolabel")
          .remove();
      };

      function moveLabel(){
          var labelWidth = d3.select(".infolabel")
              .node()
              .getBoundingClientRect()
              .width;

          var x1 = d3.event.clientX + 10,
              y1 = d3.event.clientY - 75,
              x2 = d3.event.clientX - labelWidth - 10,
              y2 = d3.event.clientY + 25;

          var x = d3.event.clientX > window.innerWidth - labelWidth - 20 ? x2 : x1;

          var y = d3.event.clientY < 75 ? y2 : y1;

          d3.select(".infolabel")
              .style("left", x + "px")
              .style("top", y + "px");
      };

      function setLabel(props){
          oth_in = attrArray.indexOf(expressed)
          att = labelArray[oth_in]
          var labelAttribute
          if (props[expressed]){
            labelAttribute = "<h1>" + props[expressed] +
                "</h1><b>" + att + "</b>";
          } else {
            labelAttribute = "<h1> No Data </h1>"
          }
          // var labelAttribute = "<h1>" + props[expressed] +
          //     "</h1><b>" + att + "</b>";
          var infolabel = d3.select("body")
              .append("div")
              .attr("class", "infolabel")
              .attr("id", props.COUNTY_NAM + "_label")
              .html(labelAttribute);
          var countyName = infolabel.append("div")
              .attr("class", "labelname")
              .html(props. COUNTY_NAM);
      };

      function setChart(countiesWithData, colorScale){
        yScale = d3.scaleLog()
            .range([chartHeight, 0])
            .domain([1,
                      d3.max(countiesWithData, function (d) {
                        if (parseFloat(d.properties[expressed])){
                          return (parseFloat(d.properties[expressed])) * 1.1
                        };
                  })]);
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

        var bars = chart.selectAll(".bar")
            .data(countiesWithData)
            .enter()
            .append("rect")
            .sort(function(a, b){
                return b.properties[expressed]-a.properties[expressed]
            })
            .attr("class", function(d){
                return "bar " + d.properties.COUNTY_NAM;
            })
            .attr("width", chartWidth / countiesWithData.length-1)
            .on("mouseover", function(d){
              highlight(d.properties);
            })
            .on("mouseout", function(d){
              dehighlight(d.properties);
            })
            .on("mousemove", moveLabel);

       var desc = bars.append("desc")
            .text('{"stroke": "none", "stroke-width": "0px"}');

        var chartTitle = chart.append("text")
            .attr("x", 100)
            .attr("y", 40)
            .attr("class", "chartTitle")
            .text(labelArray[0]+" in Poverty");

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

        updateChart(bars, countiesWithData.length, colorScale, countiesWithData);
      };


      function updateChart(bars, n, colorScale, wicounties){
        yScale = d3.scaleLog()
            .range([chartHeight, 0])
            .domain([1000,
                      d3.max(wicounties, function (d) {
                        if (parseFloat(d.properties[expressed])){
                          return (parseFloat(d.properties[expressed])) * 1.1
                        };
                  })]);
          bars.attr("x", function(d, i){
              return i * (chartInnerWidth / n) + leftPadding;
            })
            .attr("height", function(d, i){
                value = d.properties[expressed]
                //console.log(value)
                if(value){
                  //console.log(yScale(parseFloat(d.properties[expressed])))
                  return 463 - yScale(parseFloat(d.properties[expressed]))
                }else{
                  return 0
                }
            //return 463 - yScale(parseFloat(d.properties[expressed]));
            })
            .attr("y", function(d, i){
                value = d.properties[expressed]
                if(value){
                  return yScale(parseFloat(d.properties[expressed])) + topBottomPadding;
                }else{
                  return 0
                }
            //return yScale(parseFloat(d.properties[expressed])) + topBottomPadding;
            })
        //color/recolor bars
            .style("fill", function(d){
                var value = d.properties[expressed];
                if(value) {
                  return colorScale(value);
                } else {
                  return "#ccc";
                }
              });
            //console.log(expressed)
            var index = attrArray.indexOf(expressed)
            var chartTitle = d3.select(".chartTitle")
              .text(labelArray[index] + " in Poverty");
            };

  function highlight(props){
        //console.log(props.COUNTY_NAM)
        var selected = d3.selectAll("." + props.COUNTY_NAM)
            .style("stroke", "orange")
            .style("stroke-width", "3");
        setLabel(props)
      };
};

})();
//setMap()
