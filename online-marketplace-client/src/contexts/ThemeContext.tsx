import React, { createContext, useContext, useMemo, useState } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { getTheme } from "../theme";
/**
 * Тип для режима темы: светлая или тёмная.
 */
type ThemeMode = "light" | "dark";
/**
 * Интерфейс контекста темы.
 * @property {ThemeMode} mode - Текущий режим темы.
 * @property {() => void} toggleMode - Функция переключения между светлой и тёмной темами.
 */
interface ThemeContextType {
    mode: ThemeMode;
    toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
/**
 * Хук для доступа к контексту темы.
 * @throws {Error} Если используется вне CustomThemeProvider.
 * @returns {ThemeContextType} Контекст темы.
 */
export const useThemeMode = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error("useThemeMode must be used within ThemeProvider");
    return context;
};
/**
 * Провайдер темы приложения.
 * Управляет переключением между светлой и тёмной темой и оборачивает приложение в MUI ThemeProvider.
 *
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Дочерние компоненты.
 * @returns {JSX.Element} Компонент-провайдер темы.
 */

export const CustomThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mode, setMode] = useState<ThemeMode>("light");
    /**
     * Переключает тему между светлой и тёмной.
     */
    const toggleMode = () => setMode((prev) => (prev === "light" ? "dark" : "light"));
    /**
     * Кешированное значение темы для предотвращения лишних ререндеров.
     */
    const theme = useMemo(() => getTheme(mode), [mode]);

    return (
        <ThemeContext.Provider value={{ mode, toggleMode }}>
            <ThemeProvider theme={theme}>
                <CssBaseline />

                    {children}

            </ThemeProvider>
        </ThemeContext.Provider>
    );
};

