import envParsed from "@/envParsed";
import { l1Chain, l2Chain } from "@/lib/wagmi-config";
import { ethers } from "ethers";
import React, { createContext, useContext } from "react";
import { createPublicClient, http, PublicClient } from "viem";


// type WalletContextValue = WalletHookResult;
type Web3ClientContextValue = {
	publicParentClient: PublicClient,
	publicChildClient: PublicClient,
	parentProvider: ethers.providers.JsonRpcProvider,
	childProvider: ethers.providers.JsonRpcProvider
}

const Web3ClientContext = createContext<Web3ClientContextValue | undefined>(undefined);

interface Web3ClientProviderProps {
	children: React.ReactNode;
}

export const Web3ClientProvider: React.FC<Web3ClientProviderProps> = ({ children }) => {
	const publicParentClient = createPublicClient({
		chain: l1Chain,
		transport: http(envParsed().HTTPS_ETH_RPC_URL),
	});
	const publicChildClient = createPublicClient({
		chain: l2Chain,
		transport: http(envParsed().HTTPS_ARB_RPC_URL),
	});
	const parentProvider = new ethers.providers.JsonRpcProvider(
		envParsed().HTTPS_ETH_RPC_URL
	);
	const childProvider = new ethers.providers.JsonRpcProvider(
		envParsed().HTTPS_ARB_RPC_URL
	);


	const values = {
		publicParentClient, publicChildClient, parentProvider, childProvider
	}

	return <Web3ClientContext.Provider value={values}>{children}</Web3ClientContext.Provider>;
};

export const useWeb3ClientContext = (): Web3ClientContextValue => {
	const context = useContext(Web3ClientContext);

	if (!context) {
		throw new Error("useWeb3ClientContext not initialized :(");
	}

	return context;
};
