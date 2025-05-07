import React, { useEffect, useState } from 'react';
import {
    Paper,
    Typography,
    Box,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../contexts/AuthContext';
import AddCategoryForm from './AddCategoryForm';
/**
 * Интерфейс категории.
 */
interface Category {
    id: number;
    name: string;
    description: string;
    parentCategoryId: number | null;
}
/**
 * Интерфейс связи пользователя и категории.
 */

interface UserCategory {
    userId: string;
    categoryId: number;
}
/**
 * Компонент управления категориями продавца.
 * Отображает иерархический список доступных категорий и позволяет удалять или добавлять новые.
 *
 * @component
 * @example
 * return <SellerCategories />;
 */
const SellerCategories: React.FC = () => {
    const { userId } = useAuth();

    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [myCategories, setMyCategories] = useState<UserCategory[]>([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadAll();
    }, []);
    /**
     * Загружает все категории и связанные с текущим пользователем.
     */
    const loadAll = async () => {
        const [allRes, userRes] = await Promise.all([
            fetch('/api/category'),
            fetch('/api/usercategory/my')
        ]);

        const all = await allRes.json();
        const mine = await userRes.json();
        setAllCategories(all);
        setMyCategories(mine);
    };
    /**
     * Обрабатывает удаление категории по ID.
     * @param categoryId ID категории
     */
    const handleDelete = async (categoryId: number) => {
        if (!window.confirm('Удалить эту категорию?')) return;

        const res = await fetch(`/api/category/${categoryId}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            setMessage('✅ Категория удалена');
            await loadAll(); // 👈 вот эта строка обновит UI
        } else {
            const err = await res.text();
            setMessage(`❌ Ошибка при удалении: ${err}`);
        }
    };

    // Получение только тех объектов категорий, которые связаны с пользователем
    const myCategoryIds = myCategories.map((uc) => uc.categoryId);
    const myCategoryObjects = allCategories.filter((cat) => myCategoryIds.includes(cat.id));
    /**
     * Рекурсивно отображает дерево категорий продавца.
     * @param parentId Родительская категория или null
     * @param level Глубина вложенности
     */
    const renderCategoryTree = (parentId: number | null = null, level = 0) => {
        return myCategoryObjects
            .filter(cat => cat.parentCategoryId === parentId)
            .map(cat => (
                <ListItem key={cat.id} secondaryAction={
                    <IconButton edge="end" onClick={() => handleDelete(cat.id)}>
                        <DeleteIcon />
                    </IconButton>
                }>
                    <ListItemText
                        primary={`${'— '.repeat(level)}${cat.name}`}
                        secondary={cat.description}
                    />
                    {renderCategoryTree(cat.id, level + 1)}
                </ListItem>
            ));
    };

    return (
        <Paper sx={{ padding: 4 }}>
            <Typography variant="h6" gutterBottom>
                Категории продавца
            </Typography>

            <List>
                {renderCategoryTree()}
            </List>

            {message && (
                <Alert sx={{ mt: 2 }} severity={message.startsWith('✅') ? 'success' : 'error'}>
                    {message}
                </Alert>
            )}

            <AddCategoryForm onCreated={loadAll} />
        </Paper>
    );
};

export default SellerCategories;
