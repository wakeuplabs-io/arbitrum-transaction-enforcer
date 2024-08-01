import { isChainSupported } from "@/lib/wagmi-config";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export default function useChain() {
  const { chainId } = useAccount();
  const [isChainValid, setIsChainValid] = useState(false);

  useEffect(() => {
    if (!chainId) return;
    setIsChainValid(isChainSupported(chainId));
  }, [setIsChainValid, chainId]);

  return { isChainValid };
}
