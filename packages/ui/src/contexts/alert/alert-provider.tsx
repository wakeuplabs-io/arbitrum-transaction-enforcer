import React, {
	useState
} from "react";
import { AlertContext } from "./alert-context";

interface AlertProviderProps {
	children: React.ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
	const [error, setError] = useState<string>("");
	const values = {
		error,
		setError,
	};

	return (
		<AlertContext.Provider value={values}>
			{children}
		</AlertContext.Provider>
	);
};
