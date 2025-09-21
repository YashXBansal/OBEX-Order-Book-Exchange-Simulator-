import { Router } from "express";
import { Decimal } from "decimal.js";
import { processOrder } from "../engine";
import { Order } from "../types";
import { orderBook, updateBook, getNextOrderId } from "../state";
import { engineEmitter } from "../websocket";

const router = Router();

// Endpoint to view the current order book
router.get("/orderbook", (req, res) => {
  const response = {
    bids: Object.fromEntries([...orderBook.bids]),
    asks: Object.fromEntries([...orderBook.asks]),
  };
  res.json(response);
});

// Endpoint to submit a new order
router.post("/order", (req, res) => {
  const { side, quantity, price } = req.body;

  if (side !== "buy" && side !== "sell") {
    return res
      .status(400)
      .json({ message: "Invalid order side. Must be 'buy' or 'sell'." });
  }

  const newOrder: Order = {
    orderId: getNextOrderId(),
    side,
    quantity: new Decimal(quantity),
    price: new Decimal(price),
    timestamp: Date.now(),
  };

  const { newBook, trades } = processOrder(orderBook, newOrder);
  updateBook(newBook);
  if (trades.length > 0) {
    engineEmitter.emit("update", { type: "NEW_TRADES", payload: trades });
  }

  console.log("Trades Executed:", trades);
  res.json({ message: "Order processed successfully", trades });
});

export default router;
