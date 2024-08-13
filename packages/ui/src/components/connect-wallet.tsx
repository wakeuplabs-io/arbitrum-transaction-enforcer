import { ConnectButton } from "@rainbow-me/rainbowkit";
import cn from "classnames";
import { ConnectButtonProps } from "node_modules/@rainbow-me/rainbowkit/dist/components/ConnectButton/ConnectButton";

interface ICustomConnectButton extends React.ComponentProps<"button">, ConnectButtonProps {
  tooltip?: boolean
}
export default function CustomConnectButton(
  props: ICustomConnectButton
) {
  const { chainStatus, tooltip, ...btnProps } = props
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
            className={cn({ "btn-primary": !connected, "opacity-0 pointer-events-none select-none": !ready })}
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
              <div className={cn("flex items-center justify-evenly", { "tooltip tooltip-bottom": tooltip })} data-tip={chain.name}>
                <button onClick={openAccountModal} type="button" {...btnProps}>
                  {props.chainStatus === "icon" && chain.hasIcon && <img src={chain.iconUrl} width={20} alt="chain icon" />}{account.displayName}
                </button>
              </div>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
