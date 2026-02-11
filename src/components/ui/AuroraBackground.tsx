"use client";

import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
    children: ReactNode;
}

export const AuroraBackground = ({
    className,
    children,
    ...props
}: AuroraBackgroundProps) => {
    return (
        <div
            className={cn(
                "relative flex flex-col h-[100vh] items-center justify-center overflow-hidden",
                className
            )}
            style={{ background: "rgb(5, 5, 5)" }}
            {...props}
        >
            <div className="absolute inset-0 overflow-hidden">
                <div
                    className="absolute -inset-[10px] opacity-50 will-change-transform pointer-events-none"
                    style={{
                        backgroundImage: `
              repeating-linear-gradient(100deg, rgba(5,5,5,1) 0%, rgba(5,5,5,1) 7%, transparent 10%, transparent 12%, rgba(5,5,5,1) 16%),
              repeating-linear-gradient(100deg, #7c3aed 10%, #818cf8 15%, #6366f1 20%, #a78bfa 25%, #22d3ee 30%)
            `,
                        backgroundSize: "300% 200%",
                        backgroundPosition: "50% 50%",
                        filter: "blur(10px)",
                        animation: "aurora 60s linear infinite",
                    }}
                />
                <div
                    className="absolute -inset-[10px] opacity-30 will-change-transform pointer-events-none mix-blend-difference"
                    style={{
                        backgroundImage: `
              repeating-linear-gradient(100deg, rgba(5,5,5,1) 0%, rgba(5,5,5,1) 7%, transparent 10%, transparent 12%, rgba(5,5,5,1) 16%),
              repeating-linear-gradient(100deg, #7c3aed 10%, #818cf8 15%, #6366f1 20%, #a78bfa 25%, #22d3ee 30%)
            `,
                        backgroundSize: "200% 100%",
                        backgroundAttachment: "fixed",
                        animation: "aurora 60s linear infinite",
                    }}
                />
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: "radial-gradient(ellipse at 100% 0%, transparent 40%, rgba(5,5,5,0.8) 70%)",
                    }}
                />
            </div>
            <div className="relative z-10">{children}</div>
        </div>
    );
};
