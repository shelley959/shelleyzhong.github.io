var teams = ["Atletico Madrid", "Real Madrid",  "Sevilla", "Barcelona", "Villarreal", "Athletic Bilbao", "Las Palmas", "Eibar", "Alaves", "Real Sociedad", "Leganes", "Celta Vigo", "Malaga", "Valencia", "Deportivo La Coruna", "Real Betis", "Espanyol", "Sporting Gijon", "Osasuna", "Granada"];

function myFunction() {
	document.getElementById("myDropdown").classList.toggle("show");
}

function filterFunction() {
	var input, filter, ul, li, a, i;
	input = document.getElementById("myInput");
	filter = input.value.toUpperCase();
	div = document.getElementById("myDropdown");
	a = div.getElementsByTagName("a");
	for (i = 0; i < a.length; i++) {
		if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
			a[i].style.display = "";
		} else {
			a[i].style.display = "none";
		}
	}
}

function showCharts( i, matchStats, homeStats, awayStats, scores, conceded, teamIdentifier){
	return function(){
		$(".wdl").empty();
		$(".match").empty();
		$(".linePlot").empty();
		$(".logo").empty();

		$("#home").html("Home");
		$("#away").html("Away");
		$("#overall").html("Overall");
		
		$(".welcome").hide();
		$(".button").show();
		$(".title").hide();

		if ($('.wdl').is(':visible')) {
			$("#button1").css("background-color","#3e8e41");
			$(".wdl").show();   
		}
		else if ($('.linePlot').is(':visible')) {
			$("#button2").css("background-color","#3e8e41");
			$(".linePlot").show();   
		}
		else if ($('.match').is(':visible')) {
			$("#button3").css("background-color","#3e8e41");
			$(".match").show(); 
			$(".title").show();
		}
		else{
			$("#button1").css("background-color","#3e8e41");
			$(".wdl").show();
			$(".title").hide();
		}

		drawStats(matchStats[i-1],"#overall");
		drawStats(homeStats[i-1], "#home");
		drawStats(awayStats[i-1], "#away");
		plotLine(scores[i-1],conceded[i-1]);
		drawMatch(teamIdentifier, teams[i-1]);

		var src = "IMG/SVG/team" + i + ".png";
		$('.logo').append('<img id="clubLogo" src="' + src +'" />');
		$('.logo').append(teams[i-1]);
		
	};
}

function drawMatch(team, teamName){
	console.log('Loading matches ...');
	var url = 'https://sportsop-soccer-sports-open-data-v1.p.mashape.com/v1/leagues/liga/seasons/16-17/rounds?team_identifier=';
	var teamIdentifier = team;
	url += teamIdentifier;

	$.ajax({
		url: url,
		method: 'GET',
		beforeSend: function(xhr) { 
			xhr.setRequestHeader("X-Mashape-Key", "MT1KsPP5Pkmsh9LoBd9BVbIbaOIzp1iLlSTjsnCrW3xBPjnYP3");
			xhr.setRequestHeader("Accept", "application/json");
		},
	}).done(function(result){
		//add titles to match divs
		$("#homeTitle").html("Home Team");
		$("#awayTitle").html("Away Team");

		var homeScore;
		var awayScore;
		var homeTeam;
		var awayTeam;
		var matchScore;

		//get match score details
		for(var a = 0; a < 9; a++){
			homeTeam = result.data.rounds[a].home_team;
			awayTeam = result.data.rounds[a].away_team;
			matchScore = result.data.rounds[a].match_result;
			var dashPos;
			for(var b = 0; b < matchScore.length; b++){
				if (matchScore.charAt(b)=='-'){
					dashPos = b;
				}
			}
			homeScore = matchScore.substring(0, b-2);
			awayScore = matchScore.substring(b,matchScore.length-1);

			//home team result
			$("#goal1").append("<span>" +homeTeam);
			if(homeScore === '0'){
				$('#goal1').append("<img src='IMG/zero.png' />");
				console.log("home zero");
			}
			for(var c = 0; c < homeScore; c++){
				//draw footballs for the home team
				$('#goal1').append("<img src='IMG/soccer-ball-balls-icon-12.png' />");
			}
			$('#goal1').append("</span> <br />");


			//away team result
			if(awayScore === '0'){
				$('#goal2').append("<img src='IMG/zero.png' />");
				console.log("away zero");
			}
			for(var d = 0; d < awayScore; d++){
				//draw footballs for the away team
				$('#goal2').append("<img src='IMG/soccer-ball-balls-icon-12.png' />");
			}
			$("#goal2").append("<span>" + awayTeam + "</span> <br />");
		}

	}).fail(function(err) {
		throw err;
	});

	console.log("Match details done");
}

