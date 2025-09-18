import { Request, Response } from 'express';
import { 
    S3Client, 
    PutObjectCommand, 
    GetObjectCommand,
    DeleteObjectCommand
} from '@aws-sdk/client-s3';

// Cria uma instância do S3Client. O SDK usará o IAM Role da instância EC2.
const s3Client = new S3Client({ region: process.env.AWS_REGION });
const bucketName = process.env.S3_BUCKET_NAME;

// Validação inicial para o nome do bucket
if (!bucketName) {
    console.error("Variável de ambiente 'S3_BUCKET_NAME' não está definida.");
    process.exit(1);
}

// 1. Função para Fazer Upload de Arquivo
export const uploadFileController = async (req: Request, res: Response) => {
    const file = req.file;

    if (!file) {
        return res.status(400).send('Nenhum arquivo enviado.');
    }

    const keyName = `img-produto/${Date.now()}-${file.originalname}`;
    const params = {
        Bucket: bucketName,
        Key: keyName,
        Body: file.buffer,
        ContentType: file.mimetype,
    };

    try {
        const command = new PutObjectCommand(params);
        await s3Client.send(command);

        console.log(`Arquivo ${keyName} enviado com sucesso para o S3.`);
        res.status(200).json({
            message: 'Arquivo enviado com sucesso!',
            fileUrl: `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${keyName}`
        });
    } catch (error) {
        console.error('Erro ao fazer upload para o S3:', error);
        res.status(500).send('Erro no servidor ao enviar o arquivo.');
    }
};

// 2. Função para Obter um Arquivo
export const getFileController = async (req: Request, res: Response) => {
    const keyName = req.params.keyName;

    try {
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: keyName,
        });

        const response = await s3Client.send(command);

        if (response.Body) {
            res.setHeader('Content-Type', response.ContentType || 'application/octet-stream');
            res.setHeader('Content-Length', response.ContentLength || 0);
            (response.Body as any).pipe(res);
        } else {
            res.status(404).send('Arquivo não encontrado.');
        }
    } catch (error: any) {
        if (error.Code === 'NoSuchKey') {
            res.status(404).send('Arquivo não encontrado no S3.');
        } else {
            console.error('Erro ao recuperar arquivo do S3:', error);
            res.status(500).send('Erro no servidor ao recuperar o arquivo.');
        }
    }
};

// 3. Função para Excluir um Arquivo
export const deleteFileController = async (req: Request, res: Response) => {
    const keyName = req.params.keyName;

    try {
        const command = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: keyName,
        });

        await s3Client.send(command);

        console.log(`Arquivo ${keyName} excluído com sucesso do S3.`);
        res.status(200).send('Arquivo excluído com sucesso!');
    } catch (error) {
        console.error('Erro ao excluir arquivo do S3:', error);
        res.status(500).send('Erro no servidor ao excluir o arquivo.');
    }
};