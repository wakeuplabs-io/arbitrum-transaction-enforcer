import ErrorMessage2 from "@/components/ErrorMessage2";
import React, {
	createContext,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";

type AlertContextValue = {
	error: string;
	setError: React.Dispatch<React.SetStateAction<string>>;
};

const AlertContext = createContext<AlertContextValue | undefined>(undefined);

interface AlertProviderProps {
	children: React.ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
	const [error, setError] = useState<string>("");
	const values = {
		error,
		setError,
	};
	const modalRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		if (!error || !modalRef?.current) return;
		modalRef.current.showModal();
	}, [error]);

	return (
		<AlertContext.Provider value={values}>
			{children}
			<dialog ref={modalRef} id="alert_modal" className="modal">
				<div className="modal-box">
					<form method="dialog">
						<button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
							✕
						</button>
					</form>
					<ErrorMessage2 error={error} />
				</div>
				<form method="dialog" className="modal-backdrop ">
					<button className="cursor-default backdrop-opacity-35">close</button>
				</form>
			</dialog>
		</AlertContext.Provider>
	);
};

export const useAlertContext = (): AlertContextValue => {
	const context = useContext(AlertContext);

	if (!context) {
		throw new Error("AlertContext failed to initialize");
	}

	return context;
};
