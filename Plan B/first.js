 Plotly.d3.csv("trading_data.csv", function(err, rows){

  function unpack(rows, key) {
  return rows.map(function(row) { return row[key]; 
  });
}

var parseTime = d3.timeParse("%m/%d/%y")

rows.forEach(data =>{
  data.Date = parseTime(data.Date);
  data.AMZN =+data.AMZN;
  data.WMT =+ data.WMT;
});

console.log(unpack(rows, 'AMZN'));
console.log(unpack(rows, 'WMT'));

var trace1 = {
  type: "scatter",
  mode: "lines",
  name: 'AMAZON',
  x: unpack(rows, 'Date'),
  y: unpack(rows, 'AMZN'),
  line: {color: '#17BECF'}
}

var trace2 = {
  type: "scatter",
  mode: "lines",
  name: 'WALMAT',
  x: unpack(rows, 'Date'),
  y: unpack(rows, 'WMT'),
  line: {color: '#7F7F7F'}
}

var data = [trace1,trace2];
    
var layout = {
  title: 'Internet Giant VS Big Box Store', 
  xaxis: {
    autorange: true, 
    range: ['1998-01-02', '2018-12-31'], 
    rangeselector: {buttons: [
        {
          count: 3, 
          label: '3m', 
          step: 'month', 
          stepmode: 'backward'
        }, 
        {
          count: 6, 
          label: '6m', 
          step: 'month', 
          stepmode: 'backward'
        }, 
        {
          count: 12, 
          label: '12m', 
          step: 'month', 
          stepmode: 'backward'
        }, 
        {step: 'all'}
      ]}, 
    rangeslider: {range: ['1998-01-02', '2018-12-31']}, 
    type: 'date'
  }, 
  yaxis: {
    autorange: true, 
    range: [40, 1000], 
    type: 'linear'
  }
};

Plotly.newPlot('myDiv', data, layout);
})