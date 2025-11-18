window.onload = function () {
    console.log("loaded")

    let uName = ""
    let io_client = io(); // uses js library
    let clientSocket = io_client.connect("http://127.0.0.1:5000");
    console.log(clientSocket)

    //inital handshake send to server
    document.querySelector("#uButton").addEventListener("click", function () {
        uName = document.querySelector("#uName").value;
        console.log(uName);
        //inital handshake send to server
        clientSocket.emit("join", uName);  // Notify server of new user

    });
    //receive notice from server :)
    clientSocket.on("join-complete", function (data) {
        console.log("server registered my join");
        //hide the username input
        document.querySelector(".username-container").style.display = "none"
    });

    document.querySelector("#chat").style.display = "block";
    document.querySelector("#sub").addEventListener("click", function (event) {
        event.preventDefault();
        let myMessage = document.querySelector("#message").value;
        console.log(myMessage);

        let dataToSend = {data: myMessage};
        clientSocket.emit("textData", dataToSend);
        let liitem = document.createElement("li");
        liitem.style = "list"
        liitem.innerHTML = `<span class="uTit">user: ${uName}</span> ------ <span class="uMessage">message: ${myMessage}</span>`;
        document.querySelector("#chatList").appendChild(liitem);
        document.querySelector("#message").value = "";
    });

    clientSocket.on("dataFromServer", function (incomingData) {
        console.log(incomingData.data);
        let liitem = document.createElement("li");
        liitem.style = "list";
        liitem.innerHTML = `<span class="uTit">user: ${incomingData.user}</span> ------ <span class="uMessage">message: ${incomingData.data}</span>`;
        document.querySelector("#chatList").appendChild(liitem);
    });
}

