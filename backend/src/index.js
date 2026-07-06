import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Servidor Activo y listo'
    });
});

app.post('/api/proposal', (req, res) => {
    const {answer, attemptsNo , timestamp} = req.body;
    console.log(`Propuesta registrada: ${answer}, Intentos en No: ${attemptsNo}, Hora: ${timestamp}`);
  res.json({ success: true, message: '¡Guardado correctamente en el servidor!' });
});

app.listen(PORT,()=> {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


