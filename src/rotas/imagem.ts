import { Router } from 'express';
import multer from 'multer';
import { uploadFileController } from '../controladores/uploadImagem.ts';

const roteador = Router();

// Configuração do Multer para armazenar o arquivo em memória
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

roteador.post('/upload', upload.single('image'), uploadFileController);

export default roteador;