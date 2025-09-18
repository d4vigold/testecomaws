import { Router } from 'express';
import multer from 'multer';
import { 
    uploadFileController,
    getFileController,
    deleteFileController
} from '../controladores/imagem.ts';

const router = Router();

// Configuração do Multer para upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Rotas para as operações
router.post('/', upload.single('image'), uploadFileController); // Rota de UPLOAD

router.get('/:keyName', getFileController);    // Rota para GET (ex: GET /upload/uploads/imagem.jpg)

router.delete('/:keyName', deleteFileController); // Rota para DELETE (ex: DELETE /upload/uploads/imagem.jpg)

export default router;