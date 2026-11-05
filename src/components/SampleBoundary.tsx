"use client";

import { Component, type ReactNode } from "react";

type Props = {
  fallback: ReactNode;
  children: (onError: (error: Error) => void) => ReactNode;
};

export class SampleBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  handleError = () => this.setState({ failed: true });

  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children(this.handleError);
  }
}
