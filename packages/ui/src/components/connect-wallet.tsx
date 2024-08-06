import { ConnectButton } from "@rainbow-me/rainbowkit";
import cn from "classnames";

export default function CustomConnectButton(
  props: React.ComponentProps<"button">
) {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            className={cn(!ready && "opacity-0 pointer-events-none select-none")}
            aria-hidden={!ready}
          >
            {!connected ? (
              <button onClick={openConnectModal} type="button" {...props}>
                {props.children ?? "Connect Wallet"}
              </button>
            ) : chain.unsupported ? (
              <button onClick={openChainModal} type="button" {...props}>
                Wrong network
              </button>
            ) : (
              <button onClick={openAccountModal} type="button" {...props}>
                {account.displayName}
              </button>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
