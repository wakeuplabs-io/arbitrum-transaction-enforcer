import ArbitrumConnectIcon from "@/assets/arbitrum-connect.svg";
import CustomConnectButton from "@/components/connect-wallet";
import { Link } from "@tanstack/react-router";
import { Bell, WalletIcon } from "lucide-react";

export default function Topbar() {
  return (
    <header className="flex justify-between items-center | sticky top-0 sm:px-8 | h-[4rem] card--blur z-10 bg-white px-4">
      <div className="flex justify-between items-center | w-full">
        <div className="flex items-center gap-3">
          <img src={ArbitrumConnectIcon} width={32} height={32} alt="arbitrum connect logo" />
          <span className="text-2xl hidden md:block">
            <b>Arbitrum</b> Connect
          </span>
        </div>
        <div className="flex space-x-3">
          <Link to="/activity" className="btn btn-outline rounded-2xl hover:border-gray-300 hover:text-gray-500 w-[185px]">
            <Bell size={18} />
            My activity
          </Link>
          <CustomConnectButton id="topbar-connect-wallet" className="btn rounded-2xl w-[185px]" chainStatus="icon" >
            <WalletIcon className="h-5 w-5" />
            Connect
          </CustomConnectButton>
        </div>
      </div>
    </header>
  );
}
