import { useEffect, useState, type ReactNode } from "react";

interface FadeTransitionProps {
  children: ReactNode;
  duration?: number;
}

export function FadeTransition({ children, duration = 300 }: FadeTransitionProps) {
  const [displayChildren, setDisplayChildren] = useState(children);

  const isVisible = children === displayChildren;

  useEffect(() => {
    if (children !== displayChildren) {
      const timer = setTimeout(() => {
        setDisplayChildren(children);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [children, displayChildren, duration]);

  return (
    <div
      style={{
        opacity: isVisible ? 1 : 0,
        transition: `opacity ${duration}ms ease-in-out`,
        minHeight: "100%",
      }}
    >
      {displayChildren}
    </div>
  );
}

export function FadeIn({ children, delay = 0, duration = 400 }: { children: ReactNode; delay?: number; duration?: number }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(8px)",
        transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
      }}
    >
      {children}
    </div>
  );
}

export function StaggerContainer({ children, staggerDelay = 50 }: { children: ReactNode[]; staggerDelay?: number }) {
  return (
    <>
      {children.map((child, index) => (
        <FadeIn key={index} delay={index * staggerDelay}>
          {child}
        </FadeIn>
      ))}
    </>
  );
}
