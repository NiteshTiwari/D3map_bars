// main.js -------------------------------------
// (un)comment yBarPosition[i] / yBarLabelPosition[i] to toggle whether bar animation should start from bottom or previous position

var svg = d3.select("#svg1");

var width = 960;
var height = 600;

// Projection ----------------------------------------
var projection = d3.geoMercator()
  .center([10.447596, 51.163432])
  .scale(height * 4)
  .translate([width / 2, height / 2]);

// Path ----------------------------------------
var path = d3.geoPath().projection(projection);

// d3.json("data/us.json", function(error, us) {
d3.json("data/b_laender.json", function(error, myjson) {
  if (error) throw error;

  // Tooltip Definition
  var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .attr("id", "tooltip1")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .html("<div id='barBox'>.<div/>");
    //.text("a simple tooltip");

  // States ----------------------------------------
  svg.append("g")
    .attr("class", "b_laender")
    .selectAll("path")
    .data(topojson.feature(myjson, myjson.objects.b_laender).features)
    .enter().append("path")
    .attr("d", path)
    //Tooltip ----------------------------------------
    .on("mouseover", function(d) {
      // BarChart variables
      var bl_name = d.properties.NAME_1;
      var ergCDU = ergebnisse[(d.id)]["CDU/CSU"];
      var ergSPD = ergebnisse[(d.id)].SPD;
      var ergGRN = ergebnisse[(d.id)].GRUENE;
      var ergLNK = ergebnisse[(d.id)].LINKE;
      var ergSNS = ergebnisse[(d.id)].Sonstige;
      // BarChart array
      var ergData = [ergCDU, ergSPD, ergGRN, ergLNK, ergSNS];


      drawChart(ergData);
      document.getElementById('barBox').innerHTML = "Name:<br><b>" + bl_name + "</b><hr>" +
      "<div id='textErgebnisse'> CDU/CSU: " + ergCDU + "%<br>" +
      "SPD: " + ergSPD + "%<br>" +
      "B90/DIE GRÜNEN: " + ergGRN + "%<br>" +
      "DIE LINKE: " + ergLNK + "%<br>" +
      "Sonstige: " + ergSNS + "%<br></div><hr>";

      //put svg2 into tooltip
      barBox.appendChild(svg2);

      // show tooltip
      return tooltip.style("visibility", "visible");
    })
    .on("mousemove", function(d) {
      // BarChart variables
      var bl_name = d.properties.NAME_1;
      var ergCDU = ergebnisse[(d.id)]["CDU/CSU"];
      var ergSPD = ergebnisse[(d.id)].SPD;
      var ergGRN = ergebnisse[(d.id)].GRUENE;
      var ergLNK = ergebnisse[(d.id)].LINKE;
      var ergSNS = ergebnisse[(d.id)].Sonstige;

      var ergData = [ergCDU, ergSPD, ergGRN, ergLNK, ergSNS];

      // set tooltip at mouse position
      return tooltip.style("top", (d3.event.pageY - 10) + "px")
      .style("left", (d3.event.pageX + 10) + "px");
    })
    .on("mouseout", function() {
      // hide tooltip
      return tooltip.style("visibility", "hidden");
    });

  // Borders ----------------------------------------
  svg.append("path")
    .attr("class", "state-borders")
    .attr("d", path(topojson.mesh(myjson, myjson.objects.b_laender, function(a, b) {
      return a !== b;
    })));

  // stateLabels ----------------------------------------
  svg.selectAll("text")
    .data(topojson.feature(myjson, myjson.objects.b_laender).features)
    .enter().append("text")
    .attr("class", "stateLabels")
    .attr("transform", function(d) { return "translate(" + path.centroid(d) +  ")" + 'rotate(-10 20 20)'; })
    .attr("dy", ".35em")
    .attr("x", -10)
    .text(function(d) { return d.properties.NAME_1; });

});

// Chart Size ----------------------------------------
var chartWidth = 115;
var chartHeight = 100;

// Position Variables ----------------------------------------
var yBarPosition = chartHeight; // initial y position of bars
var yBarHeight = 0; // initial height of bars

var yBarPosition = [];
yBarPosition.push(chartHeight, chartHeight, chartHeight, chartHeight, chartHeight);
var yBarHeight = [0, 0, 0, 0, 0];
var yBarLabelPosition = [];
yBarLabelPosition.push(chartHeight, chartHeight, chartHeight, chartHeight, chartHeight);


// Draw Chart function ----------------------------------------
function drawChart(dataArray){

  // bar colors (in order)
  var dataColor = ["#191919", "#CC0001", "#80B11A", "#C4598B", "#B2B2B2"];

  // create new svg
  var svgBars = d3.select('body')
    .append('svg')
    //.insert("svg",":first-child")
    .attr('id', 'svg2')
    .attr('width', chartWidth)
    .attr('height', chartHeight);

    // create a selection and bind data
    var selection = svgBars.selectAll('rect')
                       .data(dataArray);

    // create new elements wherever needed
    selection.enter()
      .append('rect')
      .attr('x', function(d, i){
        return i * 25;
      })
      .attr('width', 15)
      .attr('fill', function (d, i) {return dataColor[i];}) // bar color
      .merge(selection) // merge new elements with existing ones, so everything below applies to all
      .attr('y', function (d, i) {return yBarPosition[i];}) // start position of bar
      .attr('height', function (d, i) {return yBarHeight[i];}) // start height of bar
      .transition()
      .duration(700)
      // function for new bar position
      .attr('y', function(d, i){
        var newBarPosition = chartHeight - (chartHeight * (d*0.02));
        //yBarPosition[i] = newBarPosition; // comment to reaload bars from 0 while hovering
        return newBarPosition;
      })
      // function for new bar height
      .attr('height', function(d, i){
        var newHeight = chartHeight * (d*0.02);
        yBarHeight[i] = newHeight;
        return newHeight;
      });

    // Bar Labels
    svgBars.selectAll("text")
      .data(dataArray)
      .enter()
      .append("text")
      .attr("class", "barLabelText")
      .attr('x', function(d, i){
        return i * 25;
      })
      .attr('y', function (d, i) {return yBarLabelPosition[i];})
      .transition()
      .duration(700)
      .attr('y', function(d, i){
        var newLabelPosition = chartHeight - (chartHeight * (d*0.02));
        //yBarLabelPosition[i] = newLabelPosition; // comment to start from bottom
        return newLabelPosition;
      })
      .attr("dx", 7)
      .attr("dy", 8)
      .text(function(d){
        return d;
      });

    // X-Axis ----------------------------------------
    // var x = d3.scaleBand()
    //       .range([0, chartWidth-1]);
    //       //.padding(0.1);
    //
    // var xLabels = ["CDU/CSU", "SPD", "B90/DIE GRÜNEN", "DIE LINKE", "Sonst."];
    //
    // // Scale the range of the data in the domains
    // x.domain(xLabels.map(function(d) { return d; }));
    //
    // svgBars.append("g")
    //   .attr("class", "axis")
    //   .attr("transform", "translate(0," + (chartHeight - chartHeight) + ")")
    //   .call(d3.axisBottom(x).
    //     //tickSizeOuter(0)
    //     ticks(2)
    //     )
    //   .selectAll('text')
    //   .style("text-anchor", "end")
    //   .attr("dx", "-1.15em")
    //   .attr("dy", ".45em")
    //   .attr("transform", "rotate(-65)")
    // ;

    // remove any unused bars
    selection.exit()
      .remove();
}
