import { useCallback } from "react";
import { Input } from "./input";

import { ADD_ITEM } from "../constants";

const PRIORITY_TAG = /\s*!(high|medium|low)\s*$/i;

export function Header({ dispatch }) {
    const addItem = useCallback(
        (rawTitle) => {
            const match = rawTitle.match(PRIORITY_TAG);
            const title = match ? rawTitle.slice(0, match.index).trim() : rawTitle;
            const priority = match ? match[1].toLowerCase() : "medium";
            dispatch({ type: ADD_ITEM, payload: { title, priority } });
        },
        [dispatch]
    );

    return (
        <header className="header" data-testid="header">
            <h1>todos</h1>
            <Input onSubmit={addItem} label="New Todo Input" placeholder="What needs to be done?" />
        </header>
    );
}
