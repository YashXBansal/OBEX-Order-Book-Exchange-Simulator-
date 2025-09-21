import { useState, useEffect } from "react";

type OrderBookState = { [price: string]: { quantity: string }[] };
type Trade = {
  price: string;
  quantity: string;
  timestamp: number;
  takerSide: "buy" | "sell";
};

export function MarketDisplay() {
  const [bids, setBids] = useState<OrderBookState>({});
  const [asks, setAsks] = useState<OrderBookState>({});
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3001");
    ws.onopen = () => console.log("WebSocket connected");
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // Use a switch to handle different event types from the server
      switch (data.type) {
        case "BOOK_UPDATE":
          setBids(data.payload.bids);
          setAsks(data.payload.asks);
          break;
        case "NEW_TRADES":
          // Prepend new trades to the list to show most recent first
          setTrades((prevTrades) => [...data.payload, ...prevTrades]);
          break;
      }
    };
    ws.onclose = () => console.log("WebSocket disconnected");
    return () => ws.close();
  }, []);

  const renderTableRows = (data: OrderBookState, isBids: boolean) => {
    const sortedData = Object.entries(data).sort((a, b) => {
      return isBids ? Number(b[0]) - Number(a[0]) : Number(a[0]) - Number(b[0]);
    });
    return sortedData.map(([price, orders]) => (
      <tr key={price}>
        <td className={`p-2 ${isBids ? "text-green-400" : "text-red-400"}`}>
          {Number(price).toLocaleString()}
        </td>
        <td className="p-2">
          {orders.reduce((total, order) => total + Number(order.quantity), 0)}
        </td>
      </tr>
    ));
  };

  return (
    <div className="flex justify-center gap-5 mt-8 text-sm">
      {/* Asks Container (Left Column) */}
      <div className="w-1/3 bg-gray-800 p-4 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-center text-red-400">
          Asks (Sell)
        </h2>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="p-2 text-left text-gray-400">Price (INR)</th>
              <th className="p-2 text-left text-gray-400">Quantity</th>
            </tr>
          </thead>
          <tbody>{renderTableRows(asks, false)}</tbody>
        </table>
      </div>

      {/* Trades Container (Center Column) */}
      <div className="w-1/3 bg-gray-800 p-4 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-center text-purple-400">
          Recent Trades
        </h2>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="p-2 text-left text-gray-400">Price</th>
              <th className="p-2 text-left text-gray-400">Quantity</th>
              <th className="p-2 text-left text-gray-400">Time</th>
            </tr>
          </thead>
          <tbody>
            {trades.slice(0, 20).map(
              (
                trade,
                index // Show last 20 trades
              ) => (
                <tr key={index}>
                  <td
                    className={`p-2 font-mono ${
                      trade.takerSide === "buy"
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {Number(trade.price).toLocaleString()}
                  </td>
                  <td className="p-2 font-mono">
                    {Number(trade.quantity).toLocaleString()}
                  </td>
                  <td className="p-2 font-mono text-gray-500">
                    {new Date(trade.timestamp).toLocaleTimeString()}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Bids Container (Right Column) */}
      <div className="w-1/3 bg-gray-800 p-4 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-center text-green-400">
          Bids (Buy)
        </h2>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="p-2 text-left text-gray-400">Price (INR)</th>
              <th className="p-2 text-left text-gray-400">Quantity</th>
            </tr>
          </thead>
          <tbody>{renderTableRows(bids, true)}</tbody>
        </table>
      </div>
    </div>
  );
}
