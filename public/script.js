const botao = document.getElementById("btn-voz");
const mensagem = document.getElementById("mensagem");

let origem = "";
let destino = "";

const synth = window.speechSynthesis;
const reconhecimento = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
reconhecimento.lang = 'pt-BR';
reconhecimento.interimResults = false;  // só resultados finais, sem parciais
reconhecimento.continuous = false;      // para reconhecer uma fala por vez e só parar depois que acabar

let reconhecendo = false;

function falar(texto, depoisFalar) {
  if (reconhecendo) {
    reconhecimento.abort(); // para reconhecimento antes de falar
    reconhecendo = false;
  }

  const fala = new SpeechSynthesisUtterance(texto);
  fala.lang = 'pt-BR';

  fala.onstart = () => {
    console.log("Falando:", texto);
  };

  fala.onend = () => {
    console.log("Terminou de falar.");
    if (depoisFalar) depoisFalar();
  };

  speechSynthesis.speak(fala);
}

function ouvir(callback) {
  let falaCompleta = "";

  reconhecimento.interimResults = true;  // para ir recebendo resultado parcial
  reconhecimento.continuous = true;      // ouvir continuamente até parar manualmente

  let timer = null;

  reconhecimento.onresult = (event) => {
    // concatena resultados parciais/finais
    falaCompleta = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      falaCompleta += event.results[i][0].transcript;
    }
    console.log("Falando:", falaCompleta);

    // toda vez que fala algo, reinicia o timer para esperar 10 segundos
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      reconhecimento.stop();
      callback(falaCompleta.toLowerCase().trim());
    }, 5000); // 5 segundos de espera após a última fala
  };

  reconhecimento.onerror = (event) => {
    console.error("Erro de reconhecimento:", event.error);
    falar("Não consegui entender. Tente novamente.");
    if (timer) clearTimeout(timer);
  };

  reconhecimento.onend = () => {
    console.log("Reconhecimento terminou.");
    // Se quiser, pode reiniciar automaticamente aqui, mas cuidado para não travar loop
  };

  try {
    reconhecimento.start();
  } catch (e) {
    reconhecimento.stop();
    setTimeout(() => reconhecimento.start(), 250);
  }
}


function iniciar() {
  falar("Olá, diga onde você está.", () => {
    reconhecendo = true;
    ouvir((respostaOrigem) => {
      reconhecendo = false;
      mensagem.textContent = `Origem: ${respostaOrigem}`;
      falar("Agora, diga para onde você quer ir.", () => {
        reconhecendo = true;
        ouvir((respostaDestino) => {
          reconhecendo = false;
          mensagem.textContent = `Origem: ${respostaOrigem} | Destino: ${respostaDestino}`;
          buscarRota(respostaOrigem, respostaDestino);
        });
      });
    });
  });
}

function buscarRota(origem, destino) {
  fetch(`/rota?origem=${encodeURIComponent(origem)}&destino=${encodeURIComponent(destino)}`) // ← corrigido
    .then(res => res.json())
    .then(data => {
      if (data.passo_a_passo) {
        falar(`Aqui está sua rota de ${origem} até ${destino}.`); // ← corrigido
        data.passo_a_passo.forEach((passo, index) => {
          setTimeout(() => falar(passo), index * 5000);
        });
      } else {
        falar(data.erro || "Não foi possível encontrar essa rota.");
      }
    });
}

botao.addEventListener("click", iniciar);
