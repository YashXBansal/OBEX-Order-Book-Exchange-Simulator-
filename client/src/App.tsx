import { MarketDisplay } from "./components/MarketDisplay";
import { OrderForm } from "./components/OrderForm";

function App() {
  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-purple-400">
          OBEX - Order Book Exchange Simulator
        </h1>
      </header>
      <main>
        <OrderForm />
        <MarketDisplay /> {/* Use the new component */}
      </main>
    </div>
  );
}

export default App;