function plotLine(scores, conceded){
	// dimensions of graph
	var m = [80, 80, 80, 80]; // margins
	var w = 800 - m[1] - m[3]; // width
	var h = 500 - m[0] - m[2]; // height

	// scaling
	var x = d3.scaleLinear().domain([0, scores.length-1]).range([0, w]);
	var y = d3.scaleLinear().domain([0, 30]).range([h, 0]);

	// create a line function that can convert data[] into x and y points
	var line = d3.line()
		// assign the X function to plot our line as we wish
		.x(function(d,i) { 
			// console.log('Plotting X value for data point: ' + d + ' using index: ' + i + ' to be at: ' + x(i) + ' using our xScale.');
			// return the X coordinate where we want to plot this datapoint
			return x(i); 
		})
		.y(function(d) { 
			// console.log('Plotting Y value for data point: ' + d + ' to be at: ' + y(d) + " using our yScale.");
			// return the Y coordinate where we want to plot this datapoint
			return y(d); 
		});

	// Add an SVG element with the desired dimensions and margin.
	var graph = d3.select("#scores").append("svg:svg")
	.attr("width", w + m[1] + m[3])
	.attr("height", h + m[0] + m[2])
	.append("svg:g")
	.attr("transform", "translate(" + m[3] + "," + m[0] + ")");

	// create xAxis
	var xAxis = d3.axisBottom()
	.scale(x).ticks(2)
	.tickFormat(function(d, i){
		if(i === 0){
			return "Overall";
		}
		if(i === 1){
			return "Home";
		}
		if(i === 2){
			return "Away";
		}
	});

	// Add the x-axis.
	graph.append("svg:g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + h + ")")
	.call(xAxis);

	// create left yAxis
	var yAxisLeft = d3.axisLeft()
	.scale(y).ticks(6);

	// Add the y-axis to the left
	graph.append("svg:g")
	.attr("class", "y axis")
	.attr("transform", "translate(-25,0)")
	.call(yAxisLeft);

  	// Add the line by appending an svg:path element with the data line we created above
	// do this AFTER the axes above so that the line is above the tick-lines
	graph.append("svg:path").attr("d", line(scores)).attr("class", "special").attr("id","scoreLine");
	graph.append("svg:path").attr("d", line(conceded)).attr("class", "special").attr("id","concededLine");

	// Add the scatterplot on score line
	var dot1 = graph.selectAll("dot")
	.data(scores)
	.enter().append("circle")
	.attr("r", 6)
	.attr("cx", function(d,i) { return x(i); })
	.attr("cy", function(d) { return y(d); })
	.style("opacity", '.8')
	.style("stroke", "black")
	.style("stroke-width", 4)
	.style("fill","white");

    // Add the scatterplot on conceded line
    var dot2 = graph.selectAll("dot")
    .data(conceded)
    .enter().append("circle")
    .attr("r", 6)
    .attr("cx", function(d,i) { return x(i); })
    .attr("cy", function(d) { return y(d); })
    .style("opacity", '.8')
    .style("stroke", "black")
    .style("stroke-width", 4)
    .style("fill","white");

	//labels
	graph.append("text")
	.attr("transform", "translate(" + (w*2/3) + "," + h/10 + ")")
	// .attr("dy", ".35em")
	.attr("text-anchor", "Scores")
	.style("fill", "#0074BA")
	.style("font-size","2vw")
	.text("—— Scores");

	graph.append("text")
	.attr("transform", "translate(" + (w*2/3) + "," + h/10*2 + ")")
	// .attr("dy", ".35em")
	.attr("text-anchor", "Conceded")
	.style("fill", "#FF7400")
	.style("font-size","2vw")
	.text("—— Conceded");	

	//tooltip for score line
	var tooltip1 = d3.select("#scores")           
	.append('div')                            
	.attr('class', 'tooltipLine');                 

	tooltip1.append('div')                        
	.attr('class', 'goal');   

	dot1.on('mouseover', function(d,i) {
		tooltip1.select('.goal').html(scores[i]);
		var left = (x(i)+h+30)+'px';
		var top = (y(d)+120) + 'px';
		tooltip1.style('left', left);
		tooltip1.style('top', top);
		tooltip1.style('display', 'block');
	});

	dot1.on('mouseout', function() {
		tooltip1.style('display', 'none');
	});

	//tooltip for conceded line
	var tooltip2 = d3.select("#scores")           
	.append('div')                            
	.attr('class', 'tooltipLine');                 

	tooltip2.append('div')                        
	.attr('class', 'goal');   

	dot2.on('mouseover', function(d,i) {
		tooltip2.select('.goal').html(conceded[i]);
		var left = (x(i)+h+30)+'px';
		var top = (y(d)+120) + 'px';
		tooltip2.style('left', left);
		tooltip2.style('top', top);
		tooltip2.style('display', 'block');
	});

	dot2.on('mouseout', function() {
		tooltip2.style('display', 'none');
	});


	console.log("Line plot done");
}

