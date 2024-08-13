import envParsed from "@/envParsed";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export default function useArbitrumBalance() {
  const { address } = useAccount();
  const [balanceOnArbitrum, setBalanceOnArbitrum] = useState("");

  useEffect(() => {
    const getBalance = async () => {
      if (address) {
        const provider = new ethers.providers.JsonRpcProvider(envParsed().HTTPS_ARB_RPC_URL);
        const rawBalance = await provider.getBalance(address);
        const balance = ethers.utils.formatEther(rawBalance);

        setBalanceOnArbitrum(balance);
      } else
        setBalanceOnArbitrum("-")
    };

    getBalance();
  }, [address]);
  return balanceOnArbitrum;
}
