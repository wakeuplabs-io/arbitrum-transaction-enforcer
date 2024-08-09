import cn from "classnames";
import { useEffect } from "react";
import { Spinner } from "./spinner";

export function StatusStep(props: {
    number: number;
    title: string;
    description: string;
    children?: React.ReactNode;
    className?: string;
    done?: boolean;
    active?: boolean;
}) {
    useEffect(() => {
        if (!props.active) return;
        //Execute it's functions
    }, [props.active])

    return (
        <div className={"flex items-center justify-between"}>
            <div className="flex space-x-3">
                <StatusIcon done={!!props.done} active={!!props.active} number={props.number} />
                <div>
                    <h2 className={cn("text-lg", { "text-green-500": props.done, "text-gray-400": !props.done && !props.active })}>
                        {props.title}
                    </h2>
                    <p className="text-sm">{props.description}</p>
                    {props.active && (
                        <div className={props.className}>{props.children}</div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatusIcon(props: { done: boolean, active: boolean, number: number }) {
    if (props.done) return (
        <div className="h-5 min-w-5 mt-1 flex justify-center items-center rounded-full border-2 border-green-500 text-green-500">
            {<span className="text-xs">✓</span>}
        </div>
    )
    if (props.active)
        return (
            <div className="h-5 min-w-5 mt-1 flex justify-center items-center rounded-full border-2 border-gray-400">
                {<Spinner />}
            </div>
        )

    if (!props.active)
        return (
            <div className="h-5 min-w-5 mt-1 flex justify-center items-center rounded-full border-2 border-gray-400">
                {<span className="text-xs">{props.number}</span>}
            </div>
        )
}