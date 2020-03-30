//Coded by Zoey Colglazier, March 2020

function setMap(){

    //map frame dimensions
    var width = 1000,
        height = 500;

    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    var projection = d3.geoAlbers()
        .center([0, 40.87])
        .rotate([79.18, 0, 0])
        .parallels([26.09, 47.14])
        .scale(100)
        .translate([width / 2, height / 2]);

    var path = d3.geoPath()
        .projection(projection);

    var promises = [];
    promises.push(d3.csv("data/data_cleaned.csv"));
    promises.push(d3.json("data/WI_withall.json"));
    Promise.all(promises).then(callback);

    function callback(data){
        csvData = data[0];
        counties = data[1];
        //console.log(counties)
        var wicounties = topojson.feature(counties, counties.objects.WI_withall).features;
        console.log(wicounties)
        console.log("here")
        // var wis = map.append("path")
        //     .data(wicounties)
        //     .enter()
        //     .append("path")
        //     .attr("class", function(d){
        //       return "counties " + d.COUNTY_NAM;
        //       })
        //     .attr("d", path);
        var county = map.selectAll(".counties")
            .data(wicounties)
            .enter()
            .append("path")
            .attr("class", function(d){
              return "counties " + d.properties.COUNTY_NAM;
              })
            .attr("d", path);
        //console.log(csvData)
        //console.log(regions)
        console.log(county);
    };
};

setMap()

// var container = d3.select("body")
//     .append("svg")
//     .attr("class", "container")
//     .attr("width", 900)
//     .attr("height", 500)
//     .style("background-color", "rgba(0,0,0,0.2)")
//
//     //build the smaller inner svg
//     var innerRect = container.append("rect")
//             .datum(400)
//             .attr("width", function(d){
//                 return d * 2;
//             })
//             .attr("height", function(d){
//                 return d;
//             })
//
//             .attr("class", "innerRect")
//             .attr("x", 50)
//             .attr("y", 50)
//             .style("fill", "#FFFFFF");
//
//     //Define my array of data
//     var dataArray = [
//         {
//         city: 'Madison',
//         population: 233209
//         },
//         {
//         city: 'Milwaukee',
//         population: 594833
//         },
//         {
//         city: 'Green Bay',
//         population: 104057
//         },
//         {
//         city: 'Superior',
//         population: 27244
//         }
//         ];
//
//       //scales - to calculate the linear scale for x and y, the min and max of my data set, and the color ramp
//       var x = d3.scaleLinear()
//           .range([90, 750])
//           .domain([0, 3]);
//
//       var minPop = d3.min(dataArray, function(d){
//           return d.population;
//           });
//
//       var maxPop = d3.max(dataArray, function(d){
//           return d.population;
//           });
//
//       var y = d3.scaleLinear()
//           .range([450, 50])
//           .domain([0, 700000]);
//
//       var yAxis = d3.axisLeft(y);
//           //console.log(yAxis)
//           //create axis g element and add axis
//       var axis = container.append("g")
//           .attr("class", "axis")
//           .attr("transform", "translate(50, 0)")
//           .call(yAxis);
//
//       var title = container.append("text")
//           .attr("class", "title")
//           .attr("text-anchor", "middle")
//           .attr("x", 450)
//           .attr("y", 30)
//           .text("City Populations");
//
//       var labels = container.selectAll(".labels")
//           .data(dataArray)
//           .enter()
//           .append("text")
//           .attr("class", "labels")
//           .attr("text-anchor", "left")
//           .attr("y", function(d){
//                      //vertical position centered on each circle
//               return y(d.population);
//           });
//
//       var nameLine = labels.append("tspan")
//           .attr("class", "nameLine")
//           .attr("x", function(d,i){
//                      //horizontal position to the right of each circle
//               return x(i) + Math.sqrt(d.population * 0.01 / Math.PI) + 5;
//             })
//           .text(function(d){
//               return d.city;
//           });
//
//       var format = d3.format(",");
//              //second line of label
//       var popLine = labels.append("tspan")
//           .attr("class", "popLine")
//           .attr("x", function(d,i){
//                      //horizontal position to the right of each circle
//               return x(i) + Math.sqrt(d.population * 0.01 / Math.PI) + 5;
//           })
//           .attr("dy", "15")
//           .text(function(d){
//               return "Pop. " + format(d.population);
//           });
//
//       var color = d3.scaleLinear()
//           .range([
//               "#D3BDFE",
//               "#5703FD"
//           ])
//           .domain([
//               minPop,
//               maxPop
//           ]);
//
//       //building the circle svgs for each datum
//       var circles = container.selectAll(".circles")
//           .data(dataArray)
//           .enter()
//           .append("circle")
//           .attr("class", "circles")
//           .attr("id", function(d){
//             return d.city;
//           })
//           .attr("r", function(d){
//               var area = d.population * 0.01;
//               return Math.sqrt(area/Math.PI);
//           })
//           .attr("cx", function(d, i){
//             return x(i);
//           })
//           .attr("cy", function(d){
//               return y(d.population)
//           })
//           .style("fill", function(d, i){
//               return color(d.population);
//           })
//           .style("stroke", "#000");
