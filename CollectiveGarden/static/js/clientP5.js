let bgImg, bucketImg, sickleImg;
let plantImageCache = {};
let selectedPlant = null;
let sunX = 0, sunY = 100, sunSpeed = 0.5;
// growth of the plants
const GROWTH_0_TO_1 = 30;   // 30 seconds
const GROWTH_1_TO_2 = 60;   // 1:00
const GROWTH_2_TO_3 = 140;  // 2:20
const WILTING_SECONDS = 5;  // 5 seconds

let sketch = function (s) {
    // loads the images needed
    s.preload = function () {
        bgImg = s.loadImage('/static/images/dirt.png');
        bucketImg = s.loadImage('/static/images/bucket.png');
        sickleImg = s.loadImage('/static/images/sickle.png');
    };
    // setup function
    s.setup = function () {
        s.createCanvas(window.innerWidth, window.innerHeight).parent('p5-container');
        s.imageMode(s.CENTER);
        s.noStroke();

        s.mousePressed = () => handleClick(s);
        s.mouseMoved = () => handleHover(s);
    };
    // draw function
    s.draw = function () {
        drawSky(s);
        drawSun(s);
        drawBackground(s);
        // displays the image for the action chosen for a nice "animation"
        if (wateringMode) s.image(bucketImg, s.mouseX, s.mouseY, 50, 50);
        if (harvestingMode) s.image(sickleImg, s.mouseX, s.mouseY, 50, 50);

        plants.forEach(updatePlantState);
        plants.forEach(p => drawPlant(s, p));

// stats box
s.push();
s.textAlign(s.LEFT, s.TOP);
s.textSize(13);

const statsX = 12;
const statsY = 12;
const statsW = 160;
const statsH = 50;

// background
s.fill(0, 0, 0, 120);
s.stroke(255);
s.strokeWeight(1.5);
s.rect(statsX, statsY, statsW, statsH, 8);

// text
s.noStroke();
s.fill(255);
s.text(`Number of plants: ${plants.length}`, statsX + 10, statsY + 8);
s.text(`Sunlight: ${conditions.sunlight}%`, statsX + 10, statsY + 28);

s.pop();

    };
};
new p5(sketch);

