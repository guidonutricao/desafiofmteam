-- Script rápido para testar o dashboard
-- Execute este para ver se há dados para mostrar no dashboard

-- Verificação rápida: há dados?
SELECT 
    (SELECT COUNT(*) FROM public.desafios_diarios WHERE pontuacao_total > 0) as registros_desafios,
    (SELECT COUNT(*) FROM public.pontuacoes WHERE pontuacao_total > 0) as registros_pontuacoes;

-- Se há dados, quais usuários têm pontuação?
SELECT 
    p.nome,
    p.user_id,
    'desafios_diarios' as fonte,
    COUNT(*) as registros,
    SUM(dd.pontuacao_total) as pontos_totais
FROM public.profiles p
JOIN public.desafios_diarios dd ON p.user_id = dd.user_id
WHERE dd.pontuacao_total > 0
GROUP BY p.user_id, p.nome

UNION ALL

SELECT 
    p.nome,
    p.user_id,
    'pontuacoes' as fonte,
    1 as registros,
    pt.pontuacao_total as pontos_totais
FROM public.profiles p
JOIN public.pontuacoes pt ON p.user_id = pt.user_id
WHERE pt.pontuacao_total > 0
AND NOT EXISTS (
    SELECT 1 FROM public.desafios_diarios dd 
    WHERE dd.user_id = p.user_id AND dd.pontuacao_total > 0
)

ORDER BY pontos_totais DESC;

-- Exemplo de dados para um usuário (substitua o user_id)
-- SELECT * FROM public.desafios_diarios WHERE user_id = 'seu-user-id' ORDER BY data;