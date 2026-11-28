import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@react-three/fiber", () => ({
  Canvas: ({ children, ...props }) => <div role="img" aria-label={props["aria-label"]}>{children}</div>,
  useFrame: () => {},
  useLoader: () => ({ colorSpace: "srgb" }),
}));
vi.mock("@react-three/drei", () => ({ Html: ({ children }) => <>{children}</>, Sparkles: () => null }));

import Hero3D from "./Hero3D.jsx";

describe("Hero3D", () => {
  it("exposes a labelled interactive scene and prompt", () => {
    render(<Hero3D />);
    expect(screen.getByRole("img", { name: "Interactive 3D solar system" })).toBeInTheDocument();
    expect(screen.getByText("CLICK A PLANET TO EXPLORE")).toBeInTheDocument();
  });
});