function drawStats(data, specifier){
	var dataset = [
	{ label: 'Win', count: data[0] },
	{ label: 'Draw', count: data[1] },
	{ label: 'Lost', count: data[2] }
	];

	var width;
	var height;
	var donutWidth;
	var legendRectSize;
	var legendSpacing;
	var fontSize;
	
	if(specifier == '#home' || specifier == '#away'){
		width = 180;
		height = 180;
		donutWidth = 40;
		legendRectSize = 12.5;
		legendSpacing = 5;
		fontSize = "1vw";
	}
	if(specifier == '#overall'){
		width = 360;
		height = 360;
		donutWidth = 80;
		legendRectSize = 30;
		legendSpacing = 10;
		fontSize = "1.5vw";
	}

	var radius = Math.min(width, height) / 2;
	var color = d3.scaleOrdinal(d3.schemeCategory20);

	var svg = d3.select(specifier)
	.append('svg')
	.attr('width', width)
	.attr('height', height)
	.append('g')
	.attr('transform', 'translate(' + (width / 2) +  ',' + (height / 2) + ')');

	var arc = d3.arc()
	.innerRadius(radius - donutWidth)
	.outerRadius(radius);

	var pie = d3.pie()
	.value(function(d) { return d.count; })
	.sort(null);

	var path = svg.selectAll('path')
	.data(pie(dataset))
	.enter()
	.append('path')
	.attr('d', arc)
	.attr('fill', function(d, i) {
		return color(d.data.label);
	});

	//tooltip
	var tooltip = d3.select(specifier)           
	.append('div')                            
	.attr('class', 'tooltip');                 

	tooltip.append('div')                        
	.attr('class', 'label');                   

	tooltip.append('div')                   
	.attr('class', 'count');                  

	tooltip.append('div')                  
	.attr('class', 'percent');  

	path.on('mouseover', function(d) {
		var total = d3.sum(dataset.map(function(d) {
			return d.count;
		}));
		var percent = Math.round(1000 * d.data.count / total) / 10;
		tooltip.select('.label').html(d.data.label);
		tooltip.select('.count').html(d.data.count);
		tooltip.select('.percent').html(percent + '%');
		tooltip.style('display', 'block');
	});

	path.on('mouseout', function() {
		tooltip.style('display', 'none');
	});

	//legend
	var legend = svg.selectAll('.legend')
	.data(color.domain())
	.enter()
	.append('g')
	.attr('class', 'legend')
	.attr('transform', function(d, i) {
		var height = legendRectSize + legendSpacing;
		var offset =  height * color.domain().length / 2;
		var horz = -2 * legendRectSize;
		var vert = i * height - offset;
		return 'translate(' + horz + ',' + vert + ')';
	});

	legend.append('rect')
	.attr('width', legendRectSize)
	.attr('height', legendRectSize)
	.style('fill', color)
	.style('stroke', color);

	legend.append('text')
	.attr('x', legendRectSize + legendSpacing)
	.attr('y', legendRectSize - legendSpacing)
	.style("font-size",fontSize)
	.text(function(d) { return d;});    

	$(specifier).append("<br/> <span class='text'> Win: " + data[0] + ";</span>");
	$(specifier).append("<span class='text'> Draw: " + data[1] + ";</span>");
	$(specifier).append("<span class='text'> Lost: " + data[2] + "</span> <br/>");

	console.log(specifier + " drawn");
}

