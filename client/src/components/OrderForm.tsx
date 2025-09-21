import React, { useState } from "react";

export function OrderForm() {
  const [side, setSide] = useState("buy");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!price || !quantity || Number(price) <= 0 || Number(quantity) <= 0) {
      alert("Please enter a valid price and quantity.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          side,
          price,
          quantity,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit order");
      }

      // Order submitted successfully, the WebSocket will handle the UI update
      console.log("Order submitted successfully");

      // Clear form for next order
      setPrice("");
      setQuantity("");
    } catch (error) {
      console.error(error);
      alert("Error submitting order.");
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
      <h2 className="text-xl font-bold mb-4 text-center text-purple-400">
        Place an Order
      </h2>
      <form onSubmit={handleSubmit} className="flex items-end gap-4">
        <div className="flex-grow">
          <label
            htmlFor="side"
            className="block text-sm font-medium text-gray-400"
          >
            Side
          </label>
          <select
            id="side"
            value={side}
            onChange={(e) => setSide(e.target.value)}
            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50"
          >
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </div>
        <div className="flex-grow">
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-400"
          >
            Price (INR)
          </label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g., 25000"
            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50"
          />
        </div>
        <div className="flex-grow">
          <label
            htmlFor="quantity"
            className="block text-sm font-medium text-gray-400"
          >
            Quantity
          </label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="e.g., 10"
            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
