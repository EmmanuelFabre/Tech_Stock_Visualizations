//closing by date, filter & tooltip 


var margin = {top: 20, right: 10, bottom: 90, left: 100},  //50
    width = 800 - margin.left - margin.right,            //860
    height = 600 - margin.top - margin.bottom;            //800

// append svg

var svg = d3
  .select("#nicViz")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);
  //.call(d3.zoom().on("zoom", function(){
    //svg.attr("transform", d3.event.transform)
  //}))
  //.append("g"); 
  

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`)
  


//datafeed
d3.csv('trade.csv').then(data => {
  console.log(data);
  console.log(data[0].Trading_Date)

  var parseTime = d3.timeParse("%m\/%d\/%y");
  ////// handle droplines 
  const bisectDate = d3.bisector(d => d.Trading_Date).left;
  const formatValue = d3.format(",.2f");
  const formatCurrency = d => `$${formatValue(d)}`;
  const yAxisTickFormat = number => d3.format("($.2f")(number);

//convert to dates & integers
  data.forEach(d => {
  d.Trading_Date = parseTime(d.Trading_Date);
  d.Close_Price = +d.Close_Price; 
  d.Open_Price = +d.Open_Price;
  d.Trading_Volume = +d.Trading_Volume; 
  d.Lowest_Price = +d.Lowest_Price;
  d.Higest_Price = +d.Higest_Price; 
  }); 

  //log to console
  console.log(data[0].Trading_Date)
  console.log(d3.extent(data, d => d.Trading_Date)); 

// filter by Ticker 
    var tickerFilter = d3.map(data, function(d){return(d.Ticker)}).keys();
    console.log(tickerFilter);  

    //filter button 
    d3.select("#selectButton")
      .selectAll('myOptions')
     	.data(tickerFilter)
      .enter()
    	.append('option')
      .text(function (d) { return d; }) 
      .attr("value", function (d) { return d; })
      .style("stroke", "blue");

    // Common color scale
     var customColor = d3.scaleOrdinal()
       .domain(tickerFilter)
       .range(d3.schemeSet2);


      //extablish scales x = time y = $ 
    var x = d3.scaleTime()
      .domain(d3.extent(data, d => d.Trading_Date))
      .range([ 0, width]);
      //set the x axis (bottom)
    chartGroup.append("g")
      .attr("transform", "translate(0," + height + ")")
      .style("shape-rendering", "crispEdges")
      .call(d3.axisBottom(x));
      
      //yscale (linear)
    var y = d3.scaleLinear()
      .domain([d3.min(data, d => d.Close_Price), d3.max(data, d => d.Close_Price)])  // starting value for Y axis to be min value 
      .range([ height, 0 ]);
      //set the y axis (left)
    chartGroup.append("g")
      .style("shape-rendering", "crispEdges")
      .call(d3.axisLeft(y).tickFormat(yAxisTickFormat).tickSize(-innerWidth)); 

    chartGroup.append('text')
      .attr("y", -5)
     

      //plot area
    var line1 = svg  
      .append('g')
      .append("path")
        .datum(data.filter(d => d.Ticker==tickerFilter[1]))
        .attr("d", d3.line()
          .x(function(d) { return x(d.Trading_Date) + margin.left })
          .y(function(d) { return y(d.Close_Price)}))
        .attr("stroke", function(d){ return customColor("value") })
        .style("stroke-width", 1) 
        .style("stroke", "green");

     

    ///styling elements
    const focus = svg.append("g")
      .attr("class", "focus")
      .style("display", "none"); 
    focus.append('circle')
      .attr('r', 2.5);
    focus.append('line')
      .classed('x', true); 
    focus.append('line')
      .classed('y', true); 
    focus.append('text')
      .attr('x', 6)
      .attr('dy', '.35em');

    ///outside border
    svg.append('rect')
      .attr('class', 'overlay')
      .attr('width', 1000) //using width variable gives wrong size
      .attr('height', 1000) //using width variables gives wrong size
      .on('mouseover', () => focus.style('display', null))
      .on('mouseout', () => focus.style('display', 'none'))
      .on('mousemove', mousemove); 

    d3.selectAll('.line')
      .style("fill", "none")   //changed formatting 
      .style('pointer-events', 'all'); //changed formatting 
    d3.select('.overlay')
      .style("fill", "none") 
      .style("stroke", "black");
    d3.selectAll('.focus')
      .style('opacity', 1.0); 

    d3.selectAll('.focus circle')
      .style("fill", "none")
      .style("stroke", "black"); 
    d3.selectAll('.focus line')
      .style("fill", "none")
      .style("stroke", "black")
      .style("stroke-width", "1.5px")
      .style("stroke-dasharray", "3 3");

      //mousemove interactive mouse point with dropdown 
      function mousemove(){
        const x0 = x.invert(d3.mouse(this)[0]);
      const i = bisectDate(data, x0, 1);
      const d0 = data[i - 1];
      const d1 = data[i];
      const d = x0 - d0.Trading_Date > d1.Trading_Date - x0 ? d1 : d0;
      focus.attr('transform', `translate(${x(d.Trading_Date)}, ${y(d.Close_Price)})`);
      focus.select('line.x')
        .attr('x1', 0)
        .attr('x2', -x(d.Trading_Date))
        .attr('y1', 0)
        .attr('y2', 0);

      focus.select('line.y')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', 0)
        .attr('y2', height - y(d.Close_Price));

      focus.select('text').text(formatCurrency(d.Close_Price));
      }
    function type(d){
        d.Trading_Date = parseTime(d.Trading_Date);
        d.Close_Price = +d.Close_Price;
        return d;
    }
    // A function that updates the chart
    function update(selectedGroup) {
      console.log("select");
      var dataFilter = data.filter(function(d){return d.Ticker==selectedGroup});

      
      line1  
          .datum(dataFilter)
          .transition()
          .duration(500)   
          .attr("d", d3.line()
            .x(function(d) { return x(d.Trading_Date) + margin.left})
            .y(function(d) { return y(d.Close_Price) })
          )
          .style("stroke", function(d){ return customColor(selectedGroup)}); 
    }
    // When the button is changed, run the updateChart function
    d3.select("#selectButton").on("change", function(d) {
        // recover the option that has been chosen
        var selectedOption = d3.select(this).property("value");
        // run the updateChart function with this selected option
        update(selectedOption);
    })
  });