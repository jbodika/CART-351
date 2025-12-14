/* PLEASE DO NOT CHANGE THIS FRAMEWORK ....
the get requests are all implemented and working ... 
so there is no need to alter ANY of the existing code: 
rather you just ADD your own ... */

window.onload = function () {
    document.querySelector("#queryChoice").selectedIndex = 0;
    //create once :)
    let description = document.querySelector("#Ex4_title");
    //array to hold the dataPoints
    let dataPoints = [];

    // /**** GeT THE DATA initially :: default view *******/
    // /*** no need to change this one  **/
    runQueryDefault("onload");

    /***** Get the data from drop down selection ****/
    let querySelectDropDown = document.querySelector("#queryChoice");

    querySelectDropDown.onchange = function () {
        console.log(this.value);
        let copyVal = this.value;
        console.log(copyVal);
        runQuery(copyVal);
    };

    /******************* RUN QUERY***************************  */
    async function runQuery(queryPath) {
        // // //build the url -end point
        const url = `/${queryPath}`;
        try {
            let res = await fetch(url);
            let resJSON = await res.json();
            console.log(resJSON);

            //reset the
            document.querySelector("#childOne").innerHTML = "";
            description.textContent = "";
            document.querySelector("#parent-wrapper").style.background =
                "rgba(51,102,255,.2)";

            switch (queryPath) {
                case "default": {
                    displayAsDefault(resJSON);
                    break;
                }
                case "one": {
                    //sabine done
                    displayInCirclularPattern(resJSON);
                    break;
                }
                case "two": {
                    //sabine done
                    displayByGroups(resJSON, "weather", "eventName");
                    break;
                }
                /***** TO DO FOR EXERCISE 4 *************************
                 ** 1: Once you have implemented the mongodb query in server.py,
                 ** you will receive it from the get request (THE FETCH HAS ALREADY BEEN IMPLEMENTED:: SEE ABOVE)
                 ** and will automatically will enter into the correct select case
                 **  - based on the value that the user chose from the drop down list...)
                 ** You need to design and call a custom display function FOR EACH query that you construct ...
                 ** 4 queries - I want 4 UNIQUE display functions - you can use the ones I created
                 ** as inspiration ONLY - DO NOT just copy and change colors ... experiment, explore, change ...
                 ** you can create your own custom objects - but NO images, video or sound... (will get 0).
                 ** bonus: if your visualizations(s) are interactive or animate.
                 ****/
                case "three":
                    displayBubbles(resJSON);
                    break;

                case "four":
                    displayEventsSorted(resJSON)
                    break;

                case "five":
                    displayStrengthMeter(resJSON)
                    break;

                case "six":
                    displaySteam(resJSON);
                    break;

                default: {
                    console.log("default case");
                    break;
                }
            } //switch
        } catch (err) {
            console.log(err);
        }
    }

    //will make a get request for the data ...

    /******************* RUN DEFAULT QUERY***************************  */
    async function runQueryDefault(queryPath) {
        // // //build the url -end point
        const url = `/${queryPath}`;
        try {
            let res = await fetch(url);
            let resJSON = await res.json();
            console.log(resJSON);
            displayAsDefault(resJSON);
        } catch (err) {
            console.log(err);
        }
    }

    /*******************DISPLAY AS GROUP****************************/

    function displayByGroups(resultObj, propOne, propTwo) {
        dataPoints = [];
        let finalHeight = 0;
        //order by WEATHER and Have the event names as the color  ....

        //set background of parent ... for fun ..
        document.querySelector("#parent-wrapper").style.background =
            "rgba(51, 153, 102,1)";
        description.textContent = "BY WEATHER AND ALSO HAVE EVENT NAMES {COLOR}";
        description.style.color = "rgb(179, 230, 204)";

        let coloredEvents = {};
        let resultSet = resultObj.results;

        //reget
        let possibleEvents = resultObj.events;
        let possibleColors = [
            "rgb(198, 236, 217)",
            "rgb(179, 230, 204)",
            "rgb(159, 223, 190)",
            "rgb(140, 217, 177)",
            "rgb(121, 210, 164)",
            "rgb(102, 204, 151)",
            "rgb(83, 198, 138)",
            "rgb(64, 191, 125)",
            "rgb(255, 204, 179)",
            "rgb(255, 170, 128)",
            "rgb(255, 153, 102)",
            "rgb(255, 136, 77)",
            "rgb(255, 119, 51)",
            "rgb(255, 102, 26)",
            "rgb(255, 85, 0)",
            "rgb(230, 77, 0)",
            "rgb(204, 68, 0)",
        ];

        for (let i = 0; i < possibleColors.length; i++) {
            coloredEvents[possibleEvents[i]] = possibleColors[i];
        }

        let offsetX = 20;
        let offsetY = 150;
        // find the weather of the first one ...
        let currentGroup = resultSet[0][propOne];
        console.log(currentGroup);
        let xPos = offsetX;
        let yPos = offsetY;

        for (let i = 0; i < resultSet.length - 1; i++) {
            dataPoints.push(
                new myDataPoint(
                    resultSet[i].dataId,
                    resultSet[i].day,
                    resultSet[i].weather,
                    resultSet[i].start_mood,
                    resultSet[i].after_mood,
                    resultSet[i].after_mood_strength,
                    resultSet[i].event_affect_strength,
                    resultSet[i].event_name,
                    //map to the EVENT ...
                    coloredEvents[resultSet[i].event_name],
                    //last parameter is where should this go...
                    document.querySelector("#childOne"),
                    //which css style///
                    "point_two"
                )
            );

            /** check if we have changed group ***/
            if (resultSet[i][propOne] !== currentGroup) {
                //update
                currentGroup = resultSet[i][propOne];
                offsetX += 150;
                offsetY = 150;
                xPos = offsetX;
                yPos = offsetY;
            }
            // if not just keep on....
            else {
                if (i % 10 === 0 && i !== 0) {
                    xPos = offsetX;
                    yPos = yPos + 15;
                } else {
                    xPos = xPos + 15;
                }
            } //end outer else

            dataPoints[i].update(xPos, yPos);
            finalHeight = yPos;
        } //for

        document.querySelector("#childOne").style.height = `${finalHeight + 20}px`;
    } //function

    /*****************DISPLAY IN CIRCUlAR PATTERN:: <ONE>******************************/
    function displayInCirclularPattern(resultOBj) {
        //reset
        dataPoints = [];
        let xPos = 0;
        let yPos = 0;
        //for circle drawing
        let angle = 0;
        let centerX = window.innerWidth / 2;
        let centerY = 350;

        let scalar = 300;
        let yHeight = Math.cos(angle) * scalar + centerY;

        let resultSet = resultOBj.results;
        let coloredMoods = {};

        let possibleMoods = resultOBj.moods;
        let possibleColors = [
            "rgba(0, 64, 255,.5)",
            "rgba(26, 83, 255,.5)",
            "rgba(51, 102, 255,.7)",
            "rgba(51, 102, 255,.4)",
            "rgba(77, 121,255,.6)",
            "rgba(102, 140, 255,.6)",
            "rgba(128, 159, 255,.4)",
            "rgba(153, 179, 255,.3)",
            "rgba(179, 198, 255,.6)",
            "rgba(204, 217, 255,.4)",
        ];

        for (let i = 0; i < possibleMoods.length; i++) {
            coloredMoods[possibleMoods[i]] = possibleColors[i];
        }

        //set background of parent ... for fun ..
        document.querySelector("#parent-wrapper").style.background =
            "rgba(0, 26, 102,1)";
        description.textContent = "BY AFTER MOOD";
        description.style.color = "rgba(0, 64, 255,.5)";

        for (let i = 0; i < resultSet.length - 1; i++) {
            dataPoints.push(
                new myDataPoint(
                    resultSet[i].dataId,
                    resultSet[i].day,
                    resultSet[i].weather,
                    resultSet[i].start_mood,
                    resultSet[i].after_mood,
                    resultSet[i].after_mood_strength,
                    resultSet[i].event_affect_strength,
                    resultSet[i].event_name,
                    //map to the day ...
                    coloredMoods[resultSet[i].after_mood],
                    //last parameter is where should this go...
                    document.querySelector("#childOne"),
                    //which css style///
                    "point_two"
                )
            );
            /*** circle drawing ***/
            xPos = Math.sin(angle) * scalar + centerX;
            yPos = Math.cos(angle) * scalar + centerY;
            angle += 0.13;

            if (angle > 2 * Math.PI) {
                angle = 0;
                scalar -= 20;
            }
            dataPoints[i].update(xPos, yPos);
        } //for

        document.querySelector("#childOne").style.height = `${yHeight}px`;
    } //function

    /*****************DISPLAY AS DEFAULT GRID :: AT ONLOAD ******************************/
    function displayAsDefault(resultOBj) {
        //reset
        dataPoints = [];
        let xPos = 0;
        let yPos = 0;
        const NUM_COLS = 50;
        const CELL_SIZE = 20;
        let coloredDays = {};
        let resultSet = resultOBj.results;
        possibleDays = resultOBj.days;
        /*
      1: get the array of days (the second entry in the resultOBj)
      2: for each possible day (7)  - create a key value pair -> day: color and put in the
      coloredDays object
      */
        console.log(possibleDays);
        let possibleColors = [
            "rgb(255, 102, 153)",
            "rgb(255, 77, 136)",
            "rgb(255, 51, 119)",
            "rgb(255, 26, 102)",
            "rgb(255, 0, 85)",
            "rgb(255, 0, 85)",
            "rgb(255, 0, 85)",
        ];

        for (let i = 0; i < possibleDays.length; i++) {
            coloredDays[possibleDays[i]] = possibleColors[i];
        }
        /* for through each result
        1: create a new MyDataPoint object and pass the properties from the db result entry to the object constructor
        2: set the color using the coloredDays object associated with the resultSet[i].day
        3:  put into the dataPoints array.
        **/
        //set background of parent ... for fun ..
        document.querySelector("#parent-wrapper").style.background =
            "rgba(255,0,0,.4)";
        description.textContent = "DEfAULT CASE";
        description.style.color = "rgb(255, 0, 85)";

        //last  element is the helper array...
        for (let i = 0; i < resultSet.length - 1; i++) {
            dataPoints.push(
                new myDataPoint(
                    resultSet[i].dataId,
                    resultSet[i].day,
                    resultSet[i].weather,
                    resultSet[i].start_mood,
                    resultSet[i].after_mood,
                    resultSet[i].after_mood_strength,
                    resultSet[i].event_affect_strength,
                    resultSet[i].event_name,
                    //map to the day ...
                    coloredDays[resultSet[i].day],
                    //last parameter is where should this go...
                    document.querySelector("#childOne"),
                    //which css style///
                    "point"
                )
            );

            /** this code is rather brittle - but does the job for now .. draw a grid of data points ..
             //*** drawing a grid ****/
            if (i % NUM_COLS === 0) {
                //reset x and inc y (go to next row)
                xPos = 0;
                yPos += CELL_SIZE;
            } else {
                //just move along in the column
                xPos += CELL_SIZE;
            }
            //update the position of the data point...
            dataPoints[i].update(xPos, yPos);
        } //for
        document.querySelector("#childOne").style.height = `${yPos + CELL_SIZE}px`;
    } //function

    function displayBubbles(resultObj) {
        dataPoints = [];
        const container = document.querySelector("#childOne");
        const height = 600;
        container.style.height = height + "px";

        document.querySelector("#parent-wrapper").style.background = "#e6f7ff";
        description.textContent = "POSITIVE AFTER MOODS — FLOATING UP";
        description.style.color = "#3399ff";

        let resultSet = resultObj.results;

        resultSet.forEach((d, i) => {
            let size = 5 + d.after_mood_strength * 3;

            let p = new myDataPoint(
                d.dataId, d.day, d.weather, d.start_mood,
                d.after_mood, d.after_mood_strength,
                d.event_affect_strength, d.event_name,
                "rgba(51,153,255,.6)",
                container,
                "point_two"
            );

            p.container.style.width = size + "px";
            p.container.style.height = size + "px";
            p.container.style.borderRadius = "50%";

            let x = Math.random() * window.innerWidth;
            let y = height + Math.random() * 200;
            let speed = 0.3 + d.after_mood_strength * 0.15;

            function animate() {
                y -= speed;
                x += Math.sin(y * 0.01) * 0.5;

                if (y < -20) {
                    y = height + Math.random() * 100;
                }
                p.update(x, y);
                requestAnimationFrame(animate);
            }

            animate();
        });
    }

    function displaySteam(resultObj) {
        dataPoints = [];
        const container = document.querySelector("#childOne");
        container.style.height = "500px";

        document.querySelector("#parent-wrapper").style.background = "#1a1a1a";
        description.textContent = "NEGATIVE MOODS — WEATHER PRESSURE";
        description.style.color = "#ccc";

        let resultSet = resultObj.results;
        let weatherGroups = {};

        resultSet.forEach(d => {
            if (!weatherGroups[d.weather]) weatherGroups[d.weather] = [];
            weatherGroups[d.weather].push(d);
        });

        let index = 0;
        for (let weather in weatherGroups) {
            let baseX = 150 + index * 200;
            let baseY = 380;

            // hole
            let hole = document.createElement("div");
            hole.style.position = "absolute";
            hole.style.left = baseX - 40 + "px";
            hole.style.top = baseY + "px";
            hole.style.width = "80px";
            hole.style.height = "20px";
            hole.style.borderRadius = "50%";
            hole.style.background = "#000";
            container.appendChild(hole);

            weatherGroups[weather].forEach(d => {
                let p = new myDataPoint(
                    d.dataId, d.day, d.weather, d.start_mood,
                    d.after_mood, d.after_mood_strength,
                    d.event_affect_strength, d.event_name,
                    "rgba(200,200,200,.6)",
                    container,
                    "point_two"
                );

                let y = baseY;
                let speed = 0.2 + d.after_mood_strength * 0.2;

                function animate() {
                    y -= speed;
                    if (y < baseY - d.after_mood_strength * 40) {
                        y = baseY;
                    }
                    p.update(baseX + Math.random() * 20 - 10, y);
                    requestAnimationFrame(animate);
                }

                animate();
            });
            index++;
        }
    }

    function displayEventsSorted(resultObj) {
        dataPoints = [];
        const container = document.querySelector("#childOne");

        document.querySelector("#parent-wrapper").style.background = "#2d1b4e";
        description.textContent = "ALL ENTRIES — BY EVENT NAME";
        description.style.color = "#b794f6";

        let resultSet = resultObj.results;
        // group by event name
        let eventGroups = {};
        resultSet.forEach(d => {
            if (!eventGroups[d.event_name]) {
                eventGroups[d.event_name] = [];
            }
            eventGroups[d.event_name].push(d);
        });

        // Colors
        let eventColors = [
            "rgba(138, 43, 226, 0.7)",
            "rgba(104,5,176,0.7)",
            "rgba(147, 112, 219, 0.7)",
            "rgba(153, 50, 204, 0.7)",
            "rgba(186, 85, 211, 0.7)",
            "rgba(148, 0, 211, 0.7)",
            "rgba(199, 21, 133, 0.7)",
            "rgba(218, 112, 214, 0.7)",
            "rgba(238, 130, 238, 0.7)",
            "rgba(221, 160, 221, 0.7)",
        ];

        let colorIndex = 0;
        let columnX = 80;
        const columnSpacing = 90;
        let maxHeight = 0;

        // Create the cols for each event
        for (let eventName in eventGroups) {
            let entries = eventGroups[eventName];
            let color = eventColors[colorIndex % eventColors.length];

            // Create event label
            let label = document.createElement("div");
            label.style.position = "absolute";
            label.style.left = (columnX - 20) + "px";
            label.style.top = "80px";
            label.style.color = color;
            label.style.fontSize = "11px";
            label.style.fontWeight = "bold";
            label.style.width = "100px";
            label.style.textAlign = "center";
            label.style.transform = "rotate(-45deg)";
            label.style.transformOrigin = "left top";
            label.textContent = eventName;
            container.appendChild(label);

            // Display vertically in the specific col
            entries.forEach((d, i) => {
                let p = new myDataPoint(
                    d.dataId, d.day, d.weather, d.start_mood,
                    d.after_mood, d.after_mood_strength,
                    d.event_affect_strength, d.event_name,
                    color,
                    container,
                    "point_two"
                );

                let yPos = 150 + (i * 12);
                p.update(columnX, yPos);
                maxHeight = Math.max(maxHeight, yPos);
            });

            columnX += columnSpacing;
            colorIndex++;
        }

        container.style.height = (maxHeight + 50) + "px";
    }

    function displayStrengthMeter(resultObj) {
        dataPoints = [];
        const container = document.querySelector("#childOne");

        document.querySelector("#parent-wrapper").style.background = "#1a2332";
        description.textContent = "MONDAY/TUESDAY — SORTED BY EVENT AFFECT STRENGTH";
        description.style.color = "#4fc3f7";

        let resultSet = resultObj.results;

        // Create strength scale labels
        let scaleLabel = document.createElement("div");
        scaleLabel.style.position = "absolute";
        scaleLabel.style.left = "20px";
        scaleLabel.style.top = "100px";
        scaleLabel.style.color = "#4fc3f7";
        scaleLabel.style.fontSize = "14px";
        scaleLabel.style.fontWeight = "bold";
        scaleLabel.textContent = "AFFECT STRENGTH →";
        container.appendChild(scaleLabel);

        // Create strength zones with labels
        for (let i = 0; i <= 10; i++) {
            let marker = document.createElement("div");
            marker.style.position = "absolute";
            marker.style.left = (180 + i * 80) + "px";
            marker.style.top = "100px";
            marker.style.width = "1px";
            marker.style.height = "500px";
            marker.style.background = `rgba(79, 195, 247, ${0.1 + i * 0.05})`;
            container.appendChild(marker);

            let label = document.createElement("div");
            label.style.position = "absolute";
            label.style.left = (175 + i * 80) + "px";
            label.style.top = "75px";
            label.style.color = "#4fc3f7";
            label.style.fontSize = "10px";
            label.textContent = i;
            container.appendChild(label);
        }

        // Color by day
        let dayColors = {
            "Monday": "rgba(255, 107, 107, 0.8)",
            "Tuesday": "rgba(78, 205, 196, 0.8)"
        };

        // Stack points based on event_affect_strength
        let heightTracker = {}; // keep track of heights at each strength level
        let maxHeight = 0; // keep track of maximum height for container sizing

        resultSet.forEach(d => {
            let strength = d.event_affect_strength;
            let xBase = 180 + strength * 80;

            // Initialize height tracker for this strength level
            if (!heightTracker[xBase]) {
                heightTracker[xBase] = 140;
            }

            let color = dayColors[d.day] || "rgba(150, 150, 150, 0.8)";

            let p = new myDataPoint(
                d.dataId, d.day, d.weather, d.start_mood,
                d.after_mood, d.after_mood_strength,
                d.event_affect_strength, d.event_name,
                color,
                container,
                "point_two"
            );
            // change size
            let size = 8 + strength;
            p.container.style.width = size + "px";
            p.container.style.height = size + "px";
            p.container.style.borderRadius = "50%";

            // Add offset
            let xOffset = Math.random() * 30 - 15;

            p.update(xBase + xOffset, heightTracker[xBase]);
            heightTracker[xBase] += (size + 3);

            maxHeight = Math.max(maxHeight, heightTracker[xBase]);
        });

        // Legend by day
        let mondayLegend = document.createElement("div");
        mondayLegend.style.position = "absolute";
        mondayLegend.style.left = "20px";
        mondayLegend.style.top = "130px";
        mondayLegend.style.color = dayColors["Monday"];
        mondayLegend.style.fontSize = "12px";
        mondayLegend.style.fontWeight = "bold";
        mondayLegend.innerHTML = "● Monday";
        container.appendChild(mondayLegend);

        let tuesdayLegend = document.createElement("div");
        tuesdayLegend.style.position = "absolute";
        tuesdayLegend.style.left = "20px";
        tuesdayLegend.style.top = "150px";
        tuesdayLegend.style.color = dayColors["Tuesday"];
        tuesdayLegend.style.fontSize = "12px";
        tuesdayLegend.style.fontWeight = "bold";
        tuesdayLegend.innerHTML = "● Tuesday";
        container.appendChild(tuesdayLegend);

        // Adjust container
        container.style.height = (maxHeight + 50) + "px";
    }

};