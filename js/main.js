var container = d3.select("body") //get the <body> element from the DOM
    .append("svg") //put a new svg in the body
    .attr("class", "container") //assign a class name
    .attr("width", 900)
    .attr("height", 500)
    .style("background-color", "rgba(0,0,0,0.2)") //svg background color

    var innerRect = container.append("rect") //put a new rect in the svg
            .datum(400) //a single value is a datum
            .attr("width", function(d){ //rectangle width
                return d * 2; //400 * 2 = 800
            })
            .attr("height", function(d){ //rectangle height
                return d; //400
            })

            .attr("class", "innerRect") //class name
            .attr("x", 50) //position from left on the x (horizontal) axis
            .attr("y", 50) //position from top on the y (vertical) axis
            .style("fill", "#FFFFFF"); //fill color
