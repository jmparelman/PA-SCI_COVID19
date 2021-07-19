---
layout: post
title:  "In Pennsylvania Prisons Incarcerated People are Almost
Twice As Likely to Die of COVID-19."
date: 2021-04-12
author: "Jake M. Parelman & Matthew Brook O’Donnell"
---
<div class='tooltip' style="opacity:0; padding: 6px; background-color:white; font:12p sans-serif; border-style:solid; border-width:1px;border-color:black"></div>

<p class="font-italic">The pain and suffering that the COVID-19 pandemic has caused throughout the world has been immense. At the time that this article was written, more than 560,000 people have died from the virus in the United States, and significantly more have suffered through the infection. The picture within state and federal correctional institutions is far worse though. It is hard to imagine a grimmer statistic than the national infection rate of 9 for every 100 people, but <a href= 'https://www.nytimes.com/interactive/2021/04/10/us/covid-prison-outbreak.html' >a recent analysis from the New York Times </a>indicates that across the country for every 100 incarcerated individuals, 34 have been infected by the deadly COVID-19 virus. </p>

In Pennsylvania, we have heard statements from officials from the department of corrections, in both professional and non-professional capacities, that incarcerated people are safer in prison than in their own communities. On January 7th Bret Bucklen, the head data analyst at the DOC tweeted that “there are several data points to suggest that in PA prison is safer than the community from COVID.”

The results of the New York Times’ analysis indicate that at a national level this statement is clearly incorrect. However, national statistics often do not apply directly to the realities in specific states, counties and cities. Through our own analysis of the available PA DOC covid-19 testing data, we find specific evidence that within Pennsylvania, incarcerated people remain at substantially higher risk of contracting and dying of COVID-19 compared to the non-incarcerated population.

Incarcerated people in the Pennsylvania prison system are nearly twice as likely to die of COVID-19.  In the general Pennsylvania population, 197 in every 100,000 people have died of COVID-19; in PA prisons the death rate is on average 388 for every 100,000. This average represents the death rates across the 22 State Correctional Institutions in Pennsylvania, which vary substantially in their COVID-19 statistics; some prisons fairing substantially worse than the state death rate, while others have rates on par or lower than the state death rate.

<div class="text-center" style="margin-top: 80px; margin-bottom:80px">
<img src="/img/figures/Formatted_jj.png" class='img-fluid' />
</div>

Our national analysis further confirms the findings of the New York Times infection rate data: across the country it is the norm that death rates are higher in state and federal correctional institutions than in the general population. Further, Pennsylvania is one of only five states whose incarcerated population is close to or more than twice as likely to die of COVID-19 compared to the rest of the state population.

The troubling assertion that incarcerated people are safer from the pandemic in prison than in their communities is not only offensive, but is also blatantly false. People in Pennsylvania are almost twice as likely to die of COVID-19 in prison than in their communities. How the numbers for infection rates compare is still a question, however the PA DOC’s continued difficulty with reporting accurate testing data and unwillingness for transparency makes this analysis infeasible. Until the DOC can report accurate information our analysis will remain tied to more easily verifiable information like death rates.

<div class="row" style="margin-left:50px; margin-top: 80px">
     <label><strong>Where in the U.S. is COVID-19 More Deadly in Prison?</strong></label>
 </div>
 <div id='svg-div' class="row" style="margin-top: 20px; margin-bottom: 80px">
         <svg></svg>
 </div>

The pandemic has highlighted how transparent and openly available health data is a fundamental component of providing acceptable standards of care. Beyond COVID-19 the DOC must demonstrate an ongoing commitment to providing data on the incidence, treatment and mortality from all conditions and disease among those incarcerated in the institutions for which they are tasked with care.

 Like in many other areas of our society, the pandemic has laid bare significant disparities in how incarcerated people are treated and cared for. The risks that incarcerated people have faced during the pandemic has further revealed the lack of care and stigmatization that incarcerated people experience more generally. "The fact that people are almost twice as likely to die in PA prisons has made one thing abundantly clear. More should have been done to release aging and medically vulnerable individuals so they could have safely sheltered at home with family." Says Kris Henderson, Executive Director of the Amistad Law Project. "We must always remember that more still can be done. COVID is sadly one of many conditions that takes the lives of incarcerated people at greater rates than the rest of society. Pennsylvania must create systems for geriatric and medical parole in order to #FreeTheVulnerable."


