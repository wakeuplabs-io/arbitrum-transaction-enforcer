import { lightTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import "./App.css";
import config from "./lib/wagmi-config";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ActivityScreen from "./screens/activity";
import TransactionDetailScreen from "./screens/transaction-detail";
import HomeScreen from "./screens/home";
import ReviewScreen from "./screens/review";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeScreen />,
  },
  {
    path: "/activity",
    element: <ActivityScreen />,
  },
  {
    path: "/activity/:tx",
    element: <TransactionDetailScreen />,
  },
  {
    path: "/amount",
    element: <HomeScreen />,
  },
  {
    path: "/review",
    element: <ReviewScreen />,
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
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
