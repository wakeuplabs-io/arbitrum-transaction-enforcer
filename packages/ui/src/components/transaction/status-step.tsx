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
                <div className="flex flex-col">
                    <StatusIcon done={!!props.done} active={!!props.active} number={props.number} />
                    <div className="flex flex-col grow items-center overflow-hidden shrink">
                        <Filler done={!!props.done} />
                    </div>
                </div>
                <div>
                    <h2 className={cn("text-lg font-medium", { "text-green-500": props.done, "text-gray-400": !props.done && !props.active, "text-primary": props.active })}>
                        {props.title}
                    </h2>
                    <p className={cn("text-sm", { "text-gray-600": !props.done && !props.active, "text-primary": props.active })}>{props.description}</p>
                    {(props.done || props.active) && (
                        <div className={props.className}>{props.children}</div>
                    )}
                </div>
            </div>
        </div >

    );
}
function Filler(props: { done: boolean }) {
    return (<>
        {props.done
            ? <div
                className="w-0.5 bg-green-500 my-2 flex grow rounded-full"
            />
            : <div className="overflow-hidden" >
                {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="w-0.5 h-0.5 bg-gray-400 rounded-full my-1.5"></div>))}
            </div>

        }
    </>)
}

function StatusIcon(props: { done: boolean, active: boolean, number: number }) {
    if (props.done) return (
        <div className="h-5 w-5 mt-1 flex justify-center items-center rounded-full border-2 border-green-500 text-white bg-green-500">
            {<Check strokeWidth={3} color="white" className="mt-0.5" />}
        </div>
    )
    if (props.active)
        return (
            <div className="h-5 w-5 mt-1 flex justify-center items-center rounded-full border-2 border-gray-600 bg-gray-600">
                {<LoaderCircle strokeWidth={3} color="white" size={20} className="animate-spin" />}
            </div>
        )

    if (!props.active)
        return (
            <div className="h-5 min-w-5 mt-1 flex justify-center items-center rounded-full border-2 border-gray-400">
                {<span className="text-xs text-gray-400 font-semibold">{props.number}</span>}
            </div>
        )
}