import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 静态文件服务（如果以后需要存放图片等）
const dataPath = path.join(__dirname, '../data/novels');

// 获取所有小说列表
app.get('/api/novels', async (req, res) => {
    try {
        const files = await fs.readdir(dataPath);
        const novels = await Promise.all(
            files.filter(file => file.endsWith('.json')).map(async file => {
                const content = await fs.readFile(path.join(dataPath, file), 'utf-8');
                const data = JSON.parse(content);
                return {
                    id: file.replace('.json', ''),
                    title: data.title,
                    author: data.author,
                    cover: data.cover,
                    description: data.summary || data.description,
                    tags: data.tags,
                    rating: data.rating,
                    status: data.status
                };
            })
        );
        res.json(novels);
    } catch (error) {
        console.error('Error reading novels:', error);
        res.status(500).json({ error: 'Failed to fetch novels' });
    }
});

// 获取特定小说详情
app.get('/api/novels/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const filePath = path.join(dataPath, `${id}.json`);
        const content = await fs.readFile(filePath, 'utf-8');
        res.json(JSON.parse(content));
    } catch (error) {
        console.error('Error reading novel detail:', error);
        res.status(404).json({ error: 'Novel not found' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
