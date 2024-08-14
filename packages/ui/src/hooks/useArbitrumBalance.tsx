import { useWeb3ClientContext } from "@/contexts/web3-client-context";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export default function useArbitrumBalance() {
  const { address } = useAccount();
  const [balanceOnArbitrum, setBalanceOnArbitrum] = useState("");
  const { childProvider } = useWeb3ClientContext();

  useEffect(() => {
    const getBalance = async () => {
      if (address) {
        const rawBalance = await childProvider.getBalance(address);
        const balance = ethers.utils.formatEther(rawBalance);

        setBalanceOnArbitrum(balance);
      } else
        setBalanceOnArbitrum("-")
    };

    getBalance();
  }, [address]);
  return balanceOnArbitrum;
}
