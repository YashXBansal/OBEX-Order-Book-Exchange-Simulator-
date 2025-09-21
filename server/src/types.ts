import { OrderedMap } from "js-sdsl";
import { Decimal } from "decimal.js";

export type Order = {
  readonly orderId: number;
  readonly side: "buy" | "sell";
  quantity: Decimal;
  readonly price: Decimal;
  readonly timestamp: number;
};

export type Trade = {
  readonly takerOrderId: number;
  readonly makerOrderId: number;
  readonly quantity: Decimal;
  readonly price: Decimal;
  readonly timestamp: number;
  readonly takerSide: "buy" | "sell";
};

export type OrderBook = {
  readonly bids: OrderedMap<Decimal, Order[]>;
  readonly asks: OrderedMap<Decimal, Order[]>;
};

export type ProcessResult = {
  newBook: OrderBook;
  trades: Trade[];
};
