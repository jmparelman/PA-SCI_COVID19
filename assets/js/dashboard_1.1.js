// navbar script
$(function () {
    'use strict'

  $("[data-trigger]").on("click", function(){
        var trigger_id =  $(this).attr('data-trigger');
        $(trigger_id).toggleClass("show");
        $('body').toggleClass("offcanvas-active");
    });

    // close if press ESC button
    $(document).on('keydown', function(event) {
        if(event.keyCode === 27) {
           $(".navbar-collapse").removeClass("show");
           $("body").removeClass("overlay-active");
        }
    });

    // close button
    $(".btn-close").click(function(e){
        $(".navbar-collapse").removeClass("show");
        $("body").removeClass("offcanvas-active");
    });


})

// datatable
$(document).ready( function () {
    $('#SCItable').DataTable();
} );


// d3 current cases plot
var svg = d3.select('#chartArea').append('svg')
    .attr("height",300);

var parseDate = d3.timeParse("%Y-%m-%d");

var movingWindowAvg = function (arr, step) {  // Window size = 2 * step + 1
    return arr.map(function (_, idx) {
    var wnd = arr.slice(idx - step, idx + step + 1);
    var result = d3.sum(wnd) / wnd.length;

    // Check for isNaN, the javascript way
    result = (result == result) ? result : _;

    return result;
    });
};

d3.csv("../data/latest_data/PA_DOC_testing_data.csv",function(data){

    var data_summarized = d3.nest()
        .key(function(d){return d.date})
        .rollup(function(d){
            return d3.sum(d, function(g){return g.inmate_positive_D;})
        }).entries(data);

    data_summarized.forEach(function(d,i){
            d.date = parseDate(d.key);
            d.new_cases = parseFloat(d.value);
        });

    moveAvg = movingWindowAvg(data_summarized.map(a => a.value), 7)

    data_summarized.forEach(function(d,i){
            d.moveAvg = moveAvg[i];
        });

    var x = d3.scaleLinear()
        .domain(d3.extent(data_summarized, function(d) { return d.date;}));

    var x_bar = d3.scaleBand();

    var y = d3.scaleLinear()
        .range([250, 50])
        .domain(d3.extent(data_summarized, function(d) { return d.value;}));

        var xAxis = svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (250) + ")");

    svg.append("g")
        .attr("class", "y axis")
        .attr('transform',"translate(25, 0)")
        .call(d3.axisLeft(y)
        .ticks(5));

    var bars = svg.append('g')
        .selectAll('rect')
        .data(data_summarized)
        .enter()
        .append('rect')
        .style('fill','#ffb3b3')
        .attr('y',function(d){return y(d.value);})
        .attr("height", function(d) { return 250 - y(d.value); });

    svg.append('rect')
        .attr('y',10)
        .attr('x',10)
        .attr('width',10)
        .attr('height',10)
        .attr('fill','#ffb3b3');

    svg.append('text')
        .attr('y',20)
        .attr('x',25)
        .text('Daily cases')
        .style('color','black')
        .style('font-size',12);

    svg.append('rect')
        .attr('y',14)
        .attr('x',100)
        .attr('width',15)
        .attr('height',3)
        .attr('fill','#6f1616');

    svg.append('text')
        .attr('y',20)
        .attr('x',120)
        .text('7 day average')
        .style('color','black')
        .style('font-size',12);

    var line = svg.append("path")
      .data([data_summarized])
      .attr("class", "line")
      .style('fill','none')
      .style('stroke','#6f1616')
      .style('stroke-width','2px');

    function drawChart() {
        currentWidth = parseInt(d3.select('#chartArea').style('width'));
        currentWidth = currentWidth - (currentWidth * 0.05);
        svg.attr('width',currentWidth);
        x.range([25,currentWidth]);
        xAxis.call(d3.axisBottom(x)
            .tickFormat(d3.timeFormat("%b %d"))
            .ticks(4))
        .selectAll("text");

        var valueline = d3.line()
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.moveAvg); })
            .curve(d3.curveMonotoneX);

        bars.attr("x", function(d) { return x(d.date); })
          .attr("width", x_bar.bandwidth());

        line.attr("d", valueline);
    };

    drawChart();
    window.addEventListener('resize', drawChart );
  });
