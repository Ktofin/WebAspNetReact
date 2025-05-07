import React from "react";
import Navbar from "./Navbar";
import { Container, Box } from "@mui/material";

/**
 * Свойства компонента MainLayout.
 * @property {React.ReactNode} children - Контент, отображаемый внутри макета.
 */
interface Props {
    children: React.ReactNode;
}
/**
 * Основной макет страницы, включающий навигационную панель и контейнер.
 * Используется для обёртки всех страниц приложения.
 *
 * @component
 * @example
 * <MainLayout>
 *   <HomePage />
 * </MainLayout>
 */
const MainLayout: React.FC<Props> = ({ children }) => {
    return (
        <>
            <Navbar />
            <Box sx={{ backgroundColor: "background.default", color: "text.primary" }}>
                <Container maxWidth="lg">
                    {children}
                </Container>
            </Box>
        </>
    );
};

export default MainLayout;
