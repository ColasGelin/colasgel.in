import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import Diagram from "@/samples/Diagram";
import Gallery from "@/samples/Gallery";
import { SampleSkeleton } from "@/samples/SampleSkeleton";
import { Portfolio } from "./Portfolio";

describe("first paint", () => {
  const html = () => renderToString(<Portfolio />);

  test("the default diagram is already in the page", () => {
    expect(html()).toContain('data-diagram="cyberbridge"');
  });

  test("shows no loading text", () => {
    expect(html()).not.toContain("Loading sample");
  });

  test("the side stage is hidden by CSS on phones", () => {
    expect(html()).toMatch(/class="hidden [^"]*md:block/);
  });
});

test("the skeleton shows no visible text", () => {
  render(<SampleSkeleton className="h-10" />);
  expect(screen.getByRole("status")).toHaveTextContent("");
  expect(screen.getByRole("status")).toHaveAccessibleName("Loading sample");
});

test("gallery images reserve their space", () => {
  render(
    <Gallery
      spec={{
        kind: "gallery",
        images: [
          { src: "/a.webp", alt: "a", caption: "c", width: 960, height: 550 },
        ],
      }}
      onError={vi.fn()}
    />,
  );
  const image = screen.getByAltText("a");
  expect(image).toHaveAttribute("width", "960");
  expect(image).toHaveAttribute("height", "550");
});

test("the 42 map uses the logo, not text", () => {
  const { container } = render(
    <Diagram
      spec={{ kind: "diagram", id: "school42", caption: "c" }}
      onError={vi.fn()}
    />,
  );
  expect(container.querySelector("[data-logo='42'] polygon")).not.toBeNull();
  expect(screen.queryByText("42")).not.toBeInTheDocument();
});
