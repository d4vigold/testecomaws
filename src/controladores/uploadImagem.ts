import { Request, Response } from 'express';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Cria uma instância do S3Client. O SDK usará o IAM Role da instância EC2.
const s3Client = new S3Client({ region: process.env.AWS_REGION });

// A lógica de upload em uma função de controlador separada
export const uploadFileController = async (req: Request, res: Response) => {
    const file = req.file;
    const bucketName = process.env.S3_BUCKET_NAME;

    if (!file || !bucketName) {
        return res.status(400).send('Nenhum arquivo enviado ou nome do bucket não configurado.');
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