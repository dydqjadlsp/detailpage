import { cn } from "@/lib/utils";

export const BentoGrid = ({
    className,
    children,
}: {
    className?: string;
    children?: React.ReactNode;
}) => {
    return (
        <div
            className={cn(
                "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto ",
                className
            )}
        >
            {children}
        </div>
    );
};

export const BentoGridItem = ({
    className,
    title,
    description,
    header,
    icon,
}: {
    className?: string;
    title?: string | React.ReactNode;
    description?: string | React.ReactNode;
    header?: React.ReactNode;
    icon?: React.ReactNode;
}) => {
    return (
        <div
            className={cn(
                "row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 p-4 justify-between flex flex-col space-y-4",
                "glass-card hover:border-amber-500/30 hover:shadow-[0_8px_30px_rgba(217,119,6,0.08)]",
                className
            )}
        >
            {header}
            <div className="group-hover/bento:translate-x-2 transition duration-200">
                {icon}
                <div className="font-sans font-bold text-[rgb(var(--color-text-primary))] mb-2 mt-2">
                    {title}
                </div>
                <div className="font-sans font-normal text-[rgb(var(--color-text-secondary))] text-xs">
                    {description}
                </div>
            </div>
        </div>
    );
};
