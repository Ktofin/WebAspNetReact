/**
 * Модуль тестирования компонента Shop.
 * Использует React Testing Library и мокает `fetch`, чтобы проверить,
 * что компонент корректно загружает и отображает список товаров.
 *
 * Тест:
 * - устанавливает данные пользователя в localStorage;
 * - мокаeт `fetch`, чтобы вернуть один товар;
 * - проверяет, что заголовок и товар отображаются на странице.
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import Shop from "../components/Pages/Shop"
import { AuthProvider } from "../contexts/AuthContext"

// Мокаем глобальную функцию fetch для возврата фиктивного товара
global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () =>
            Promise.resolve([
                {
                    id: 1,
                    name: "Тестовый товар",
                    description: "Описание",
                    price: 100,
                    isAvailable: true,
                    categoryName: "Электроника",
                },
            ]),
    })
) as jest.Mock;

describe("Shop", () => {
    // Устанавливаем фиктивные данные пользователя перед каждым тестом
    beforeEach(() => {
        localStorage.setItem("userId", "123");
        localStorage.setItem("role", "Buyer");
        localStorage.setItem("username", "testbuyer");
    });
    // Очищаем после каждого теста
    afterEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });
    /**
     * Проверяет, что заголовок и товар успешно отображаются.
     */
    it("отображает заголовок и товар", async () => {
        render(
            <AuthProvider>
                <Shop />
            </AuthProvider>
        );
        // Проверка наличия заголовка
        expect(screen.getByText(/Каталог товаров/i)).toBeInTheDocument();
        // Ожидаем появления товара в DOM
        await waitFor(() => {
            expect(screen.getByText("Тестовый товар")).toBeInTheDocument();
        });
    });
});