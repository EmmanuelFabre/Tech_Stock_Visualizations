// set the dimensions and margins of the graph
var margin = {top: 50, right: 30, bottom: 90, left: 90},
    width = 860 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3
  .select(".myViz")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);


var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);


//Read the data from the csv
d3.csv('trade.csv').then(data => {

  console.log(data);
  //console.log(data[0].Trading_Date)
  //Parse the dates for the X axis
  var parseTime = d3.timeParse("%m\/%d\/%y");

  data.forEach(d => {
  //Parse the data
  //format the data to convert to numerical and date values
  //==========================================
  d.Trading_Date = parseTime(d.Trading_Date);
  d.Trading_Volume = +d.Trading_Volume;
  });

  console.log(data[0].Trading_Date)
  console.log(d3.extent(data, d => d.Trading_Date));


    // List of groups (here I have one group per column)
    var allGroup = d3.map(data, function(d){return(d.Ticker)}).keys();
   

    // add the options to the button
    d3.select("#selectButton")
      .selectAll('myOptions')
     	.data(allGroup)
      .enter()
    	.append('option')
      .text(function (d) { return d; }) // text showed in the menu
      .attr("value", function (d) { return d; }); // corresponding value returned by the button

    // A color scale: one color for each group
     var myColor = d3.scaleOrdinal()
       .domain(allGroup)
       .range(d3.schemeSet2);
      

    // Add X axis --> it is a date format
    var x = d3.scaleTime()
      .domain(d3.extent(data, d => d.Trading_Date))
      .range([ 0, width]);

    chartGroup.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    
    // Add Y axis
    var y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.Trading_Volume)])
      .range([ height, 0 ]);

    chartGroup.append("g")
      .call(d3.axisLeft(y));

    // Initialize line with first group of the list
    var line = svg
      .append('g')
      .append("path")
        .datum(data.filter(d => d.Ticker==allGroup[0]))
        .attr("d", d3.line()
          .x(function(d) { return x(d.Trading_Date) + margin.left })
          .y(function(d) { return y(d.Trading_Volume) })
        )
        .attr("stroke", function(d){ return myColor("value") })      
        .style("stroke-width", 2)
        .style("fill", "none")
        .style("stroke", "blue");

    // A function to update the chart based on filter button choice
    function update(selectedGroup) {

      console.log("update function works");

      // Create new data with the selection
      var dataFilter = data.filter(function(d){return d.Ticker==selectedGroup});

      // Update line with the new data
      line
          .datum(dataFilter)
          .transition()
          .duration(1000)
          .attr("d", d3.line()
            .x(function(d) { return x(d.Trading_Date) + margin.left})
            .y(function(d) { return y(d.Trading_Volume) })
          )
          .style("stroke", function(d){ return myColor(selectedGroup)});
    }

    // When the button is changed, run the updateChart function
    d3.select("#selectButton").on("change", function(d) {
        // recover the option that has been chosen
        var selectedOption = d3.select(this).property("value");
        // run the updateChart function with this selected option
        update(selectedOption);
    })

})