"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface MeteorStyle {
    left: string;
    animationDelay: string;
    animationDuration: string;
}

export const Meteors = ({
    number,
    className,
}: {
    number?: number;
    className?: string;
}) => {
    const [styles, setStyles] = useState<MeteorStyle[]>([]);

    useEffect(() => {
        const count = number || 20;
        const generated: MeteorStyle[] = Array.from({ length: count }, () => ({
            left: Math.floor(Math.random() * 800 - 400) + "px",
            animationDelay: (Math.random() * 0.6 + 0.2).toFixed(2) + "s",
            animationDuration: Math.floor(Math.random() * 8 + 2) + "s",
        }));
        setStyles(generated);
    }, [number]);

    if (styles.length === 0) return null;

    return (
        <>
            {styles.map((style, idx) => (
                <span
                    key={"meteor" + idx}
                    className={cn(
                        "animate-meteor absolute top-1/2 left-1/2 h-0.5 w-0.5 rounded-[9999px] bg-amber-500 shadow-[0_0_0_1px_rgba(217,119,6,0.2)] rotate-[215deg]",
                        "before:content-[''] before:absolute before:top-1/2 before:transform before:-translate-y-[50%] before:w-[50px] before:h-[1px] before:bg-gradient-to-r before:from-amber-500/80 before:to-transparent",
                        className
                    )}
                    style={{
                        top: 0,
                        left: style.left,
                        animationDelay: style.animationDelay,
                        animationDuration: style.animationDuration,
                    }}
                />
            ))}
        </>
    );
};
