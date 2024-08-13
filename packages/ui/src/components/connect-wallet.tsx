import { ConnectButton } from "@rainbow-me/rainbowkit";
import cn from "classnames";
import { ConnectButtonProps } from "node_modules/@rainbow-me/rainbowkit/dist/components/ConnectButton/ConnectButton";

interface ICustomConnectButton extends React.ComponentProps<"button">, ConnectButtonProps { }
export default function CustomConnectButton(
  props: ICustomConnectButton
) {
  const { chainStatus, ...btnProps } = props
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
            className={cn(!ready && "opacity-0 pointer-events-none select-none", { "btn-primary": !connected })}
            aria-hidden={!ready}
          >
            {!connected ? (
              <button onClick={openConnectModal} type="button" {...btnProps}>
                {props.children ?? "Connect Wallet"}
              </button>
            ) : chain.unsupported ? (
              <button onClick={openChainModal} type="button" {...btnProps}>
                Wrong network
              </button>
            ) : (
              <button onClick={openAccountModal} type="button" {...btnProps}>
                {props.chainStatus === "icon" && chain.hasIcon && <img src={chain.iconUrl} width={28} alt="chain icon" />}{account.displayName}
              </button>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
