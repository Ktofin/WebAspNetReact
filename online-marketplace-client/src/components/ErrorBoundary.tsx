import React, { Component, ReactNode } from "react";
import { Typography, Box, Button } from "@mui/material";
/**
 * Пропсы для компонента ErrorBoundary.
 * @property {ReactNode} children - Вложенные дочерние компоненты, которые защищаются от ошибок.
 */
interface ErrorBoundaryProps {
    children: ReactNode;
}
/**
 * Состояние компонента ErrorBoundary.
 * @property {boolean} hasError - Флаг, показывающий, произошла ли ошибка.
 */
interface ErrorBoundaryState {
    hasError: boolean;
}
/**
 * Компонент-обёртка для отлова ошибок в React.
 * Используется для предотвращения краха всего приложения при возникновении исключения в одном из дочерних компонентов.
 * Показывает fallback-интерфейс и кнопку для перезагрузки страницы.
 *
 * @example
 * <ErrorBoundary>
 *   <SomeComponent />
 * </ErrorBoundary>
 */

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }
    /**
     * Метод жизненного цикла React, который вызывается при возникновении ошибки в дочерних компонентах.
     * @returns {ErrorBoundaryState} Состояние с флагом ошибки.
     */
    static getDerivedStateFromError(_: Error): ErrorBoundaryState {
        return { hasError: true };
    }
    /**
     * Логирование ошибки и информации о ней в консоль.
     * @param {Error} error - Сам объект ошибки.
     * @param {React.ErrorInfo} errorInfo - Дополнительная информация об ошибке.
     */
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }
    /**
     * Обновляет страницу при нажатии на кнопку "Обновить".
     */
    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <Box sx={{ p: 4, textAlign: "center" }}>
                    <Typography variant="h5" gutterBottom>
                        Что-то пошло не так 😥
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        Произошла непредвиденная ошибка. Попробуйте обновить страницу.
                    </Typography>
                    <Button variant="contained" onClick={this.handleReload}>
                        🔄 Обновить
                    </Button>
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
