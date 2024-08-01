import { lightTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import "./App.css";
import Topbar from "./components/layout/topbar";
import TransactionScreen from "./components/transaction/transaction";
import config from "./lib/wagmi-config";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import HomeScreen from "./screens/home";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeScreen />,
  },
]);



export default function App() {
  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          showRecentTransactions
          coolMode
          theme={lightTheme({ borderRadius: "medium" })}
        >
          <RouterProvider router={router} />
          {/* <div className="flex flex-col w-full grow min-h-screen  bg-cover text-primary">
            <Topbar />
            <Transaction />
          </div> */}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
