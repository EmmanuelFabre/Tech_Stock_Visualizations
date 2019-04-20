
        height = 600;
        width = 1000;
        margin = ({top: 20, right: 30, bottom: 30, left: 50});
        var parseDate = d3.utcParse("%m/%d/%Y");
        data =  d3.csv("trade.csv",d3.autoType).then((data)=>{
            
            //data = data.map(({date, close}) => ({date, value: close}), {y: "$ Close"});
            
            data = data.map(({Trading_Date,Close_Price,Ticker}) => ({date:Trading_Date, value: Close_Price,Ticker:Ticker}), {y: "$ Close"});
            data = data.filter((d)=>d.date>new Date('2009-01-01'))
            base = data[0].value;
            const tickerArray = data
			.map(d => d.Ticker)
            .filter((value,index,self) => self.indexOf(value) === index);
            //data = data.filter((d)=>{d.date > new Date('2009-01-01')});
            selectValue = "GOOG";
            dataSet = Object.assign(data);
            data = dataSet.filter(function(d){return d.Ticker == selectValue;})
            
            var select = d3.select('body')
            .append('select')
                .attr('class','select')
                .attr("style",'margin-top:'+(height+100))
                .on('change',onchange);
            var options = select
            .selectAll('option')
                .data(tickerArray).enter()
                .append('option')
                    .text(function (d) { return d; });
            renderChart(data);
            function onchange() {
                selectValue = d3.select('select').property('value');
                data = dataSet.filter(function(d){return d.Ticker == selectValue;})
                d3.select("#chart").remove();
                renderChart(data);
            }
            function renderChart(data){
                 // console.log(dataset);
                const tooltip12 = d3.select('#tooltip');
                data = data.filter((d)=>d.date>new Date('2009-01-01'))
                base = data[0].value;
                x = d3.scaleTime()
                    .domain(d3.extent(data, d => d.date))
                    .range([margin.left, width - margin.right]);
                y = d3.scaleLog()
                    .domain([d3.min(data, d => d.value / base * 0.9), d3.max(data, d => d.value / base / 0.9)])
                    .range([height - margin.bottom, margin.top]);
                var xAxis = g => g
                    .attr("transform", `translate(0,${height - margin.bottom})`)
                    .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
                    .call(g => g.select(".domain").remove());
                var yAxis = g => g
                    .attr("transform", `translate(${margin.left},0)`)
                    .call(d3.axisLeft(y)
                        .tickValues(d3.ticks(...y.domain(), 10))
                        .tickFormat(format()))
                    .call(g => g.selectAll(".tick line").clone()
                        .attr("stroke-opacity", d => d === 1 ? null : 0.2)
                        .attr("x2", width - margin.left - margin.right))
                    .call(g => g.select(".domain").remove());
                var format = function(){
                        const f = d3.format("+.0%");
                        return x => x === 1 ? "0%" : f(x - 1);
                }
                var line = d3.line()
                    .x(d => x(d.date))
                    .y(d => y(d.value / base));
                
                var svg = d3
                .select("body")
                .append('div')
                .append("svg")
                .style("-webkit-tap-highlight-color", "transparent")
                .style("overflow", "visible")
                .attr('id','chart')
                .attr("width",width)
                .attr("height", height);
                svg.append("g")
                    .call(xAxis);
                svg.append("g")
                    .call(yAxis);
                
                svg.append("path")
                    .datum(data)
                    .attr("fill", "none")
                    .attr("stroke", "steelblue")
                    .attr("stroke-width", 1.5)
                    .attr("stroke-linejoin", "round")
                    .attr("stroke-linecap", "round")
                    .attr("d", line);
                const tooltip = svg.append("g");
                //svg.call(tooltip);
                    // .on("touchmove mousemove", function(d) {
                    // //const {date, value} = bisect(d3.mouse(this)[0]);
                    
                    //     tooltip
                    //         .attr("transform", `translate(${x(d.date)},${y(d.value)})`)
                    //         .call(callout, `${d.value.toLocaleString(undefined, {style: "currency", currency: "USD"})}
                    // ${d.date.toLocaleString(undefined, {month: "short", day: "numeric", year: "numeric"})}`);
                    // })
                    // .on("touchend mouseleave", () => tooltip.call(callout, null));
                
                svg.on("mousemove", function() {
                    
                    const {date, value} = bisect(d3.mouse(this)[0]);
                    tooltip12.html(`${date.toLocaleString(undefined, {month: "short", day: "numeric", year: "numeric"})}`)
                        .style('display', 'block')
                        .style('left', d3.event.pageX + 20 +"px")
                        .style('top', d3.event.pageY - 20+"px")
                        .append('div')
                        .style('color', '#000')
                        .html("stock value" + ': ' + `${value.toLocaleString(undefined, {style: "currency", currency: "USD"})}`);
                    
                //     tooltip
                //         .attr("transform", `translate(${x(date)},${y(value)})`)
                //         .call(callout, `${value.toLocaleString(undefined, {style: "currency", currency: "USD"})}
                // ${date.toLocaleString(undefined, {month: "short", day: "numeric", year: "numeric"})}`);
                });
                bisect = function(mx){
                    const bisect = d3.bisector(d => d.date).left;
                    const date = x.invert(mx);
                    const index = bisect(data, date, 1);
                    const a = data[index - 1];
                    const b = data[index];
                    return date - a.date > b.date - date ? a : b;
                }
                svg.on("mouseleave", () => tooltip12.style('display', 'none'));
               // 
                callout = (g, value) => {
                    if (!value) return g.style("display", "none");
                    g
                        .style("display", null)
                        .style("pointer-events", "none")
                        .style("font", "10px sans-serif");
                    const path = g.selectAll("path")
                        .data([null])
                        .join("path")
                        .attr("fill", "white")
                        .attr("stroke", "black");
                    const text = g.selectAll("text")
                        .data([null])
                        .join("text")
                        .call(text => text
                        .selectAll("tspan")
                        .data((value + "").split(/\n/))
                        .join("tspan")
                            .attr("x", 0)
                            .attr("y", (d, i) => `${i * 1.1}em`)
                            .style("font-weight", (_, i) => i ? null : "bold")
                            .text(d => d));
                    const {x, y, width: w, height: h} = text.node().getBBox();
                    text.attr("transform", `translate(${-w / 2},${15 - y})`);
                    path.attr("d", `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`);
                    
                }
                
            }
           
        })
        
  