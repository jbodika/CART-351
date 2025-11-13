window.addEventListener("load", () => {
    const form = document.getElementById("userForm");


// Get popup elements
    const pop_up = document.getElementById("userFormPopUp");
    const openBtn = document.getElementById("openFormBtn");
    const closeBtn = document.querySelector(".close-btn");

// Open popup
    openBtn.addEventListener("click", () => {
        pop_up.style.display = "block";
    });

// Close popup
    closeBtn.addEventListener("click", () => {
        pop_up.style.display = "none";
    });

// Close popup when clicking outside
    window.addEventListener("click", (e) => {
        if (e.target === pop_up) {
            pop_up.style.display = "none";
        }
    });


    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = {
            name: document.getElementById("name").value,
            coordinates: getMostStayedCoordinate()
        };

        try {
            // POST
            const res = await fetch("/submit_data", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data)
            });

            const result = await res.json();
            if (result.status === "success") {
                // redirect the user to the data page
                window.location.href = "/data_page";
            } else {
                alert("Something went wrong while submitting your data.");
            }

        } catch (err) {
            console.error(err);
            alert("Error submitting data.");
        }
    });
});

// gets the most frequent coordinate value
function getMostStayedCoordinate() {
    let maxCount = 0;
    let maxKey = null;
    for (const key in coordinateCounter) {
        if (coordinateCounter[key] > maxCount) {
            maxCount = coordinateCounter[key];
            maxKey = key;
        }
    }
    // returns a combination
    if (!maxKey) return {x: 0, y: 0};
    const [x, y] = maxKey.split("-").map(Number);
    return {x, y};
}
