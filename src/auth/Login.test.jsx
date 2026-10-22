import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Login from "./Login";

vi.mock("../services/authService", () => ({
  login: vi.fn(),
  forgotPassword: vi.fn(),
  googleLogin: vi.fn(),
}));

vi.mock("../firebase/firebase", () => ({
  auth: {},
}));

vi.mock("firebase/auth", () => ({
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
}));

vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

describe("Login Component", () => {
  it("should render the login form correctly", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(
      screen.getByText("Sign In to")
    ).toBeInTheDocument();

    expect(screen.getByPlaceholderText("name@example.com")).toBeInTheDocument();

    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Sign In" })
    ).toBeInTheDocument();
  });

  it("should show validation errors when form is submitted empty", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Sign In" })
    );

    expect(
      screen.getByText("Email address is required.")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Password is required.")
    ).toBeInTheDocument();
  });
});