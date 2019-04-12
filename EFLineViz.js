// set the dimensions and margins of the graph
var margin = {top: 50, right: 30, bottom: 90, left: 90},
    width = 860 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3
  .select("#myViz")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);
  //.append("g")
  //  .attr("transform", `translate(${margin.left}, ${margin.top})`);

//Should I create a 'chartGroup' ? To do so, comment out ln 11/12 from svg and put it in chartGroup

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);


//Read the data
//d3.csv('trade.csv', function(data) {
d3.csv('trade.csv').then(data => {

  console.log(data);

  console.log(data[0].Trading_Date)
  var parseTime = d3.timeParse("%m\/%d\/%y");
 // const tParser = d3.timeParse("%d/%m/%Y");
 // const date = tParser(data.Trading_Date);

  data.forEach(d => {
  //Parse the data
  //format the data to convert to numerical and date values
  //==========================================
  d.Trading_Date = parseTime(d.Trading_Date);
  //  d.Trading_Date = +d.Trading_Date;                     //do we need to convert date to integer?
  d.Trading_Volume = +d.Trading_Volume;
  //  or data.Trading_Date = d3.parseTime("%d-%b-%y");

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
    // var myColor = d3.scaleSequential()
    //   .domain(allGroup)
    //   .interpolator(d3.interpolateInferno);
      

    // Add X axis --> it is a date format
    var x = d3.scaleTime()
      .domain(d3.extent(data, d => d.Trading_Date))
   //   .domain(["01/01/1998", d3.max(data, d => d.Trading_Date)])
     // .domain(d3.extent(data, function(d) { return +d.Trading_Date; }))
//      .domain(d3.extent(data, d => d.Trading_Date))
      .range([ 0, width]);
//    svg.append("g")
    chartGroup.append("g")
      .attr("transform", "translate(0," + height + ")")
    //  .call(d3.axisBottom(x).ticks(10));
    //  .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%d-%b-%y")));
      .call(d3.axisBottom(x));

    

    // Add Y axis
    var y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.Trading_Volume)])
      .range([ height, 0 ]);
//    svg.append("g")
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
        .attr("stroke", function(d){ return myColor("value") })       //PB seems to do nothing?
    //    .attr("stroke", function(d){ return myColor(d.Ticker) })
        .style("stroke-width", 2)
    //    .style("fill", "none")
        .style("stroke", "blue");

    // A function that updates the chart
    function update(selectedGroup) {

      console.log("update function works");

      // Create new data with the selection?
      var dataFilter = data.filter(function(d){return d.Ticker==selectedGroup});

      // Give these new data to update line
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



//PB with myColor, "ValueA"