<hr>
- <p style='font-size:10px'>Pennsylvania DOC death rate data was collected from <a href='https://www.cor.pa.gov/Pages/COVID-19.aspx'> the DOC COVID-19 website </a>. All death rate statistics are cumulative values and were calculated on April 6th, 2021.</p>

- <p style='font-size:10px'>Pennsylvania death rate data was pulled from <a href='https://www.health.pa.gov/topics/disease/coronavirus/Pages/Cases.aspx'> the PA Department Of Health COVID-19 data portal </a>, on April 6th, 2021. </p>

- <p style='font-size:10px'> National state level incarcerated person data was collected from the <a href='https://law.ucla.edu/news/covid-19-behind-bars-project-enhances-prison/covid-19-database'> UCLA COVID-19 Behind Bars Project database </a>. </p>

- <p style='font-size:10px'> National COVID-19 state-wide data was collected from <a href='https://covid.cdc.gov/covid-data-tracker/#datatracker-home'> the CDC COVID data tracker web portal</a>. </p>

 <script>

 var tooltip = d3.select('.tooltip');

 var svg = d3.select('svg');

 var margin = {top: 10, left: 10, bottom: 10, right: 10}
   , width = parseInt(d3.select('#svg-div').style('width'))
   , width = width - margin.left - margin.right
   , mapRatio = .5
   , height = width * mapRatio;

svg
   .style('width', width + 'px')
   .style('height', height + 'px');

 var g = svg.append('g');

 const projection = d3.geoAlbersUsa()
    .scale(width)
    .translate([width/2,height/2]);

 var geoPath = d3.geoPath()
     .projection(projection);

 var promises = [
   d3.json("/data/us-albers.json"),
   d3.csv("/data/state_test.csv")
 ]

 d3.select(window).on('resize', resize);

 function resize() {
     width = parseInt(d3.select("#svg-div").style('width'));
     width = width - margin.left - margin.right;
     height = width * mapRatio;

     projection
         .translate([width / 2, height / 2])
         .scale(width);

     svg
         .style('width', width + 'px')
         .style('height', height + 'px');

     // resize the map
     svg.select('.county').attr('d', path);
 }


 Promise.all(promises).then(ready)

 function ready([us,features]) {
     g.selectAll('path')
         .data(topojson.feature(us,us.objects.us).features)
         .enter()
         .append('path')
         .attr('d',geoPath)
         .attr('stroke',"black")
         .style('fill',function(d){
             var v = find_data(d.properties.name,features);
             if (v === undefined){
                 return "white";
             } else {
                 if (v['State Death Rate'] - v['Prison Death Rate'] < 0) {
                     return "#4E97E0";
                 } else {
                     return "#ebebeb";
                 }
             }
         })
         .attr('class','county')
         .on('mouseover',function(event,d){
             var v = find_data(d.properties.name,features);
             if (v === undefined){
                 var html_string = "<strong>"+ d.properties.name + "</strong> <br /> no data available"
             } else {
                 var html_string = "<strong>"+ d.properties.name + "</strong> <br /> State Death Rate: <strong>"+v['State Death Rate']+' per 100,000</strong><br /> Prison Death Rate: <strong>'+ Math.round(v['Prison Death Rate']) + " per 100,000</strong>"
             }
             tooltip.style("opacity", 1)
             .style("left", (event.pageX - 200) + "px")
             .style("top", (event.pageY - 200) + "px")
             .html(html_string);
         })
         .on('mouseout',function(d){
           tooltip.style("opacity",0);
         });
         ;
 }

 // function to find fips object in data
 function find_data(state,data){
     var result = data.find(obj => {
         return obj.State === state
     });
     return result;
 }

 </script>