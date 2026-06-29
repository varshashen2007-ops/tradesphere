const { io } = require("socket.io-client");

const socket = io("http://localhost:5000");

socket.on("connect", () => {
    console.log("Connected:", socket.id);

    socket.emit("subscribe:stock", "RELIANCE");
    socket.emit("subscribe:stock", "TCS");
});

socket.on("price:tick", (tick) => {
    console.log(
        `[${tick.symbol}] ₹${tick.price} | ${tick.changePercent > 0 ? "+" : ""}${tick.changePercent}%`
    );
});

socket.on("disconnect", () => {
    console.log("Disconnected");
});