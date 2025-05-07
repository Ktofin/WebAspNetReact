// components/Pages/CheckoutForm.tsx
import React, { useState } from "react";
import { TextField, Button, Box } from "@mui/material";

/**
 * Свойства компонента CheckoutForm.
 * @property {function} onSubmit - Колбэк, вызываемый при подтверждении адреса доставки.
 */

interface Props {
    onSubmit: (shippingAddress: string) => void;
}

/**
 * Форма оформления заказа.
 * Позволяет пользователю ввести адрес доставки и подтвердить заказ.
 *
 * @component
 * @example
 * <CheckoutForm onSubmit={(address) => console.log(address)} />
 */
const CheckoutForm: React.FC<Props> = ({ onSubmit }) => {
    const [address, setAddress] = useState("");

    /**
     * Обработка подтверждения формы.
     * Вызывает колбэк `onSubmit`, если адрес не пустой.
     */
    const handleSubmit = () => {
        if (address.trim() === "") return;
        onSubmit(address);
    };

    return (
        <Box display="flex" flexDirection="column" gap={2} mt={2}>
            <TextField
                label="Адрес доставки"
                fullWidth
                value={address}
                onChange={(e) => setAddress(e.target.value)}
            />
            <Button variant="contained" onClick={handleSubmit}>
                Подтвердить заказ
            </Button>
        </Box>
    );
};

export default CheckoutForm;
