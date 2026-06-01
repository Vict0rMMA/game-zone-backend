import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import routes from './interface/routes';
import { errorHandler } from './interface/middlewares/errorHandler';

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => { res.json({ status: 'ok' }); });

app.use('/api/v1', routes);

app.use((_req, res) => { res.status(404).json({ message: 'Ruta no encontrada' }); });

app.use(errorHandler);

export default app;
