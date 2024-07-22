import { useState } from "react";
import TransactionAmountCard from "./amount";
import TransactionReviewCard from "./review";
import TransactionResultCard from "./result";
import { getWalletHttpsClient } from "../shared/viemClients";

enum STEPS {
  amount,
  review,
  result,
}

export default function Transaction() {
  const [currentStep, setCurrentStep] = useState(STEPS.amount);
  const run = () => {
    const walletClient = getWalletHttpsClient();
    if (!walletClient) return;
    
  };
  return (
    <div className="flex flex-col items-center grow justify-center">
      {currentStep === STEPS.amount && (
        <TransactionAmountCard
          onSubmit={() => {
            run();
            // setCurrentStep(STEPS.review);
          }}
        />
      )}
      {currentStep === STEPS.review && (
        <TransactionReviewCard
          onSubmit={() => {
            setCurrentStep(STEPS.result);
          }}
        />
      )}
      {currentStep === STEPS.result && (
        <TransactionResultCard
          onSubmit={() => {
            setCurrentStep(STEPS.amount);
          }}
        />
      )}
    </div>
  );
}
