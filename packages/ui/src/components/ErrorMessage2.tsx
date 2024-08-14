import truncateEthAddress from "@/lib/truncateAddress";
import { serializeCause, serializeError } from "@metamask/rpc-errors";
import { ethers } from "ethers";
import { useAccount } from "wagmi";

export default function ErrorMessage2({ error }: { error?: any }) {
  const { address } = useAccount();

  if (!error) return null;

  const serializedError = serializeError(error);
  const serializedCause = serializeCause(error) as any;

  const reason = parseReason(serializedCause, address);

  return (
    <div className="flex text-error w-full gap-1 ">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="stroke-current shrink-0 h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <div>
        <h3 className="font-bold text-sm">{serializedError.message}</h3>
        <div className="text-xs">{reason}</div>
      </div>
    </div>
  );
}

function parseReason(serializedCause: any, walletAddress?: string) {
  let reason = "";
  if (serializedCause) {
    if (serializedCause.reason)
      reason = serializedCause.reason
    if (serializedCause.details)
      reason = serializedCause.details
    if (serializedCause.data?.message)
      reason = serializedCause.data.message
  }

  const addresses = reason.match(/(\b0x[a-f0-9]+\b)/g) as string[];

  if (addresses && addresses.length > 0) {
    addresses.forEach((address) => {
      if (address.toLowerCase() === walletAddress?.toLowerCase()) {
        reason = reason.replaceAll(`account ${address}`, "the caller");
        reason = reason.replaceAll(address, "caller");
      } else if (address === ethers.constants.HashZero) {
        reason = reason.replaceAll(
          `is missing role ${address}`,
          "is not an admin"
        );
        reason = reason.replaceAll(address, "ZeroHash");
      }

      reason = reason.replaceAll(address, truncateEthAddress(address));
    });
  }

  const aaveErrorMessage = aaveErrorCodes[reason];

  return aaveErrorMessage ? aaveErrorMessage : reason;
}

const aaveErrorCodes: { [key: string]: string } = {
  "1": "The caller is not a pool admin",
  "2": "The caller is not an emergency admin",
  "3": "The caller is not a pool or emergency admin",
  "4": "The caller is not a risk or pool admin",
  "5": "The caller is not an asset listing or pool admin",
  "6": "The caller is not a bridge",
  "7": "Pool addresses provider is not registered",
  "8": "Invalid id for the pool addresses provider",
  "9": "Address is not a contract",
  "10": "The caller is not the pool configurator",
  "11": "The caller is not an AToken",
  "12": "The address of the pool addresses provider is invalid",
  "13": "Invalid return value of the flash loan executor function",
  "14": "Reserve has already been added to reserve list",
  "15": "Maximum amount of reserves in the pool reached",
  "16": "Zero eMode category is reserved for volatile heterogeneous assets",
  "17": "Invalid eMode category assignment to asset",
  "18": "The liquidity of the reserve needs to be 0",
  "19": "Invalid flash loan premium",
  "20": "Invalid risk parameters for the reserve",
  "21": "Invalid risk parameters for the eMode category",
  "22": "Invalid bridge protocol fee",
  "23": "The caller of this function must be a pool",
  "24": "Invalid amount to mint",
  "25": "Invalid amount to burn",
  "26": "Amount must be greater than 0",
  "27": "Action requires an active reserve",
  "28": "Action cannot be performed because the reserve is frozen",
  "29": "Action cannot be performed because the reserve is paused",
  "30": "Borrowing is not enabled",
  "31": "Stable borrowing is not enabled",
  "32": "User cannot withdraw more than the available balance",
  "33": "Invalid interest rate mode selected",
  "34": "The collateral balance is 0",
  "35": "Health factor is lesser than the liquidation threshold",
  "36": "There is not enough collateral to cover a new borrow",
  "37": "Collateral is (mostly) the same currency that is being borrowed",
  "38": "The requested amount is greater than the max loan size in stable rate mode",
  "39": "For repayment of a specific type of debt, the user needs to have debt that type",
  "40": "To repay on behalf of a user an explicit amount to repay is needed",
  "41": "User does not have outstanding stable rate debt on this reserve",
  "42": "User does not have outstanding variable rate debt on this reserve",
  "43": "The underlying balance needs to be greater than 0",
  "44": "Interest rate re-balance conditions were not met",
  "45": "Health factor is not below the threshold",
  "46": "The collateral chosen cannot be liquidated",
  "47": "User did not borrow the specified currency",
  "49": "Inconsistent flash loan parameters",
  "50": "Borrow cap is exceeded",
  "51": "Supply cap is exceeded",
  "52": "Unbacked mint cap is exceeded",
  "53": "Debt ceiling is exceeded",
  "54": "Claimable rights over underlying not zero (aToken supply or accruedToTreasury)",
  "55": "Stable debt supply is not zero",
  "56": "Variable debt supply is not zero",
  "57": "Ltv validation failed",
  "58": "Inconsistent eMode category",
  "59": "Price oracle sentinel validation failed",
  "60": "Asset is not borrowable in isolation mode",
  "61": "Reserve has already been initialized",
  "62": "User is in isolation mode or ltv is zero",
  "63": "Invalid ltv parameter for the reserve",
  "64": "Invalid liquidity threshold parameter for the reserve",
  "65": "Invalid liquidity bonus parameter for the reserve",
  "66": "Invalid decimals parameter of the underlying asset of the reserve",
  "67": "Invalid reserve factor parameter for the reserve",
  "68": "Invalid borrow cap for the reserve",
  "69": "Invalid supply cap for the reserve",
  "70": "Invalid liquidation protocol fee for the reserve",
  "71": "Invalid eMode category for the reserve",
  "72": "Invalid unbacked mint cap for the reserve",
  "73": "Invalid debt ceiling for the reserve",
  "74": "Invalid reserve index",
  "75": "ACL admin cannot be set to the zero address",
  "76": "Array parameters that should be equal length are not",
  "77": "Zero address not valid",
  "78": "Invalid expiration",
  "79": "Invalid signature",
  "80": "Operation not supported",
  "81": "Debt ceiling is not zero",
  "82": "Asset is not listed",
  "83": "Invalid optimal usage ratio",
  "84": "Invalid optimal stable to total debt ratio",
  "85": "The underlying asset cannot be rescued",
  "86": "Reserve has already been added to reserve list",
  "87": "The token implementation pool address and the pool address provided by the initializing pool do not match",
  "88": "Stable borrowing is enabled",
  "89": "User is trying to borrow multiple assets including a siloed one",
  "90": "the total debt of the reserve needs to be 0",
  "91": "FlashLoaning for this asset is disabled",
};
