window.onload = async function () {
    const htmlForm = document.querySelector("#insertPlantFormFetch");

    const formData = new FormData(htmlForm);
    const queryParams = new URLSearchParams(formData).toString();
    const url = `/getDataFromForm?${queryParams}`;

    document.querySelector("#results").innerHTML +=
        `<p> THE NEW RESULT: <mark style = "background:orange">${resJSON.data_received}</mark></p>
       <p> THANK YOU : <mark style = "background:orange">${resJSON.owner}</mark></p>`

    try {
        let res = await fetch(url)
        let resJSON = await res.json()
        console.log(resJSON)

    } catch (err) {
        console.log(err)
    }
    console.log("loaded script_get.js");
    document.querySelector("#insertPlantFormFetch").addEventListener("submit", async function (event) {
        event.preventDefault();
        console.log("button clicked");
    })

}

document.querySelector("#reg_thank").innerHTML =
    `<h3> Thank you 
        <span class = "highlight">${resJSON.f_name}</span> for registering !</h3>`;