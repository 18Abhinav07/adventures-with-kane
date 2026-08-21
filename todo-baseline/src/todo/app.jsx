import { useReducer, useEffect } from "react";
import { Header } from "./components/header";
import { Main } from "./components/main";
import { Footer } from "./components/footer";

import { todoReducer } from "./reducer";

import "./app.css";

const STORAGE_KEY = "todomvc-react-todos";

function loadTodos() {
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        // Corrupt or inaccessible storage shouldn't crash the app.
        return [];
    }
}

export function App() {
    const [todos, dispatch] = useReducer(todoReducer, undefined, loadTodos);

    useEffect(() => {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
        } catch {
            // Ignore storage failures (e.g. quota exceeded, private mode).
        }
    }, [todos]);

    return (
        <>
            <Header dispatch={dispatch} />
            <Main todos={todos} dispatch={dispatch} />
            <Footer todos={todos} dispatch={dispatch} />
        </>
    );
}
