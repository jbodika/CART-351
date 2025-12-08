// client.js
let socket = io();
let user = {name: null};
let plants = [];
let conditions = {sunlight: 50, plant_count: 0};
let selectedPlantType = "sunflower";
let wateringMode = false;
let harvestingMode = false;
const STAGE_NAMES = {
    0: "Recently Planted",
    1: "Growing",
    2: "Ready to Harvest",
    3: "Wilting",
    4: "Dry / Dead"
};

window.onload = function () {
    // DOM elements
    const joinBtn = document.getElementById("joinBtn");
    const uNameInput = document.getElementById('uName');
    const statsOverlay = document.getElementById('statsOverlay');
    const chatInput = document.getElementById('chatInput');
    const chatSend = document.getElementById('chatSend');
    const chatList = document.getElementById('chatList');
    const chatToggleBtn = document.getElementById('chatToggleBtn');
    const chatContainer = document.getElementById('chatContainer');
    const plantSelector = document.getElementById("plantSelector");
    const waterToggleBtn = document.getElementById("waterToggleBtn");
    const harvestToggleBtn = document.getElementById("harvestToggleBtn");

    const plantEmoji = {
        sunflower: "🌻",
        grapes: "🍇",
        pineapple: "🍍",
        cauliflower: "⬜",
        pumpkin: "🎃",
        jalapeños: "🌶️",
        wheat: "🌾"
    };

    // --- User registration ---
    if (typeof USERNAME !== "undefined" && USERNAME) {
        user.name = USERNAME;
        socket.emit("registerUser", USERNAME);
    }

    if (joinBtn) {
        joinBtn.onclick = () => {
            const name = (uNameInput.value || "anonymous").trim();
            user.name = name;
            socket.emit("registerUser", name);
            document.getElementById("namePrompt").style.display = "none";
        };
    }

    // --- Chat toggle ---
    chatToggleBtn.onclick = () => {
        if (chatContainer.style.display === 'none') {
            chatContainer.style.display = 'block';
            chatToggleBtn.style.background = 'rgba(0,150,255,0.4)';
        } else {
            chatContainer.style.display = 'none';
            chatToggleBtn.style.background = 'rgba(255,255,255,0.08)';
        }
    };

    // --- Mode toggles ---
    waterToggleBtn.onclick = () => {
        wateringMode = !wateringMode;
        if (wateringMode) harvestingMode = false;
        waterToggleBtn.style.background = wateringMode ? "rgba(0,150,255,0.4)" : "rgba(255,255,255,0.08)";
    };

    harvestToggleBtn.onclick = () => {
        harvestingMode = !harvestingMode;
        if (harvestingMode) wateringMode = false;
        harvestToggleBtn.style.background = harvestingMode ? "rgba(220,220,136,0.7)" : "rgba(255,255,255,0.08)";
    };

    // --- Plant selection buttons ---
    Object.keys(plantEmoji).forEach(type => {
        const btn = document.createElement("div");
        btn.className = "plantBtn";
        btn.dataset.type = type;
        btn.innerHTML = plantEmoji[type] || "🍀";

        if (type === selectedPlantType) btn.classList.add("active");

        btn.onclick = () => {
            selectedPlantType = type;
            document.querySelectorAll('.plantBtn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        };

        plantSelector.appendChild(btn);
    });

    // --- Chat send ---
    chatSend.onclick = () => {
        const text = (chatInput.value || '').trim();
        if (!text) return;
        socket.emit('sendMessage', {user: user.name || 'anon', text});
        chatInput.value = '';
    };

    // --- Socket handlers ---
    socket.on('initialGarden', payload => {
        plants = payload.plants || [];
        conditions = payload.conditions || conditions;
    });

    socket.on('plantAdded', p => {
        if (!plants.some(x => x._id === p._id)) plants.push(p);
    });
    socket.on('plantUpdated', p => {
        const idx = plants.findIndex(x => x._id === p._id);
        if (idx !== -1) plants[idx] = {...plants[idx], ...p};
        else plants.push(p);
    });
    socket.on('plantRemoved', data => {
        plants = plants.filter(p => p._id !== data.plant_id);
    });
    socket.on('plantLimitReached', msg => alert(msg.error));
    socket.on('conditionsUpdated', c => conditions = c);
    socket.on('chatMessage', m => {
        const li = document.createElement('div');
        li.className = 'chatItem';
        li.textContent = `${m.user}: ${m.text}`;
        chatList.appendChild(li);
        chatList.scrollTop = chatList.scrollHeight;
    });

    // --- Send new plant ---
    window.sendNewPlant = function (x, y) {
        for (let p of plants) {
            if (Math.hypot(p.x - x, p.y - y) < 20) {
                x += 18;
                y += 12;
                break;
            }
        }
        socket.emit('newPlant', {
            x,
            y,
            planted_at: new Date().toISOString(),
            gardener: user.name,
            type: selectedPlantType
        });
    };

    // --- Send water ---
    window.sendWater = function (plant_id) {
        socket.emit('waterPlant', {plant_id});
    };

    // --- Get water %
    window.getCurrentWater = function (p) {
        const lastWatered = new Date(p.last_watered_at || p.planted_at);
        const missingSec = (new Date() - lastWatered) / 1000;
        const decaySteps = Math.floor(missingSec / 15);
        return Math.max(0, 100 - decaySteps * 10);
    };


    window.showStatsOverlay = function (p) {
        const statsOverlay = document.getElementById('statsOverlay');
        statsOverlay.style.display = 'block';

        const left = Math.min(window.innerWidth - 220, p.x + 40);
        const top = Math.max(12, p.y - 40);

        statsOverlay.style.left = left + 'px';
        statsOverlay.style.top = top + 'px';

        statsOverlay.innerHTML = `
      <div style="position: relative; background:rgba(255,255,255,0.5); color:#000; padding:8px; border-radius:6px; width:200px;">
        <button id="closeOverlay" style="position:absolute; top:4px; right:4px; border:none; background:none; font-weight:bold; cursor:pointer;">✖</button>
        <div style="text-align: center"><strong>${p.type.charAt(0).toUpperCase() + p.type.slice(1)}</strong></div>
        <div><strong>Gardener:</strong> ${p.gardener}</div>
        <div><strong>Growth Stage:</strong> ${STAGE_NAMES[p.stage]}</div>
        <div><strong>Water:</strong> ${getCurrentWater(p)}%</div>
        <button id="harvestBtn" style="background-color: #95b477" class="btn">Harvest</button>
        <button id="waterBtn" style="background-color: #4a7ea1" class="btn">Water</button>
        <div style="margin-top:8px; text-align:right;">
            <button id="removeBtn" class="btn danger">Remove Plant</button>
        </div>
      </div>
    `;

        // Close overlay
        document.getElementById('closeOverlay').onclick = e => {
            e.stopPropagation();
            window.hideStatsOverlay();
        };

        document.getElementById('waterBtn').onclick = e => {
            e.stopPropagation();
            if (p.stage === 4) return alert("This plant is dry and cannot be watered!");
            startWatering(p);
            window.hideStatsOverlay();
        };

        document.getElementById('harvestBtn').onclick = e => {
            e.stopPropagation();
            if (p.stage === 4) return alert("This plant is dry and cannot be harvested!");
            if (p.stage !== 2) return alert("Plant is not ready to harvest!");
            socket.emit("harvestPlant", {plant_id: p._id});
            window.hideStatsOverlay();
        };

        document.getElementById('removeBtn').onclick = e => {
            e.stopPropagation();
            socket.emit("removePlant", {plant_id: p._id});
            window.hideStatsOverlay();
        };
    };

    window.hideStatsOverlay = function () {
        const statsOverlay = document.getElementById('statsOverlay');
        statsOverlay.style.display = 'none';
        statsOverlay.innerHTML = '';
    };

};