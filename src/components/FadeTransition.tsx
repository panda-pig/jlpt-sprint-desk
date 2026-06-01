import { useEffect, useReducer, useState, type ReactNode } from "react";

interface FadeTransitionProps {
  children: ReactNode;
  duration?: number;
}

type TransitionState = { shown: ReactNode; opacity: number };
type TransitionAction =
  | { type: "fade_out" }
  | { type: "swap"; next: ReactNode };

function transitionReducer(state: TransitionState, action: TransitionAction): TransitionState {
  if (action.type === "fade_out") return { ...state, opacity: 0 };
  if (action.type === "swap") return { shown: action.next, opacity: 1 };
  return state;
}

export function FadeTransition({ children, duration = 200 }: FadeTransitionProps) {
  const [state, dispatch] = useReducer(transitionReducer, { shown: children, opacity: 1 });

  useEffect(() => {
    if (children === state.shown) return;
    dispatch({ type: "fade_out" });
    const timer = setTimeout(() => dispatch({ type: "swap", next: children }), duration);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

  return (
    <div
      style={{
        opacity: state.opacity,
        transition: `opacity ${duration}ms ease-in-out`,
        minHeight: "100%",
      }}
    >
      {state.shown}
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
