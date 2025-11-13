// DECLARE VARIABLES
let heatmap;
let trail = [];
let seeUserData = false;
let coordinateCounter = {};
let previousHotspots = [];

let noise, filter, gainNode, lfo; // variables for the sound feature

window.addEventListener("load", async () => {

    // audio setup
    const playDiv = document.querySelector("#play");
    if (playDiv) {
        playDiv.addEventListener("click", async () => {
            await Tone.start();

            playDiv.style.display = "none";

            // add special effects to give airy sound
            noise = new Tone.Noise("pink").start();
            filter = new Tone.Filter(800, "lowpass").toDestination();
            gainNode = new Tone.Gain(0.2).connect(filter);
            lfo = new Tone.LFO(0.1, 400, 1500).connect(filter.frequency).start();
            noise.connect(gainNode);
        });
    }

    // Fetch previous users' coordinates
    try {
        const res = await fetch("/get_all_user_coordinates");
        const prevCoordinates = await res.json();

        const coordinatesCount = {};
        prevCoordinates.forEach(c => {
            const key = `${Math.floor(c.x)}-${Math.floor(c.y)}`;
            coordinatesCount[key] = (coordinatesCount[key] || 0) + 1;
        });

        previousHotspots = prevCoordinates.map(c => ({
            x: Math.floor(c.x),
            y: Math.floor(c.y),
            value: 100,   // intensity of heatmap
            name: c.name // keep name to display
        }));

        // Add all heatmaps to an array
        previousHotspots.forEach(h => heatmap.addData({
            x: h.x,
            y: h.y,
            value: h.value
        }));

    } catch (err) {
        console.log("Failed to load previous users:", err);
    }
});

// setup function
function setup() {
    const canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas');
    // initialize canvas
    heatmap = h337.create({container: document.querySelector('#canvas')});
}

// draw function
function draw() {
    background("black");

    // track current user's cursor trail
    trail.push({x: mouseX, y: mouseY});
    // check if length is more than 25 if yes delete ellipses
    if (trail.length > 25) trail.shift();

    noStroke();
    trail.forEach(t => {
        fill(0, 130, 255, 60);
        ellipse(t.x, t.y, 30);
    });

    // display user names
    textSize(16);
    fill("white");
    textAlign(LEFT, CENTER);
    previousHotspots.forEach(h => {
        text(`${h.name}`, h.x + 15, h.y); //added an offset to avoid overlapping
    });

    // increment current user's coordinate counter
    const key = `${Math.floor(mouseX)}-${Math.floor(mouseY)}`;
    coordinateCounter[key] = (coordinateCounter[key] || 0) + 1;

    displayCoordinates();

    // display coordinates button
    //if (seeUserData)
    drawCoordinatesButton()
    //displayCoordinates();
    //drawCoordinatesButton();
}

// display coordinates
function displayCoordinates() {
    const boxW = 180;
    const boxH = 60;
    const boxX = 20;
    const boxY = windowHeight - boxH - 100;

    fill(0, 0, 0, 180);
    stroke(255);
    rect(boxX, boxY, boxW, boxH, 10);

    fill(255);
    noStroke();
    textSize(16);
    textAlign(LEFT, CENTER);
    text(`X: ${Math.floor(mouseX)}`, boxX + 15, boxY + 20);
    text(`Y: ${Math.floor(mouseY)}`, boxX + 15, boxY + 40);
}

function drawCoordinatesButton() {
    fill(seeUserData ? 'limegreen' : 'lightgray');
    stroke(0);
    rect(15, 20, 100, 25, 5);
    fill(0);
    textSize(14);
    textAlign(CENTER, CENTER);
    text("View All Users", 65, 32);
}

function mousePressed() {
    if (mouseX > 15 && mouseX < 115 && mouseY > 20 && mouseY < 45) {
        seeUserData = !seeUserData;
        window.location.href = "/data_page"
    }
}

// helper map function credit to Daniel Setzer for this function (https://gist.github.com/dsetzer/db50397e99e8e4de915c27e851c69767)
function map(value, inMin, inMax, outMin, outMax) {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}
