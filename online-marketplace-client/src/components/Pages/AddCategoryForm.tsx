import React, { useEffect, useState } from 'react';
import {
    TextField,
    Button,
    MenuItem,
    Box,
    Typography,
    Alert
} from '@mui/material';
/**
 * Интерфейс категории, получаемой с сервера.
 */
interface Category {
    id: number;
    name: string;
}
/**
 * Свойства компонента AddCategoryForm.
 * @property {() => void} onCreated - Колбэк, вызываемый после успешного создания категории.
 */
interface Props {
    onCreated: () => void;
}
/**
 * Форма добавления новой категории или подкатегории.
 *
 * Загружает доступные категории, позволяет выбрать родительскую и создать новую.
 * Отображает сообщения об успехе или ошибке.
 *
 * @component
 * @example
 * <AddCategoryForm onCreated={() => fetchCategories()} />
 */
const AddCategoryForm: React.FC<Props> = ({ onCreated }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [parentId, setParentId] = useState<number | ''>('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetch('/api/category')
            .then(res => res.json())
            .then(data => setCategories(data));
    }, []);

    const handleSubmit = async () => {
        setMessage('');
        const dto = {
            name,
            description,
            parentCategoryId: parentId === '' ? null : parentId,
            products: [] // 👈 обязательно
        };

        const res = await fetch('/api/category', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dto)
        });

        if (res.ok) {
            setMessage('✅ Категория создана');
            setName('');
            setDescription('');
            setParentId('');
            onCreated();
        } else {
            const err = await res.text();
            setMessage(`❌ Ошибка: ${err}`);
        }
    };

    return (
        <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
                Создать категорию или подкатегорию
            </Typography>

            <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                    label="Название"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                />
                <TextField
                    label="Описание"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    fullWidth
                />
                <TextField
                    label="Родительская категория"
                    select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value === '' ? '' : Number(e.target.value))}
                    fullWidth
                >
                    <MenuItem value="">Нет (основная категория)</MenuItem>
                    {categories.map((cat) => (
                        <MenuItem key={cat.id} value={cat.id}>
                            {cat.name}
                        </MenuItem>
                    ))}
                </TextField>

                {message && <Alert severity={message.startsWith('✅') ? 'success' : 'error'}>{message}</Alert>}

                <Button variant="contained" onClick={handleSubmit}>
                    Создать
                </Button>
            </Box>
        </Box>
    );
};

export default AddCategoryForm;
