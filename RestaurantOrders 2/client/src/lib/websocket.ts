let socket: WebSocket | null = null;
let messageHandlers: ((data: any) => void)[] = [];

export function connectWebSocket(
  onOpen?: () => void,
  onClose?: () => void,
  onError?: (error: Event) => void
) {
  if (socket?.readyState === WebSocket.OPEN) {
    return;
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/ws`;

  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log('WebSocket connected');
    onOpen?.();
  };

  socket.onclose = () => {
    console.log('WebSocket disconnected');
    onClose?.();
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
    onError?.(error);
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      messageHandlers.forEach(handler => handler(data));
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  };
}

export function disconnectWebSocket() {
  if (socket) {
    socket.close();
    socket = null;
  }
}

export function sendMessage(message: any) {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  }
}

export function onMessage(handler: (data: any) => void) {
  messageHandlers.push(handler);
  
  return () => {
    messageHandlers = messageHandlers.filter(h => h !== handler);
  };
}
