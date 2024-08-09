import cn from "classnames";
import { Check, LoaderCircle } from 'lucide-react';

export function StatusStep(props: {
    number: number;
    title: string;
    description: string;
    children?: React.ReactNode;
    className?: string;
    done?: boolean;
    active?: boolean;
}) {
    return (
        <div className={"flex items-center justify-between"}>
            <div className="flex space-x-3">
                <StatusIcon done={!!props.done} active={!!props.active} number={props.number} />
                <div>
                    <h2 className={cn("text-lg font-medium", { "text-green-500": props.done, "text-gray-400": !props.done && !props.active, "text-primary": props.active })}>
                        {props.title}
                    </h2>
                    <p className={cn("text-sm", { "text-gray-600": !props.done && !props.active, "text-primary": props.active })}>{props.description}</p>
                    {props.done || props.active && (
                        <div className={props.className}>{props.children}</div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatusIcon(props: { done: boolean, active: boolean, number: number }) {
    if (props.done) return (
        <div className="h-5 w-5 mt-1.5 flex justify-center items-center rounded-full border-2 border-green-500 text-white bg-green-500">
            {<Check strokeWidth={3.5} color="white" size={20} />}
        </div>
    )
    if (props.active)
        return (
            <div className="h-5 w-5 mt-1.5 flex justify-center items-center rounded-full border-2 border-gray-600 bg-gray-600">
                {<LoaderCircle strokeWidth={3} color="white" size={20} />}
            </div>
        )

    if (!props.active)
        return (
            <div className="h-5 min-w-5 mt-1.5 flex justify-center items-center rounded-full border-2 border-gray-400">
                {<span className="text-xs text-gray-400">{props.number}</span>}
            </div>
        )
}