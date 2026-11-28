import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App.jsx";
import { getAthletes, getSports, sendMessage } from "./api.js";

vi.mock("./api.js", () => ({
  getAthletes: vi.fn(), getSports: vi.fn(), sendMessage: vi.fn(),
  getMatches: vi.fn(), getMatch: vi.fn(), getAthlete: vi.fn(), askScout: vi.fn(), saveMatch: vi.fn(),
}));
vi.mock("./components/Hero3D.jsx", () => ({ default: () => <div>3D scene</div> }));

function renderAt(path) {
  return render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>);
}

describe("app routes and forms", () => {
  beforeEach(() => {
    getAthletes.mockResolvedValue([{ id: "1", name: "P. V. Sindhu", sport: "Badminton", tagline: "Champion" }]);
    getSports.mockResolvedValue(["Badminton", "Cricket"]);
    sendMessage.mockResolvedValue({ status: "sent" });
  });

  it("renders the athletes route and searches by name", async () => {
    const user = userEvent.setup();
    renderAt("/athletes");
    expect(await screen.findByText("P. V. Sindhu")).toBeInTheDocument();
    await user.type(screen.getByRole("searchbox", { name: /search indian athletes/i }), "Sindhu");
    await waitFor(() => expect(getAthletes).toHaveBeenLastCalledWith({ sport: "", q: "Sindhu" }));
  });

  it("sends the contact form and shows a success message", async () => {
    const user = userEvent.setup();
    renderAt("/contact");
    await user.type(screen.getByLabelText("Name"), "A User");
    await user.type(screen.getByLabelText("Email"), "a@example.org");
    await user.type(screen.getByLabelText("Message"), "I would like to learn more.");
    await user.click(screen.getByRole("button", { name: "Send message" }));
    expect(await screen.findByText(/message sent/i)).toBeInTheDocument();
    expect(sendMessage).toHaveBeenCalledWith({ name: "A User", email: "a@example.org", message: "I would like to learn more." });
  });

  it("shows the not found route", () => {
    renderAt("/missing-page");
    expect(screen.getByText("Page not found.")).toBeInTheDocument();
  });
});
