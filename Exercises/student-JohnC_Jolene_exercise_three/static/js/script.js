document.querySelector("#submitForm").addEventListener("click", (e) => {
  e.preventDefault();

  const feeling = document.querySelector('input[name="feeling"]:checked');
  const comments = document.querySelector("#comments").value;
  const msgDiv = document.querySelector("#responseDiv");
  const msg = document.querySelector("#responseMsg");

  fetch("/postDataFetch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      feeling: feeling.value,
      comments: comments
    })
  })
    .then(res => res.json())
    .then(data => {
      msg.textContent = data.message;
      msgDiv.classList.remove("hidden");

      // Reset classes
      msgDiv.className = "";
      msgDiv.classList.add("response");

      // Change color and animation style based on feeling
      const val = parseInt(feeling.value);
      switch (val) {
        case 1:
          msgDiv.style.background = "rgba(0,0,0,0.22)";
          msgDiv.classList.add("slide-up");
          break;
        case 2:
          msgDiv.style.background = "rgba(98,198,243,0.62)";
          msgDiv.classList.add("fade-in");
          break;
        case 3:
          msgDiv.style.background = "rgb(234,213,166)";
          msgDiv.classList.add("bounce");
          break;
        case 4:
          msgDiv.style.background = "rgb(198,158,213)";
          msgDiv.classList.add("pulse");
          break;
        case 5:
          msgDiv.style.background = "rgb(255,255,255)";
          msgDiv.classList.add("rainbow");
          break;
      }
    })
    .catch(() => {
      msg.textContent = "Something went wrong. Try again!";
      msgDiv.classList.remove("hidden");
      msgDiv.style.background = "rgba(255,0,0,0.3)";
      msgDiv.classList.add("shake");
    });
});
