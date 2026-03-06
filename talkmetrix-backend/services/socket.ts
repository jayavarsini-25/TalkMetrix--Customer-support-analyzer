let socket: WebSocket | null = null;

export function connectSocket(onUpdate: () => void) {
  socket = new WebSocket("ws://127.0.0.1:8000/ws");

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.event === "audit_uploaded") {
      onUpdate();
    }
  };
}