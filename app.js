const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

fetch(url)
.then(response => response.json())
.then(data => {
  makeGraph(data)
});

function makeGraph(data) {
  //Returns the provided min:sec format as a Date object.
  function makeDate(min, sec) {
    return new Date(Date.UTC(1970, 0, 1, 0, min, sec));
  }
  
  //THE SVG
  const r = 7;
  const w = 900;
  const h = 450;
  const padding = 30;
  
  const svg = d3.select("#container")
                .append("svg")
                .attr("width", w)
                .attr("height", h);
  
  //THE SCALES
  //x
  const years = data.map(obj => obj.Year);
  //Here I extend the year scale by one on both sides, so that every circle sits inside the graph and not on the y axis or popping outside.
  const xScale = d3.scaleTime()
                   .range([padding, w - padding * 2])
                   .domain([d3.min(years) - 1,
                            d3.max(years) + 1]);
  //y
  //First I'm extracting the times from the objects and turning them into an array of Date objects.
  const timesArray = data.map(obj => obj.Time.split(":"));
  const times = timesArray.map(time => makeDate(time[0], time[1]));
  
  const yScale = d3.scaleTime()
                   .domain(d3.extent(times))  
                   .range([padding, h - padding]);
  //Color
  const colorScale = d3.scaleOrdinal(d3.schemeSet2);
  
  //THE AXES
  const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
  svg.append("g")
     .attr("transform", `translate(${padding}, ${h - padding})`)
     .attr("id", "x-axis")
     .call(xAxis);
  
  const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%M:%S"));  
  svg.append("g")
     .attr("transform", `translate(${padding * 2}, 0)`)
     .attr("id", "y-axis")
     .call(yAxis);
  
  //THE CIRCLES
  const circle = svg
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("data-xvalue", d => d.Year)
    .attr("data-yvalue", d => {
      const time = d.Time.split(":");
      return makeDate(time[0], time[1]);
    })
    .attr("class", "dot")
    .attr("r", r)
    .attr("cx", d => xScale(d.Year) + padding)
    .attr("cy", d => {
      const time = d.Time.split(":");
      return yScale(makeDate(time[0], time[1]));
    })
    .attr("stroke", "black")
    .attr("fill", d => colorScale(d.Doping !== ''));
  
  //THE LEGEND
  const legend = svg
    .append("g")
    .attr("id", "legend")
    .attr("transform", `translate(${w - padding}, ${padding})`);
  
  legend.selectAll("rect")
        .data(colorScale.domain())
        .enter()
        .append("rect")
        .attr("width", r * 2)
        .attr("height", r * 2)
        .attr("x", -124)
        .attr("y", (d, i) => (r * 2 + 2) * i)
        .attr("fill", c => colorScale(c));
  
  legend.selectAll("text")
        .data(colorScale.domain())
        .enter()
        .append("text")
        .text(c => c ? "Doping allegations" : "No doping allegations")
        .attr("x", -110)
        .attr("y", c => c ? 12 : 28);
  
  //THE TOOLTIPS
  const tooltip = d3.select("body")
    .append("div")
    .attr("id", "tooltip");
  
  circle
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut);
  
  function handleMouseOver(evt, d) {
    
    tooltip
      .html(`<p>${d.Name}: ${d.Nationality}</p>
             <p>Year: ${d.Year}, Time: ${d.Time}</p>
             <p>${d.Doping}</p>`)
      .attr("data-year", d.Year)
      .style("background-color", colorScale(d.Doping !== ''))
      .style("opacity", 0.9)
      .style("left", `${evt.pageX}px`)
      .style("top", `${evt.pageY}px`);
  }
  
  function handleMouseOut() {
    tooltip
      .style("opacity", 0);
  }
}