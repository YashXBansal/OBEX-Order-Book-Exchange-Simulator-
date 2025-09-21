// server/src/orderbook.ts
import { OrderedMap } from "js-sdsl";
import { Decimal } from "decimal.js";
// FIX: Added 'Order' to the import list.
import { OrderBook, Order } from "./types";

export function createOrderBook(): OrderBook {
  return {
    // WHY: TypeScript needs to know what 'Order' is to correctly type this map.
    bids: new OrderedMap<Decimal, Order[]>([], (a: Decimal, b: Decimal) =>
      b.comparedTo(a)
    ),
    asks: new OrderedMap<Decimal, Order[]>(),
  };
}

export function getBestBid(book: OrderBook): Decimal | null {
  if (book.bids.empty()) return null;
  return book.bids.begin().pointer[0];
}

export function getBestAsk(book: OrderBook): Decimal | null {
  if (book.asks.empty()) return null;
  return book.asks.begin().pointer[0];
}
