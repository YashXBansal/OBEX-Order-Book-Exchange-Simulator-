// server/src/state.ts

import { createOrderBook } from "./orderbook";
import { OrderBook } from "./types";
import { engineEmitter } from "./websocket";

export let orderBook: OrderBook = createOrderBook();
export let orderIdCounter = 1;

function getSanitizedBook(book: OrderBook) {
  return {
    bids: Object.fromEntries([...book.bids]),
    asks: Object.fromEntries([...book.asks]),
  };
}

export const updateBook = (newBook: OrderBook) => {
  orderBook = newBook;
  engineEmitter.emit("update", {
    type: "BOOK_UPDATE",
    payload: getSanitizedBook(orderBook),
  });
};

export const getNextOrderId = () => {
  return orderIdCounter++;
};
