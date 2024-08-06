import WalletNegativeIcon from "@/assets/wallet-negative.svg";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import cn from "classnames";
import { ConnectButtonProps } from "node_modules/@rainbow-me/rainbowkit/dist/components/ConnectButton/ConnectButton";
import React from "react";

interface IConnectButtonProps extends ConnectButtonProps {
  variant?: "contained" | "outlined";
  size?: "small" | "medium";
  border?: "rounded" | "square";
}

export default function CustomConnectButton({
  label,
  variant = "contained",
  size = "medium",
  border = "rounded",
}: IConnectButtonProps) {
  // TODO: cleanup this component

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
        const BaseButton = ({
          children,
          onClick,
        }: {
          children: React.ReactNode;
          onClick: React.MouseEventHandler<HTMLButtonElement>;
        }) => {
          return (
            <button
              type="button"
              className={cn("btn btn-primary text-neutral-100 font-normal", {
                "btn-outline": variant === "outlined",
                "px-6 btn-sm h-9": size === "small",
                "px-7 btn": size === "medium",
                "rounded-2xl": border === "square",
                "rounded-3xl": border === "rounded",
              })}
              onClick={onClick}
            >
              {children}
            </button>
          );
        };
        const ConnectButton = ({
          children,
          onClick,
        }: {
          children: React.ReactNode;
          onClick: React.MouseEventHandler<HTMLButtonElement>;
        }) => <BaseButton onClick={onClick}>{children}</BaseButton>;
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
                  <ConnectButton onClick={openConnectModal}>
                    {label ? (
                      label
                    ) : (
                      <div className="flex flex-row gap-3 items-center px-10">
                        <img src={WalletNegativeIcon} />
                        <div>Connect</div>
                      </div>
                    )}
                  </ConnectButton>
                );
              }
              if (chain.unsupported) {
                return (
                  <BaseButton onClick={openChainModal}>
                    Wrong network
                  </BaseButton>
                );
              }
              return (
                <div className="flex">
                  <BaseButton onClick={openAccountModal}>
                    {account.displayName}
                  </BaseButton>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
