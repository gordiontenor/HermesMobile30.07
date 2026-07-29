import React from "react";
import { render } from "@testing-library/react-native";
import { HermesCard } from "../HermesCard";

describe("HermesCard", () => {
  it("renders the title", async () => {
    const { getByText } = await render(<HermesCard title="Test Title" />);
    expect(getByText("Test Title")).toBeTruthy();
  });

  it("renders the subtitle when provided", async () => {
    const { getByText } = await render(
      <HermesCard title="Title" subtitle="Test Subtitle" />,
    );
    expect(getByText("Test Subtitle")).toBeTruthy();
  });

  it("renders children", async () => {
    const { getByText } = await render(
      <HermesCard title="Title">
        <HermesCard title="Child" />
      </HermesCard>,
    );
    expect(getByText("Child")).toBeTruthy();
  });
});
