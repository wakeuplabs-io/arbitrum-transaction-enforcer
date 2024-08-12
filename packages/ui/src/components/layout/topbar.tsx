import ArbitrumConnectIcon from "@/assets/arbitrum-connect.svg";
import CustomConnectButton from "@/components/connect-wallet";
import { Link, useNavigate } from "@tanstack/react-router";
import { WalletIcon } from "lucide-react";

export default function Topbar() {
  const navigate = useNavigate();
  return (
    <header className="flex justify-between items-center | sticky top-0 sm:px-8 | h-[6rem] card--blur z-10 bg-white px-4">
      <div className="flex justify-between items-center | w-full">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate({ to: "/" })}>
          <img src={ArbitrumConnectIcon} width={32} height={32} />
          <span className="text-2xl hidden md:block">
            <b>Arbitrum</b> Connect
          </span>
        </div>
        <div className="flex space-x-3">
          <Link to="/activity" className="btn btn-outline rounded-2xl hover:border-gray-300 hover:text-gray-500">
            My activity
          </Link>
          <CustomConnectButton id="topbar-connect-wallet" className="btn btn-primary rounded-2xl" >
            <WalletIcon className="h-5 w-5" />
            Connect Wallet
          </CustomConnectButton>
        </div>
      </div>
    </header>
  );
}
