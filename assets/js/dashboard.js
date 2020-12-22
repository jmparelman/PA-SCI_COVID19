
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

$(document).ready( function () {

} );

var svg = d3.select('#chartArea').append('svg')
    .attr("height",300);

var parseDate = d3.timeParse("%Y-%m-%d");
var bisectDate = d3.bisector(function(d) { return d.date; }).left;

var movingWindowAvg = function (arr, step) {  // Window size = 2 * step + 1
    return arr.map(function (_, idx) {
    var wnd = arr.slice(idx - step, idx + step + 1);
    var result = d3.sum(wnd) / wnd.length;

    // Check for isNaN, the javascript way
    result = (result == result) ? result : _;

    return result;
    });
};

function numberWithCommas(x) {
    return parseInt(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

//d3.csv("/PA-SCI_COVID19/data/latest_data/PA_DOC_testing_data.csv").then(function(data){
d3.csv("https://raw.githubusercontent.com/jmparelman/PA-SCI_COVID19/main/data/latest_data/PA_DOC_testing_data.csv").then(function(data){


    // daily sums
    var summary_data = d3.rollups(data, v => ({
                        'current_cases': d3.sum(v, d => d.incarcerated_person_positive),
                        'current_deaths': d3.sum(v, d => d.incarcerated_person_death),
                        'current_tests': d3.sum(v, d => (+d.incarcerated_person_positive) + (+d.incarcerated_person_negative) + (+d.incarcerated_person_pending))
                      }),d=>d.date);



    // most recent numbers
    var current_cases = summary_data[summary_data.length-1][1].current_cases;
    var current_deaths = summary_data[summary_data.length-1][1].current_deaths;
    var current_tests = summary_data[summary_data.length-1][1].current_tests;
    var last_date = summary_data[summary_data.length-1][0];

    const lastdayFormat = d3.timeFormat("%m/%d/%y");

     d3.select('#current_cases').text(numberWithCommas(current_cases));
     d3.select('#current_deaths').text(numberWithCommas(current_deaths));
     d3.select('#current_tests').text(numberWithCommas(current_tests));
     // HIDE LAST UPDATED FOR NOW WHILE WE RESOLVE
		 // the DOC dashboard vs DOC excel data issues
		 //d3.select('#last-updated').text("Last Updated: "+lastdayFormat(parseDate(last_date)));
     // daily new cases
     var data_summarized = d3.rollup(data, v => d3.sum(v, d => d.incarcerated_person_positive_new),
                                     d => d.date);

     var data_summarized2 = Array.from(data_summarized, ([key, value]) => ({key, value,
                                                                     'date': parseDate(key),
                                                                       'new_cases': value
                                                                   }));


    const cases_moving_avg = movingWindowAvg(data_summarized2.map(a => a.new_cases),7);


    data_summarized2.forEach((d,i) => {
        d.cases_moving_avg = cases_moving_avg[i];
        d.barID = "barID-"+i;
    })



		// add sparklines
	   var sci_data = d3.group(data, d => d.SCI);
	   Array.from(sci_data, ([key, values]) => sparkline('#'+key.replace(/ /g, "_"), values));


		 // setup and activate the table
		 var table = $('#SCItable').DataTable(
	 		{ "pageLength": 25,
	 			responsive: true,
				columnDefs: [
    			{ orderable: false, targets: 1 }
  			]
	 		}
	 	);

	 	new $.fn.dataTable.FixedHeader( table );

		table.order([2, 'desc']).draw();


    // d3 scaling
    var x = d3.scaleLinear()
        .domain(d3.extent(data_summarized2, d => d.date));

    var x_bar = d3.scaleBand()
        .domain(data_summarized2.map(d => d.date));

    var y = d3.scaleLinear()
        .range([250, 50])
				.domain([0, d3.max(data_summarized2, d => d.value)])
        //.domain(d3.extent(data_summarized2, d => d.value));

    // x axis
    var xAxis = svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (250) + ")");

    // y axis
    svg.append("g")
        .attr("class", "y axis")
        .attr('transform',"translate(30, 0)")
        .call(d3.axisLeft(y)
        .ticks(5, 'd'));

    // bar graph
    var bars = svg.append('g')
        .selectAll('rect')
        .data(data_summarized2)
        .enter()
        .append('rect')
        .style('fill','#ffb3b3')
        .attr('y',d => y(d.new_cases))
        .attr("height", d => 250 - y(d.new_cases))
        .attr('id', d => d.barID);

    var line = svg.append("path")
      .data([data_summarized2])
      .attr("class", "line")
      .style('fill','none')
      .style('stroke','#6f1616')
      .style('stroke-width','2px');

    // legend start
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

    var tooltip_line = svg.append("line")
        .style("stroke", "black")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0)
        .attr("y1", 50)
        .attr("y2", 250);

    // tooltip node
    var tooltip_node = svg.append('circle')
        .attr('r',5)
        .style('stroke','#ffb3b3')
        .style('fill','#6f1616')
        .style('display','none');

    var tooltip_text_1 = svg.append('text')
        .attr('y',100)
        .style('stroke','black')
        .attr("font-size", "9px")
        .style('stroke-width',0)
        .attr('class','svg-text')
        .attr('text-decoration','underline');

    var tooltip_text_2 = svg.append('text')
        .attr('y',110)
        .style('stroke','black')
        .style('stroke-width',0)
        .attr("font-size", "9px")
        .attr('class','svg-text');

    var tooltip_text_3 = svg.append('text')
        .attr('y',120)
        .style('stroke','black')
        .style('stroke-width',0)
        .attr("font-size", "9px")
        .attr('class','svg-text');


    svg.style("pointer-events", "all")                    // **********
        .on("mouseover", function() {
            tooltip_node.style("display", null);
            tooltip_line.style("opacity", 0.5);
            d3.selectAll('.svg-text').style('opacity',1);
        })
        .on("mouseout", function() {
            tooltip_node.style("display", "none");
            tooltip_line.style("opacity", 0);
            d3.selectAll('.svg-text').style('opacity',0);
        })
        .on("mousemove", function(event,d){
            var x0 = x.invert(d3.pointer(event)[0]),
            i = bisectDate(data_summarized2, x0, 1),
            d0 = data_summarized2[i - 1],
            d1 = data_summarized2[i],
            d = x0 - d0.date > d1.date - x0 ? d1 : d0;

            const dayFormat = d3.timeFormat("%m/%d");

            tooltip_node.attr('cx',x(d.date))
                .attr('cy',y(d.cases_moving_avg));
            tooltip_line.attr('x1',x(d.date))
                        .attr('x2',x(d.date));


             if (x(d.date) < svg.attr('width') - (svg.attr('width')/7) ) {
                    // you are on A zone
                    d3.selectAll('.svg-text').attr('transform','translate(5,0)')
             } else {
                    // you are on B zone
                    d3.selectAll('.svg-text').attr('transform','translate(-70,0)')
             }

            tooltip_text_1.text(dayFormat(d.date));
            tooltip_text_2.text("new cases: "+d.new_cases);
            tooltip_text_3.text("7 day avg.: "+Math.floor(d.cases_moving_avg));
            d3.selectAll('.svg-text').attr('x',x(d.date));

            bars.style('fill','#ffb3b3');
            d3.select('#'+d.barID)
                .style('fill','#6f1616');





        });


				// SPARKLINE CODE ADDED
				function sparkline(elemId, data) {

				      var width = 200;
				        var height = 40;
				        var x = d3.scaleLinear().range([0, width-2]);
				        var y = d3.scaleLinear().range([height-20, 0]);
				        var parseDate = d3.timeParse("%Y-%m-%d");

				        var formatDate = d3.timeFormat("%d %b");
				        var line = d3.line()
				                         .curve(d3.curveMonotoneX)
				                         .x(function(d) { return x(d.date); })
				                         .y(function(d) { return y(d.incarcerated_person_positive_new); });


								// update for d3 v6
				        data.forEach(function(d) {
				            d.date = parseDate(d.date);
				            d.incarcerated_person_positive_new = parseFloat(0+d.incarcerated_person_positive_new);
										d.incarcerated_person_death = parseFloat(0+d.incarcerated_person_death);
										d.incarcerated_person_positive = parseFloat(0+d.incarcerated_person_positive);
										d.incarcerated_person_negative = parseFloat(0+d.incarcerated_person_negative);
										d.incarcerated_person_pending = parseFloat(0+d.incarcerated_person_pending);
										d.incarcerated_person_reovered = parseFloat(0+d.incarcerated_person_recovered);
				        });

				        var max_idx = d3.maxIndex(data, d=>d.incarcerated_person_positive_new);
				        var max_value = data[max_idx].incarcerated_person_positive_new;
				        var start_date = formatDate(data[0].date);
				        var end_date = formatDate(data[data.length-1].date);

				        x.domain(d3.extent(data, function(d) { return d.date; }));
				        y.domain(d3.extent(data, function(d) { return d.incarcerated_person_positive_new; }));

				        var svg = d3.select(elemId + ' .sparkline')
				          .append('svg')
				          .attr('width', width)
				          .attr('height', height)
									.attr('viewBox', '0 0 ' + width + ' ' + height)
				          .append('g')
				        .attr('transform', 'translate(0,10)');

				        svg.append('path')
				          .datum(data)
				          .attr('class', 'sparkline')
				          .attr('d', line);




				          svg.append('circle')
				             .attr('class', 'sparkcircle')
				             .attr('cx', x(data[max_idx].date))
				             .attr('cy', y(data[max_idx].incarcerated_person_positive_new))
				             .attr('r', 1.5);



							/*			 svg.append('line')
 						          .attr('class', 'maxbar')
 						          .attr('x1', x(data[max_idx].date))
											.attr('x2', x(data[max_idx].date))
											.attr('y1', y(0))
											.attr('y2', y(data[max_idx].incarcerated_person_positive_new))
											*/


								var xoffset = 10+5*(max_value.toString().length-1);
				        svg.append('text')
				        .attr('x', x(data[max_idx].date)-xoffset)
				        .attr('y', y(data[max_idx].incarcerated_person_positive_new))
				        .attr("dy", ".35em")
				        .attr('class', 'maxlabel')
				        .text(max_value);

				        svg.append('text')
				        .attr('x', x(data[0].date))
				        .attr('y', y(0)+6)
				        .attr("dy", ".35em")
				        .attr('class', 'datelabel')
				        .text(start_date);

				        svg.append('text')
				        .attr('x', x(data[data.length-1].date)-26)
				        .attr('y', y(0)+6)
				        .attr("dy", ".35em")
				        .attr('class', 'datelabel')
				        .text(end_date);

								// add the data for SCI in additional cells

								var current_ip_cases = data[data.length-1].incarcerated_person_positive_new;
								var ip_deaths = data[data.length-1].incarcerated_person_death;
								var ip_cases = data[data.length-1].incarcerated_person_positive - data[data.length-1].incarcerated_person_recovered;
								var ip_tests = +data[data.length-1].incarcerated_person_positive + data[data.length-1].incarcerated_person_negative + data[data.length-1].incarcerated_person_pending;

								// mbod 12/21 add 7day mean of new cases column
								// 7 day case sum
								var last_date = data[data.length-1].date;
								// find index for a week ago
								// milliseconds so 1000 * 60 = 1 min, * 60 = 1 hr * 24 hours * 7 days
								var week_ago = last_date - (1000*60*60*24*7);
								var last_7days_data = data.filter(d => d.date >= week_ago);
								var ip_cases_7day = d3.mean(last_7days_data.map(d => d.incarcerated_person_positive_new));


								//d3.select(elemId + ' .current_ip_cases').text(numberWithCommas(current_ip_cases));
								d3.select(elemId + ' .active_ip_cases').text(numberWithCommas(ip_cases))
								d3.select(elemId + ' .ip_deaths').text(numberWithCommas(ip_deaths));
								d3.select(elemId + ' .ip_tests').text(numberWithCommas(ip_tests));
								// mbod 12/22 add last 7 days avg cases
								d3.select(elemId + ' .ip_cases_7day').text(numberWithCommas(ip_cases_7day));

			};
			// END SPARKLINE



    function drawChart() {
        // function draws chart and updates on window resize

        currentWidth = parseInt(d3.select('#chartArea').style('width'));
        svg.attr('width',currentWidth);
        x.range([25,currentWidth - 30]);
        x_bar.range([25, currentWidth - 30]);
        xAxis.style('mainchart-xaxis')
						.call(d3.axisBottom(x)
            .tickFormat(d3.timeFormat("%b %d"))
            .ticks(4))
        .selectAll("text");

        var valueline = d3.line()
            .x(d => x(d.date))
            .y(d => y(d.cases_moving_avg))
            .curve(d3.curveMonotoneX);

        bars.attr("x", d => x(d.date))
          .attr("width", x_bar.bandwidth()/2)
          .attr('transform','translate(-'+x_bar.bandwidth()/4+',0)');

        line.attr("d", valueline);
    };

    drawChart();
    window.addEventListener('resize', drawChart );
  });
