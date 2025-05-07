import React, { useEffect, useState } from 'react';
import {
    TextField,
    Button,
    Paper,
    Typography,
    MenuItem,
    Box,
    Alert
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Интерфейс категории товара.
 */
interface Category {
    id: number;
    name: string;
}

/**
 * Компонент формы добавления нового товара.
 *
 * Поддерживает:
 * - Выбор категории
 * - Загрузку изображения с предпросмотром
 * - Отправку товара на сервер через POST /api/product
 * - Проверку обязательных полей
 * - Отображение результата (успех/ошибка)
 *
 * @component
 * @example
 * return <AddProductForm />;
 */
const AddProductForm: React.FC = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState(0);
    const [categoryId, setCategoryId] = useState<number | ''>('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [message, setMessage] = useState('');

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const { userId, username } = useAuth();

    useEffect(() => {
        const loadCategories = async () => {
            const res = await fetch('/api/category');
            const data = await res.json();
            setCategories(data);
        };
        loadCategories();
    }, []);

    /**
     * Обрабатывает выбор изображения и устанавливает предпросмотр.
     * @param e Событие выбора файла.
     */
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setImageFile(file);

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

    /**
     * Конвертирует выбранное изображение в строку base64 без префикса.
     * @returns {Promise<string>} Строка изображения в base64.
     */
    const convertImageToBase64 = (): Promise<string> => {
        return new Promise((resolve, reject) => {
            if (!imageFile) return resolve('');
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = (reader.result as string);
                const cleanBase64 = base64.split(',')[1]; // <-- Удаляем префикс
                resolve(cleanBase64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(imageFile);
        });
    };

    /**
     * Обрабатывает отправку формы: валидация, отправка данных на сервер, сброс полей.
     */
    const handleSubmit = async () => {
        setMessage('');

        if (!name || !description || !price || categoryId === '') {
            setMessage('❗ Все поля обязательны');
            return;
        }

        const imageData = await convertImageToBase64();

        const product = {
            name,
            description,
            price,
            categoryId,
            isAvailable: true,
            sellerId: userId,
            sellerUsername: username,
            imageData,
            categoryName: ""
        };

        const res = await fetch('/api/product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });

        if (res.ok) {
            setMessage('✅ Товар успешно добавлен!');
            setName('');
            setDescription('');
            setPrice(0);
            setCategoryId('');
            setImageFile(null);
            setImagePreview(null);
        } else {
            const err = await res.text();
            setMessage(`❌ Ошибка при добавлении товара: ${err}`);
        }
    };

    return (
        <Paper sx={{ padding: 4 }}>
            <Typography variant="h6" gutterBottom>
                Добавить товар
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                    label="Название"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                />
                <TextField
                    label="Описание"
                    multiline
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    fullWidth
                />
                <TextField
                    label="Цена"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    fullWidth
                />
                <TextField
                    label="Категория"
                    select
                    value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    fullWidth
                >
                    {categories.map((cat) => (
                        <MenuItem key={cat.id} value={cat.id}>
                            {cat.name}
                        </MenuItem>
                    ))}
                </TextField>

                {/* 👇 Загрузка изображения */}
                <Button variant="outlined" component="label">
                    Загрузить изображение
                    <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                </Button>

                {imagePreview && (
                    <Box>
                        <Typography variant="caption">Предпросмотр:</Typography>
                        <img src={imagePreview} alt="Предпросмотр" style={{ maxWidth: 200, maxHeight: 200 }} />
                    </Box>
                )}

                {message && (
                    <Alert severity={message.startsWith('✅') ? 'success' : 'error'}>
                        {message}
                    </Alert>
                )}

                <Button variant="contained" onClick={handleSubmit}>
                    Добавить
                </Button>
            </Box>
        </Paper>
    );
};

export default AddProductForm;
