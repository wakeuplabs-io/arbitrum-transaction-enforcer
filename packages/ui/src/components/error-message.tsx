import { InfoIcon } from "lucide-react";

export default function ErrorMessage({ label }: { label: string }) {
    return (
        <div className="flex pb-4 gap-2 text-[#FF0000] font-semibold text-sm">
            <InfoIcon className="text-[#FF0000] w-5 h-5" />
            <p className="underline">{label}</p>
        </div>
    );
}
