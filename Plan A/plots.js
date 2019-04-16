
/**
 * Helper function to select stock data
 * Returns an array of values
 * @param {array} rows
 * @param {integer} index
 * index 0 - Date
 * index 1 - Open
 * index 2 - High
 * index 3 - Low
 * index 4 - Close
 */
function unpack(rows, index) {
  return rows.map(function(row) {
    return row[index];
  });
}

// Submit Button handler
function handleSubmit() {
  // @TODO: YOUR CODE HERE
  // Prevent the page from refreshing
  d3.event.preventDefault();
  var stock = d3.select('#stockInput').node().value;
  var stock2 = d3.select('#stockInput2').node().value;
  console.log(stock);
  console.log(stock2);
  // Select the input value from the form
  // clear the input value
  d3.select('#stockInput').node().value= "";
  d3.select('#stockInput2').node().value= "";
  // Build the plot with the new stock
  buildPlot(stock,stock2);
}

function buildPlot(stock,stock2) {
  var apiKey = "ozRbQvtaXCBaRykuuoDf";
  console.log(stock);
  console.log(stock2);

  var url = `https://www.quandl.com/api/v3/datasets/WIKI/${stock}.json?start_date=2012-01-01&end_date=2018-12-31&api_key=${apiKey}`;
  var url2 = `https://www.quandl.com/api/v3/datasets/WIKI/${stock2}.json?start_date=2012-01-01&end_date=2018-12-31&api_key=${apiKey}`;

  // d3.json(url).then(function(d1) {
  //   console.log(d1);
  //   url1Data = d1;
  // });

  function handleTrace(data){
    var parseTime = d3.timeParse("%Y-%m-%d")

    var name = data.dataset.name;
    var date = unpack(data.dataset.data, 0);
    var closingPrices = unpack(data.dataset.data, 4);

    date.forEach(d =>{
      d = parseTime(d)
    }
      );

    var trace = {
      type: "scatter",
      mode: "lines",
      name: name,
      x: date,
      y: closingPrices,
    };
    return trace
  }

  var promise1 = d3.json(url);
  var promise2 = d3.json(url2);

  console.log(promise1);
  console.log(promise2);
  
  Promise.all([promise1,promise2]).then(promises => {
    data1 = promises[0];
    data2 = promises[1];
    console.log(data2);

    trace1 = handleTrace(data1);
    trace2 = handleTrace(data2);


  var data = [trace1,trace2];
  //var data = [trace1];

  var layout = {
    title: `${stock} vs ${stock2}`,
    xaxis: {
      type: "date"
    },
    yaxis: {
      autorange: true,
      type: "linear"
    }
  };

  Plotly.newPlot("plot", data, layout);
    
  });

}

// Add event listener for submit button
// @TODO: YOUR CODE HERE
d3.select('#submit').on('click', handleSubmit);