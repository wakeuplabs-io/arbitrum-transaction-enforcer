import ArbitrumConnectIcon from "@/assets/arbitrum-connect.svg";
import cn from "classnames";
import Modal from "./modal";

export default function TermsModal({
  isOpen,
  onSubmit,
}: {
  isOpen: boolean;
  onSubmit?(): void;
}) {
  return (
    <Modal isOpen={isOpen}>
      <img src={ArbitrumConnectIcon} />
      <div className="text-xl mt-3">Welcome to Arbitrum Connect</div>
      <div className="text-lg">
        We ensure your transactions are processed even if the Arbitrum Sequencer
        is down or other unexpected issues arise.
      </div>
      <div>
        <div className="text-sm text-gray-800">
          By using Arbitrum Connect, you agree to our Terms and Privacy Policy
        </div>
        <button
          type="button"
          className={cn("btn btn-primary mt-4")}
          onClick={onSubmit}
        >
          Get Started
        </button>
      </div>
    </Modal>
  );
}
