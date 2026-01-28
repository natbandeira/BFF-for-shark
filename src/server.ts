import express from 'express';
import dotenv from 'dotenv';
import ncmRoutes from './routes/ncm-classificacao.routes'

dotenv.config();

const app = express();
app.use(express.json());

app.use(ncmRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`BFF rodando na porta ${PORT}`);
});