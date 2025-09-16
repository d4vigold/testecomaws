import express from 'express';
import dotenv from 'dotenv';
import rotasImagem from './rotas/imagem.ts';
import cors from "cors";

dotenv.config();
const app = express();

//Middlewares
app.use(cors());
app.use(express.json());

//Roteador Middleware
app.use('/api', rotasImagem);

const port = process.env.PORT || 4000;
app.listen(port,() => {
    console.log(`Node server está funcionando na porta ${port}`);
});