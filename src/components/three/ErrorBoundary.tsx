"use client";
import { Component, type ReactNode } from "react";

interface Props {
  fallback: ReactNode;
  children: ReactNode;
}
interface State {
  failed: boolean;
}

/** Swaps to a procedural fallback if a GLB (or anything inside) throws while loading. */
export class ModelErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch() {
    /* Silent: the fallback is intentional and the page must never break. */
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
