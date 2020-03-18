var container = d3.select("body")
    .append("svg")
    .attr("class", "container")
    .attr("width", 900)
    .attr("height", 500)
    .style("background-color", "rgba(0,0,0,0.2)")

    var innerRect = container.append("rect")
            .datum(400)
            .attr("width", function(d){
                return d * 2;
            })
            .attr("height", function(d){
                return d;
            })

            .attr("class", "innerRect")
            .attr("x", 50)
            .attr("y", 50)
            .style("fill", "#FFFFFF"); 

    var dataArray = [
        {
          city: 'Madison',
          population: 233209
          },
        {
          city: 'Milwaukee',
          population: 594833
          },
        {
          city: 'Green Bay',
          population: 104057
          }
        ];

      var x = d3.scaleLinear()
          .range([90, 810])
          .domain([0, 3]);

      var minPop = d3.min(dataArray, function(d){
          return d.population;
          });

      var maxPop = d3.max(dataArray, function(d){
          return d.population;
          });

      var y = d3.scaleLinear()
          .range([440, 95])
          .domain([
              minPop,
              maxPop
          ]);

      var circles = container.selectAll(".circles")
          .data(dataArray)
          .enter()
          .append("circle")
          .attr("class", "circles")
          .attr("id", function(d){
            return d.city;
          })
          .attr("r", function(d){
              var area = d.population * 0.01;
              return Math.sqrt(area/Math.PI);
          })
          .attr("cx", function(d, i){
            return x(i);
          })
          .attr("cy", function(d){
              return y(d.population)
          });
