import { useEffect, useRef, useState } from "react";
import { connectWebSocket, disconnectWebSocket, onMessage, sendMessage } from "@/lib/websocket";

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    const connect = () => {
      connectWebSocket(
        () => {
          setIsConnected(true);
          reconnectAttempts.current = 0;
        },
        () => {
          setIsConnected(false);
          // Attempt to reconnect
          if (reconnectAttempts.current < maxReconnectAttempts) {
            reconnectAttempts.current++;
            setTimeout(connect, 3000 * reconnectAttempts.current);
          }
        },
        (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
        }
      );
    };

    connect();

    // Set up message listener
    const unsubscribe = onMessage((data) => {
      setLastMessage(data);
    });

    return () => {
      unsubscribe();
      disconnectWebSocket();
    };
  }, []);

  return {
    isConnected,
    lastMessage,
    sendMessage
  };
}
