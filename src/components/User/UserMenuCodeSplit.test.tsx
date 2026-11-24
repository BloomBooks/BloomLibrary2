import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";
import { vi, describe, it, expect } from "vitest";
import { UserMenuCodeSplit } from "./UserMenuCodeSplit";

const mounts = vi.hoisted(() => ({ count: 0 }));

// Stands in for the real UserMenu, which starts each mount showing nobody logged in.
vi.mock("./UserMenu", () => {
    const FakeUserMenu = () => {
        useEffect(() => {
            mounts.count++;
        }, []);
        return <div id="fake-user-menu" />;
    };
    return { default: FakeUserMenu };
});

describe("UserMenuCodeSplit", () => {
    // The Header re-renders on every navigation. If that remounted UserMenu, a logged-in user
    // would briefly see the logged-out icon (BL-17174).
    it("keeps the same UserMenu across re-renders", async () => {
        const container = document.createElement("div");
        document.body.appendChild(container);

        await act(async () => {
            ReactDOM.render(
                <UserMenuCodeSplit buttonHeight="48px" />,
                container
            );
        });
        // let the lazy import resolve
        await act(async () => {
            await new Promise((r) => setTimeout(r, 0));
        });
        expect(container.querySelector("#fake-user-menu")).not.toBeNull();
        expect(mounts.count).toBe(1);

        for (let i = 0; i < 3; i++) {
            await act(async () => {
                ReactDOM.render(
                    <UserMenuCodeSplit buttonHeight="48px" />,
                    container
                );
            });
        }
        await act(async () => {
            await new Promise((r) => setTimeout(r, 0));
        });

        expect(mounts.count).toBe(1);
        ReactDOM.unmountComponentAtNode(container);
        container.remove();
    });
});
