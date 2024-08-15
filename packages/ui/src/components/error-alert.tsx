import { useAlertContext } from "@/contexts/alert/alert-context";
import { serializeCause, serializeError } from "@metamask/rpc-errors";
import { useEffect, useRef } from "react";

export default function ErrorAlert() {
  const modalRef = useRef<HTMLDialogElement>(null);
  const { error } = useAlertContext();

  useEffect(() => {
    if (!error || !modalRef?.current) return;
    modalRef.current.showModal();
  }, [error]);

  if (!error) return null;

  const serializedError = serializeError(error);
  const serializedCause = serializeCause(error) as any;

  const reason = parseErrorReason(serializedCause);

  return (
    <dialog ref={modalRef} id="alert_modal" className="modal">
      <div className="modal-box">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>
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
      </div>
      <form method="dialog" className="modal-backdrop ">
        <button className="cursor-default backdrop-opacity-35">close</button>
      </form>
    </dialog>

  );
}

function parseErrorReason(serializedCause: any) {
  let reason = "";
  if (serializedCause) {
    if (serializedCause.reason) reason = serializedCause.reason;
    if (serializedCause.details) reason = serializedCause.details;
    if (serializedCause.data?.message) reason = serializedCause.data.message;
  }
  return reason;
}

