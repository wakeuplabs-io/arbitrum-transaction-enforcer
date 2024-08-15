import React, {
	createContext,
	useContext
} from "react";

type AlertContextValue = {
	error: string;
	setError: React.Dispatch<React.SetStateAction<string>>;
};

export const AlertContext = createContext<AlertContextValue | undefined>(undefined);

export const useAlertContext = (): AlertContextValue => {
	const context = useContext(AlertContext);

	if (!context) {
		throw new Error("AlertContext failed to initialize");
	}

	return context;
};
