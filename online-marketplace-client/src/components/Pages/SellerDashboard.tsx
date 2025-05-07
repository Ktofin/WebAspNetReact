import React, { useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    Tabs,
    Tab,
    Box
} from '@mui/material';
import MyProducts from './MyProducts'; // путь к твоему компоненту
import AddProductForm from './AddProductForm';
import SellerCategories from './SellerCategories';
import SellerOrders from './SellerOrders';


/**
 * Панель управления продавца.
 * Содержит вкладки:
 * - список товаров,
 * - добавление товара,
 * - управление категориями,
 * - просмотр заказов.
 *
 * @component
 * @example
 * return <SellerDashboard />;
 */
const SellerDashboard: React.FC = () => {
    const [tabIndex, setTabIndex] = useState(0);
    /**
     * Обработчик переключения вкладок.
     * @param event Событие клика
     * @param newValue Индекс новой вкладки
     */

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
    };

    return (
        <Container maxWidth="lg">
            <Paper elevation={3} sx={{ padding: 4, marginTop: 8 }}>
                <Typography variant="h4" gutterBottom>
                    Панель продавца
                </Typography>

                <Tabs value={tabIndex} onChange={handleChange} sx={{ marginBottom: 2 }}>
                    <Tab label="Мои товары" />
                    <Tab label="Добавить товар" />
                    <Tab label="Категории" />
                    <Tab label="Покупки" />

                </Tabs>

                <Box>
                    {tabIndex === 0 && <MyProducts />}

                    {tabIndex === 1 && <AddProductForm />}

                    {tabIndex === 2 && <SellerCategories />}

                    {tabIndex === 3 && <SellerOrders />}



                </Box>
            </Paper>
        </Container>
    );
};

export default SellerDashboard;
