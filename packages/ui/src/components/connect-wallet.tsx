import { ConnectButton } from "@rainbow-me/rainbowkit";

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
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button onClick={openConnectModal} type="button" {...props}>
                    {props.children ?? "Connect Wallet"}
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button onClick={openChainModal} type="button" {...props}>
                    Wrong network
                  </button>
                );
              }

              return (
                <button onClick={openAccountModal} type="button" {...props}>
                  {account.displayName}
                </button>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
