import { useEffect, useRef, useState, type ReactNode } from "react";

interface FadeTransitionProps {
  children: ReactNode;
  duration?: number;
}

export function FadeTransition({ children, duration = 200 }: FadeTransitionProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [displayChildren, setDisplayChildren] = useState(children);
  const pendingRef = useRef<ReactNode>(null);

  useEffect(() => {
    if (children === displayChildren) return;
    pendingRef.current = children;
    setIsVisible(false);
    const timer = setTimeout(() => {
      if (pendingRef.current !== null) {
        setDisplayChildren(pendingRef.current);
        pendingRef.current = null;
      }
      setIsVisible(true);
    }, duration);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

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
