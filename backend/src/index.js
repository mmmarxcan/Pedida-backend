import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.resolve(__dirname, '../..', 'frontend', 'dist');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(frontendDistPath));

app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Servidor Activo y listo'
    });
});

app.post('/api/proposal', (req, res) => {
    const { answer, attemptsNo, timestamp } = req.body;
    console.log(`Propuesta registrada: ${answer}, Intentos en No: ${attemptsNo}, Hora: ${timestamp}`);
    res.json({ success: true, message: '¡Guardado correctamente en el servidor!' });
});

app.get('/*', (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


