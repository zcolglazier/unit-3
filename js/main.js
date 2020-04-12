//Coded by Zoey Colglazier, April 2020

//The Natural Earth background looks bad, so I'm working on getting a better one that doesn't look like it was traced in crayon

(function(){
  var attrArray =["Total Popu", "Total - Ma", "Total - Fe", "Total - Un", "Total - 18", "Total - 65"];
  var labelArray = ["Total Population", "Total - Male", "Total - Female", "Total - Under 18 years", "Total - 18-64 years", "Total - 65 years and over"]
  var expressed = attrArray[0];
  var chartWidth = window.innerWidth*0.425,
      chartHeight = 473,
      leftPadding = 50,
      rightPadding = 2,
      topBottomPadding = 5,
      chartInnerWidth = chartWidth - leftPadding - rightPadding,
      chartInnerHeight = chartHeight - topBottomPadding * 2,
      translate = "translate(" + leftPadding + "," + topBottomPadding + ")";
  var yScale = d3.scaleLinear()
      .range([chartHeight, 0])
      .domain([0, 1000000
      ]);

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

        // var background_states = map.selectAll(allstates.features)
        //     .data(allstates)
        //     .enter()
        //     .append("path")
        //     .attr("class", "states")
        //     .attr("d", path);
        createDropdown(labelArray);
        var colorScale = setColorScale(wicounties);
        setGraticule(map,path);
        setEnumUnits(wicounties, map, path, colorScale);
        setChart(wicounties, colorScale);
    };

    function createDropdown(wicounties){
        var dropdown = d3.select("body")
            .append("select")
            .attr("class", "dropdown")
            .on("change", function(){
                changeAttribute(this.value, wicounties)
            });
        var attrOptions = dropdown.selectAll("attrOptions")
            .data(labelArray)
            .enter()
            .append("option")
            .attr("value", function(d){ return d })
            .text(function(d){ return d });
    };

    function changeAttribute(attribute, wicounties){
              //correct_index = labelArray.indexOf(attribute);
              //expressed = attrArray[correct_index];
              expressed = attribute
              console.log(expressed)
              console.log(wicounties)
              var colorScale = setColorScale(wicounties);
              var counties = d3.selectAll(".counties")
                  .transition()
                  .duration(1000)
                  .style("fill", function(d){
                      var value = d.properties[expressed];
                      console.log(value)
                      if(value) {
                        return colorScale(value);
                      } else {
                        return "#ccc";
                      }
              });
              var bars = d3.selectAll(".bar")
                  .sort(function(a, b){
                      return b[expressed] - a[expressed];
                  })
                  .transition()
                  .delay(function(d,i){
                    return i*20
                  })
                  .duration(500);
                  updateChart(bars, wicounties.length, colorScale)
      };

    function setColorScale(data){
        console.log("reached color scale")
        //console.log(wicounties)
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
          console.log(expressed)
          console.log(data[i].properties[expressed])
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
              highlight(d.properties);
            })
            .on("mousemove", moveLabel);
        var desc = regions.append("desc")
            .text('{"stroke": "#000", "stroke-width": "0.5px"}');
      };

      function dehighlight(props){
          var selected = d3.selectAll("." + props.COUNTY_NAM)
              .style("stroke", function(){
                  return getStyle(this, "stroke")
              })
              .style("stroke-width", function(){
                  return getStyle(this, "stroke-width")
              })
          d3.select(."infolabel")
              .remove();

          function getStyle(element, styleName){
              var styleText = d3.select(element)
                  .select("desc")
                  .text();

              var styleObject = JSON.parse(styleText);

              return styleObject[styleName];
          };
      };

      function moveLabel(){
          var x = d3.event.clientX + 10,
              y = d3.event.clientY - 75;

          d3.select(".infolabel")
              .style("left", x + "px")
              .style("top", y + "px");
      };

      function setLabel(props){
          var labelAttribute = "<h1>" + props[expressed] +
              "</h1><b>" + expressed + "</b>";
          var infolabel = d3.select("body")
              .append("div")
              .attr("class", "infolabel")
              .attr("id", props.COUNT_NAM + "_label")
              .html(labelAttribute);
          var regionName = infolabel.append("div")
              .attr("class", "labelname")
              .html(props.name);
      };

      function setChart(wicounties, colorScale){
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
            .data(wicounties)
            .enter()
            .append("rect")
            .sort(function(a, b){
                return b.properties[expressed]-a.properties[expressed]
            })
            .attr("class", function(d){
                return "bar" + d.properties.COUNTY_NAM;
            })
            .attr("width", chartWidth / wicounties.length - 1);
            .on("mouseover", hightlight);
            .on("mouseout", dehighlight);
            .on("mousemove", moveLabel);

       var desc = bars.append("desc")
            .text('{"stroke": "none", "stroke-width": "0px"}');

        var chartTitle = chart.append("text")
            .attr("x", 60)
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

        updateChart(bars, wicounties.length, colorScale);
      };
      function updateChart(bars, n, colorScale){
        bars.attr("x", function(d, i){
            return i * (chartInnerWidth / n) + leftPadding;
        })
        //size/resize bars
        .attr("height", function(d, i){
          value = d.properties[expressed]
          if(value){
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
        })
        var chartTitle = d3.select(".chartTitle")
        var index = labelArray.indexOf(expressed)
          .text(labelArray[index] + " in each region");
      };
  function highlight(props){
        var selected = d3.selectAll("." + props.COUNTY_NAM)
            .style("stroke", "blue")
            .style("stroke-width", "2");
        setLabel(props)
      };
};

})();
//setMap()