// functions to handle input logic
function handleClick(s) {
    if (!user.name) return;
    const target = event.target;
    const skyHeight = s.height / 3;
    let clicked = null;
    // checks if the user clicked on an UI element if so dont create a new plant
    if (
        target.closest('#waterToggleBtn') ||
        target.closest('#plantSelector') ||
        target.closest('#harvestToggleBtn') ||
        target.closest('#chatContainer') ||
        target.closest('#chatToggleBtn') ||
        target.closest('#statsOverlay') ||
        target.id === 'chatInput' ||
        target.id === 'chatSend'
    ) {
        return; // ignore click on UI elements
    }
    // check if the mouse is in the sky region, if yes don't plant anything
    if (s.mouseY < skyHeight) return;

    // checks if the user clicked on an existing plant
    for (let i = plants.length - 1; i >= 0; i--) {
        const p = plants[i];
        if (Math.hypot(s.mouseX - p.x, s.mouseY - p.y) < 30) {
            clicked = p;
            break;
        }
    }
    // open stats menu for selected plant
    if (clicked) {
        selectedPlant = clicked;
        showStatsOverlay(clicked);
    } else sendNewPlant(s.mouseX, s.mouseY); // creates a new plant
}
// function to handle hover action
function handleHover(s) {
    // checks if the ui elements for water/harvest were selected
    if (wateringMode || harvestingMode) {
        for (let p of plants) {
            if (p.isDry || p.stage === 4) continue; // checks if it can water the plant
            if (Math.hypot(s.mouseX - p.x, s.mouseY - p.y) < 30) {
                if (wateringMode) socket.emit("waterPlant", {plant_id: p._id});
                if (harvestingMode && p.stage === 2) socket.emit("harvestPlant", {plant_id: p._id});
                return;
            }
        }
    }
}
// draws the blue sky
function drawSky(s) {
    s.push();
    s.noStroke();
    s.fill(135, 206, 235);
    s.rect(0, 0, s.width, s.height / 3);
    s.pop();
}
// function to move and display the sun based on active user count
function drawSun(s) {
    const sunBrightness = conditions.sunlight || 50;
    const sunRadius = 40 + sunBrightness / 2;
    s.push();
    s.fill(255, 255, 150, 150 + sunBrightness);
    s.noStroke();
    s.ellipse(sunX, sunY, sunRadius * 2);
    s.pop();
    sunX += sunSpeed;
    if (sunX > s.width + 50) sunX = -50; // bring back sun
}
// draws the dirt image on the canvas
function drawBackground(s) {
    s.push();
    let r = 150 + (conditions.sunlight || 50) * 1.2;
    let g = 120 + (conditions.sunlight || 50) * 0.6;// the image will be tinted based
    let b = 80 + (conditions.sunlight || 50) * 0.3;  // on how many users are active
    s.tint(r, g, b);
    s.imageMode(s.CORNER);
    s.image(bgImg, 0, s.height / 3, s.width, s.height - s.height / 3);
    s.pop();
}
// draw current plant on canvas
function drawPlant(s, p) {
    const stage = p.isDry ? 4 : (p.stage || 0);
    const folder = p.type || "sunflower";
    const imgPath = `/static/images/${folder}/stage${stage}.png`;

    if (!plantImageCache[imgPath]) plantImageCache[imgPath] = s.loadImage(imgPath);
    const img = plantImageCache[imgPath];
    if (img && img.width > 0) s.image(img, p.x, p.y, 100, 100);


    if (!p.isDry) {
        const waterPct = getCurrentWater(p);
        s.fill(0, 0, 0, 160);
        s.rect(p.x - 18, p.y + 28, 36, 6, 3);
        s.fill(60, 170, 255);
        s.rect(p.x - 18, p.y + 28, 36 * (waterPct / 100), 6, 3);
    }

    // Draws countdown text
    const timeLeft = getTimeUntilNextStage(p);

    if (timeLeft !== null) {
        let textValue;

        if (p.stage === 2) {
            textValue = "READY";
        } else {
            const mins = Math.floor(timeLeft / 60);
            const secs = Math.floor(timeLeft % 60).toString().padStart(2, '0');
            textValue = `⏳ ${mins}:${secs}`;
        }
        s.fill(255);
        s.textSize(12);
        s.textAlign(s.CENTER);
        s.text(textValue, p.x, p.y + 42);
    }
}

//update the stage of growth
function updatePlantState(p) {
    if (p.isDry) {
        p.stage = 4;
        return;
    }

    const now = new Date();
    const lastWatered = new Date(p.last_watered_at || p.planted_at);
    const decaySteps = Math.floor((now - lastWatered) / 1000 / 15);
    const waterPct = Math.max(0, 100 - decaySteps * 10);
    if (waterPct <= 0) {
        p.isDry = true;
        p.stage = 4;
        return;
    }

    if (p.harvested_at) {
        if ((now - new Date(p.harvested_at)) / 1000 < 10) p.stage = 3;
        else socket.emit("removePlant", {plant_id: p._id});
        return;
    }

    const plantedAt = new Date(p.planted_at);
    const ageSec = (now - plantedAt) / 1000;

    // decide stage using cumulative thresholds
    if (ageSec < GROWTH_0_TO_1) {
        p.stage = 0;
    } else if (ageSec < (GROWTH_0_TO_1 + GROWTH_1_TO_2)) {
        p.stage = 1;
    } else {
        // if the plant is the sum of the two it is ready for harvest
        p.stage = 2;
    }
}

// Countdown until next stage using the growth constants
function getTimeUntilNextStage(p) {
    if (!p.planted_at) return null;
    const plantedAt = new Date(p.planted_at);
    const now = new Date();
    const age = (now - plantedAt) / 1000; // seconds
    // countdown for the plant growth
    if (p.stage === 0) {
        return Math.max(0, GROWTH_0_TO_1 - age);
    }
    if (p.stage === 1) {
        return Math.max(0, (GROWTH_0_TO_1 + GROWTH_1_TO_2) - age);
    }
    if (p.stage === 2) {
        return Math.max(0, (GROWTH_0_TO_1 + GROWTH_1_TO_2 + GROWTH_2_TO_3) - age);
    }
    if (p.stage === 3) {
        const harvestedAt = new Date(p.harvested_at);
        const t = (now - harvestedAt) / 1000;
        return Math.max(0, WILTING_SECONDS - t);
    }
    return null;
}

