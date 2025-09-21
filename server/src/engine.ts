// server/src/engine.ts
import { OrderedMap } from "js-sdsl";
import { Decimal } from "decimal.js";
import { OrderBook, Order, ProcessResult, Trade } from "./types";

export function processOrder(book: OrderBook, order: Order): ProcessResult {
  if (order.side === "buy") {
    return matchBuyOrder(book, order);
  } else {
    return matchSellOrder(book, order);
  }
}

function matchBuyOrder(book: OrderBook, buyOrder: Order): ProcessResult {
  const newBids = new OrderedMap([...book.bids], (a: Decimal, b: Decimal) =>
    b.comparedTo(a)
  );
  const newAsks = new OrderedMap([...book.asks]);
  const trades: Trade[] = [];

  while (buyOrder.quantity.greaterThan(0)) {
    const bestAskIterator = newAsks.begin();
    if (bestAskIterator.equals(newAsks.end())) {
      break;
    }

    const bestAskPrice = bestAskIterator.pointer[0];
    if (buyOrder.price.lessThan(bestAskPrice)) {
      break;
    }

    const ordersAtBestAsk = bestAskIterator.pointer[1];

    while (buyOrder.quantity.greaterThan(0) && ordersAtBestAsk.length > 0) {
      const sellOrder = ordersAtBestAsk[0];
      const tradeQuantity = Decimal.min(buyOrder.quantity, sellOrder.quantity);

      trades.push({
        takerOrderId: buyOrder.orderId,
        makerOrderId: sellOrder.orderId,
        quantity: tradeQuantity,
        price: sellOrder.price,
        timestamp: Date.now(),
        takerSide: "buy", 
      });

      buyOrder.quantity = buyOrder.quantity.minus(tradeQuantity);
      sellOrder.quantity = sellOrder.quantity.minus(tradeQuantity);

      if (sellOrder.quantity.isZero()) {
        ordersAtBestAsk.shift();
      }
    }

    if (ordersAtBestAsk.length === 0) {
      newAsks.eraseElementByKey(bestAskPrice);
    }
  }

  if (buyOrder.quantity.greaterThan(0)) {
    // FIX: The .find() method returns an iterator. We must check if it's valid
    // by comparing it to the .end() iterator before accessing its .pointer.
    const priceLevelIterator = newBids.find(buyOrder.price);
    if (!priceLevelIterator.equals(newBids.end())) {
      // Price level exists, so push the order into its queue.
      priceLevelIterator.pointer[1].push(buyOrder);
    } else {
      // Price level does not exist, so create it.
      newBids.setElement(buyOrder.price, [buyOrder]);
    }
  }

  return {
    newBook: { bids: newBids, asks: newAsks },
    trades: trades,
  };
}

function matchSellOrder(book: OrderBook, sellOrder: Order): ProcessResult {
  const newBids = new OrderedMap([...book.bids], (a: Decimal, b: Decimal) =>
    b.comparedTo(a)
  );
  const newAsks = new OrderedMap([...book.asks]);
  const trades: Trade[] = [];

  while (sellOrder.quantity.greaterThan(0)) {
    const bestBidIterator = newBids.begin();
    if (bestBidIterator.equals(newBids.end())) {
      break;
    }

    const bestBidPrice = bestBidIterator.pointer[0];
    if (sellOrder.price.greaterThan(bestBidPrice)) {
      break;
    }

    const ordersAtBestBid = bestBidIterator.pointer[1];

    while (sellOrder.quantity.greaterThan(0) && ordersAtBestBid.length > 0) {
      const buyOrder = ordersAtBestBid[0];
      const tradeQuantity = Decimal.min(sellOrder.quantity, buyOrder.quantity);

      trades.push({
        takerOrderId: sellOrder.orderId,
        makerOrderId: buyOrder.orderId,
        quantity: tradeQuantity,
        price: buyOrder.price,
        timestamp: Date.now(),
        takerSide: "sell",
      });

      sellOrder.quantity = sellOrder.quantity.minus(tradeQuantity);
      buyOrder.quantity = buyOrder.quantity.minus(tradeQuantity);

      if (buyOrder.quantity.isZero()) {
        ordersAtBestBid.shift();
      }
    }

    if (ordersAtBestBid.length === 0) {
      newBids.eraseElementByKey(bestBidPrice);
    }
  }

  if (sellOrder.quantity.greaterThan(0)) {
    // Apply the same robust fix for the sell-side logic
    const priceLevelIterator = newAsks.find(sellOrder.price);
    if (!priceLevelIterator.equals(newAsks.end())) {
      // Price level exists
      priceLevelIterator.pointer[1].push(sellOrder);
    } else {
      // Price level does not exist
      newAsks.setElement(sellOrder.price, [sellOrder]);
    }
  }

  return {
    newBook: { bids: newBids, asks: newAsks },
    trades: trades,
  };
}
