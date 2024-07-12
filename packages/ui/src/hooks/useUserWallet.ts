import { ethers, Signer } from "ethers";
import { useEffect, useMemo } from "react";
import { useWalletClient, useAccount } from "wagmi";
import { useState } from "react";

export default function useUserWallet() {
  const [isLoading, setIsLoading] = useState(true);
  const [signer, setSigner] = useState<Signer | null>(null);

  const { data, isLoading: isWalletLoading } = useWalletClient();

  const { address, chain, isConnected, isConnecting, isReconnecting } =
    useAccount();

  const provider = useMemo(
    () =>
      !isConnected || !data
        ? null
        : new ethers.providers.Web3Provider(data.transport),
    [isConnected, data]
  );

  useEffect(() => {
    if (!provider) {
      setSigner(null);
      return;
    }

    const action = async () => {
      setIsLoading(true);

      const result = provider.getSigner();

      setSigner(result);

      setIsLoading(false);
    };

    action();
  }, [provider]);

  return [
    signer,
    chain,
    isLoading || isWalletLoading || isConnecting || isReconnecting,
    address,
  ] as const;
}
