import { Router, Request, Response } from 'express';
import { NcmClassificacaoService } from '../services/ncm-classificacao.service';

const router = Router();
const service = new NcmClassificacaoService();

router.post('/ncm-classificacao', async (req: Request, res: Response) => {
    try {
        const { descricao } = req.body;

        if (!descricao) {
            return res.status(400).json({ error: 'O campo descrição é orbigatório' });
        }

        const resultado = await service.obterNcmPorDescricao(descricao);
        res.json({ resultado });

    } catch (error: any) {
        return res.status(502).json({
            error: 'Falha ao comunicar com a API externa',
            details: error.message
        })
    }
});

export default router;