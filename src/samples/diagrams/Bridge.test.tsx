import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Bridge } from "./Bridge";

describe("Bridge", () => {
  test("is a still picture with no animated parts", () => {
    const { container } = render(<Bridge />);
    const svg = container.querySelector('[data-visual="bridge"]')!;
    expect(svg).not.toBeNull();
    expect(svg.querySelectorAll('[class*="bridge-"], [style]')).toHaveLength(0);
  });
});
