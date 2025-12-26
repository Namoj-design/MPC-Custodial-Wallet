import WebSocket from "ws";

const ws = new WebSocket("ws://localhost:3001");

ws.on("open", () => {
  console.log("[CLIENT] connected");

  // join session (create if not exists)
  ws.send(
    JSON.stringify({
      type: "join",
    })
  );
});

ws.on("message", (data) => {
  const msg = JSON.parse(data.toString());
  console.log("[CLIENT] received:", msg);

  // after join, send a test MPC message
  if (msg.type === "joined") {
    setTimeout(() => {
      ws.send(
        JSON.stringify({
          type: "mpc",
          sessionId: msg.sessionId,
          payload: {
            round: 1,
            value: `hello from ${msg.clientId}`,
          },
        })
      );
    }, 2000);
  }
});