function updateMenu(teamList){
	for(var a = 0; a < teamList.length; a++){
		var aTag = '<a id="team'+ (a+1) +'" href="#logo" >' + teamList[a] + '</a>';
		$("#myDropdown").append(aTag);
	}

	console.log("Menu updated");
}

function getStanding(){
	console.log('Getting standing ...');
	var url = "http://soccer.sportsopendata.net/v1/leagues/liga/seasons/16-17/standings";

	$.ajax({
		url: url,
		method: 'GET',
	}).done(function(result) {
		var matchStats = [];
		var homeStats = [];
		var awayStats = [];
		var scores = [];
		var conceded = [];

		for(var i = 0; i < result.data.standings.length;i++){

			//add win/draw/lost to matchStats
			var wdlOverall = [];
			wdlOverall[0] = result.data.standings[i].overall.wins;
			wdlOverall[1] = result.data.standings[i].overall.draws;
			wdlOverall[2] = result.data.standings[i].overall.losts;
			matchStats[i] = wdlOverall;

			//add win/draw/lost to homeStats
			var wdlHome = [];
			wdlHome[0] = result.data.standings[i].home.wins;
			wdlHome[1] = result.data.standings[i].home.draws;
			wdlHome[2] = result.data.standings[i].home.losts;
			homeStats[i] = wdlHome;

			//add win/draw/lost to awayStats
			var wdlAway = [];
			wdlAway[0] = result.data.standings[i].away.wins;
			wdlAway[1] = result.data.standings[i].away.draws;
			wdlAway[2] = result.data.standings[i].away.losts;
			awayStats[i] = wdlAway;	

			//add scores to scores
			var scoresOHA = [];
			scoresOHA[0] = result.data.standings[i].overall.scores;
			scoresOHA[1] = result.data.standings[i].home.scores;
			scoresOHA[2] = result.data.standings[i].away.scores;
			scores[i] = scoresOHA;

			//add conceded to conceded
			var concededOHA = [];
			concededOHA[0] = result.data.standings[i].overall.conceded;
			concededOHA[1] = result.data.standings[i].home.conceded;
			concededOHA[2] = result.data.standings[i].away.conceded;
			conceded[i] = concededOHA;
		}

		//add team list to the drop down menu
		updateMenu(teams);

		//draw charts based on click events
		for(var c = 1; c <= 20; c++) {
			var teamIdentifier = result.data.standings[c-1].team_identifier;
			$('#team' + c).click(showCharts(c,matchStats, homeStats, awayStats, scores, conceded,teamIdentifier));
		}

	}).fail(function(err) {
		throw err;
	});
}

$(document).ready(function(){
	$(".vis").hide();
	$(".dropdown").show();
	$("#welcome").show();
	getStanding();	
	console.log('Ready!');

	$("#button1").click(function(){
		$("#button1").css("background-color","#3e8e41");
		$("#button2").css("background-color","#4CAF50");
		$("#button3").css("background-color","#4CAF50");
		$(".wdl").show();
		$(".linePlot").hide();
		$(".match").hide();
	});

	$("#button2").click(function(){
		$("#button2").css("background-color","#3e8e41");
		$("#button1").css("background-color","#4CAF50");
		$("#button3").css("background-color","#4CAF50");
		$(".wdl").hide();
		$(".linePlot").show();
		$(".match").hide();
	});

	$("#button3").click(function(){
		$("#button3").css("background-color","#3e8e41");
		$("#button1").css("background-color","#4CAF50");
		$("#button2").css("background-color","#4CAF50");
		$(".wdl").hide();
		$(".linePlot").hide();
		$(".match").show();
	});
});
