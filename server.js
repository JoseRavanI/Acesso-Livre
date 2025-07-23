const express = require('express');
const path = require('path');
const app = express();

const rotas = {
  "portaria-biblioteca": [
    "Saia da portaria e siga em frente por 50 metros.",
    "Vire à esquerda após o pátio central.",
    "A biblioteca estará à sua direita."
  ],
  "portaria-auditorio": [
    "Saia da portaria e vire à direita.",
    "Siga até o final do corredor.",
    "O auditório estará à sua frente."
  ],
  "biblioteca-auditorio": [
    "Saia da biblioteca e siga pelo corredor principal.",
    "Vire à esquerda no segundo cruzamento.",
    "O auditório estará ao lado do laboratório de informática."
  ]
};

app.use(express.static(path.join(__dirname, 'public')));

app.get('/rota', (req, res) => {
  const origem = req.query.origem?.toLowerCase().trim();
  const destino = req.query.destino?.toLowerCase().trim();

  if (!origem || !destino || origem === destino) {
    return res.json({ erro: "Origem e destino devem ser diferentes e válidos." });
  }

  const chave = `${origem}-${destino}`.replace(/ç/g, 'c');

  if (rotas[chave]) {
    return res.json({ passo_a_passo: rotas[chave] });
  }

  return res.json({ erro: "Rota não encontrada. Tente usar locais como Portaria, Biblioteca ou Auditório." });
});

const PORTA = 3000;
app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});
