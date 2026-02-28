"use client";

import { cn } from "@/lib/utils";
import {
    motion,
    useMotionTemplate,
    useMotionValue,
    useSpring,
    useTransform,
} from "framer-motion";
import React, { ReactNode, useRef } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
    children: ReactNode;
}

export const AuroraBackground = ({
    className,
    children,
    ...props
}: AuroraBackgroundProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { stiffness: 120, damping: 20, mass: 0.5 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    // 3D tilt (max +-4 degrees)
    const rotateX = useTransform(springY, [0, 800], [4, -4]);
    const rotateY = useTransform(springX, [0, 1400], [-4, 4]);

    // Mouse-tracking radial glow
    const glowBackground = useMotionTemplate`radial-gradient(600px circle at ${springX}px ${springY}px, rgba(245,158,11,0.12), rgba(249,115,22,0.06) 40%, transparent 70%)`;

    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
    }

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className={cn(
                "relative flex flex-col h-[100vh] items-center justify-center overflow-hidden",
                className
            )}
            style={{ background: "rgb(5, 5, 5)", perspective: "1200px" }}
            {...props}
        >
            {/* Warm floating blobs */}
            <motion.div
                animate={{
                    x: [0, 120, -60, 0],
                    y: [0, -100, 50, 0],
                    scale: [1, 1.3, 0.9, 1],
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[15%] left-[20%] w-[500px] h-[500px] rounded-full bg-amber-500/[0.14] blur-[120px] pointer-events-none"
            />
            <motion.div
                animate={{
                    x: [0, -80, 100, 0],
                    y: [0, 60, -90, 0],
                    scale: [1, 0.8, 1.2, 1],
                }}
                transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[30%] right-[15%] w-[450px] h-[450px] rounded-full bg-orange-500/[0.10] blur-[110px] pointer-events-none"
            />
            <motion.div
                animate={{
                    x: [0, 60, -40, 0],
                    y: [0, -50, 80, 0],
                    scale: [1, 1.1, 0.95, 1],
                }}
                transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-[20%] left-[30%] w-[350px] h-[350px] rounded-full bg-rose-500/[0.08] blur-[100px] pointer-events-none"
            />

            {/* Subtle warm grain overlay */}
            <div
                className="absolute inset-0 pointer-events-none opacity-30"
                style={{
                    backgroundImage:
                        "repeating-linear-gradient(100deg, rgba(5,5,5,1) 0%, rgba(5,5,5,1) 7%, transparent 10%, transparent 12%, rgba(5,5,5,1) 16%), repeating-linear-gradient(100deg, rgba(217,119,6,0.08) 10%, rgba(245,158,11,0.06) 15%, rgba(249,115,22,0.04) 20%, rgba(244,63,94,0.06) 25%, rgba(217,119,6,0.08) 30%)",
                    backgroundSize: "300% 200%",
                    animation: "aurora 60s linear infinite",
                    filter: "blur(8px)",
                }}
            />

            {/* Mouse-tracking glow */}
            <motion.div
                className="absolute inset-0 pointer-events-none z-[1]"
                style={{ background: glowBackground }}
            />

            {/* Vignette overlay */}
            <div
                className="absolute inset-0 pointer-events-none z-[2]"
                style={{
                    background:
                        "radial-gradient(ellipse at center, transparent 30%, rgb(5,5,5) 85%)",
                }}
            />

            {/* Content with 3D tilt */}
            <motion.div
                className="relative z-10"
                style={{
                    rotateX,
                    rotateY,
                    transformStyle: "preserve-3d",
                }}
            >
                {children}
            </motion.div>
        </div>
    );
};
