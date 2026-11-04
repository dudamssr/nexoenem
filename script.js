
document.addEventListener("DOMContentLoaded", () => {

    const API = "https://api.enem.dev/v1/exams";
    const conteudoQuestao = document.getElementById("questaoConteudo");
    const anoQuestao = document.getElementById("questaoAno");
    const feedback = document.getElementById("questaoFeedback");
    const btnResponder = document.getElementById("btnResponder");
    const btnNovaQuestao = document.getElementById("btnNovaQuestao");

    let questaoAtual = null;
    let alternativaSelecionada = null;
    let respondida = false;

    async function carregarQuestao() {

        conteudoQuestao.innerHTML = `
            <div class="carregando">
                <i class="fa-solid fa-spinner fa-spin"></i>
                <span>Buscando questão...</span>
            </div>
        `;

        feedback.textContent = "";
        feedback.className = "questao-feedback";
        btnResponder.disabled = true;

        questaoAtual = null;
        alternativaSelecionada = null;
        respondida = false;

        try {

            const ano = Math.floor(Math.random() * 15) + 2009;

            const resposta = await fetch(
                `${API}/${ano}/questions?limit=20`
            );

            if (!resposta.ok) {
                throw new Error("Não foi possível consultar a API.");
            }

            const dados = await resposta.json();

            if (!dados.questions || dados.questions.length === 0) {
                throw new Error("Nenhuma questão encontrada.");
            }

            questaoAtual = dados.questions[
                Math.floor(Math.random() * dados.questions.length)
            ];

            anoQuestao.textContent = `ENEM ${ano}`;

            exibirQuestao();

        } catch (erro) {

            console.error("Erro ao carregar questão:", erro);

            conteudoQuestao.innerHTML = `
                <div class="carregando">
                    <i class="fa-solid fa-circle-exclamation"></i>
                    <span>Não foi possível carregar a questão. Tente novamente.</span>
                </div>
            `;

            anoQuestao.textContent = "Indisponível";
        }
    }

    function exibirQuestao() {

        conteudoQuestao.innerHTML = "";

        const enunciado = document.createElement("div");
        enunciado.className = "questao-enunciado";
        enunciado.textContent = questaoAtual.title || "Questão do ENEM";

        conteudoQuestao.appendChild(enunciado);

        if (questaoAtual.context) {

            const contexto = document.createElement("div");
            contexto.className = "questao-contexto";
            contexto.textContent = questaoAtual.context;

            conteudoQuestao.appendChild(contexto);
        }

        if (questaoAtual.files && questaoAtual.files.length > 0) {

            questaoAtual.files.forEach(arquivo => {

                const imagem = document.createElement("img");

                imagem.src = arquivo;
                imagem.alt = "Imagem da questão";
                imagem.className = "questao-imagem";
                imagem.loading = "lazy";

                conteudoQuestao.appendChild(imagem);
            });
        }

        const alternativas = document.createElement("div");
        alternativas.className = "alternativas";

        questaoAtual.alternatives.forEach(alternativa => {

            const botao = document.createElement("button");

            botao.type = "button";
            botao.className = "alternativa";

            const letra = document.createElement("b");
            letra.textContent = alternativa.letter;

            const texto = document.createElement("span");
            texto.textContent = alternativa.text;

            botao.appendChild(letra);
            botao.appendChild(texto);

            botao.addEventListener("click", () => {

                if (respondida) return;

                document.querySelectorAll(".alternativa").forEach(item => {
                    item.classList.remove("selecionada");
                });

                botao.classList.add("selecionada");

                alternativaSelecionada = alternativa.letter;
                btnResponder.disabled = false;
            });

            alternativas.appendChild(botao);
        });

        conteudoQuestao.appendChild(alternativas);
    }

    function conferirResposta() {

        if (!questaoAtual || !alternativaSelecionada || respondida) {
            return;
        }

        respondida = true;

        const correta = questaoAtual.correctAlternative;

        document.querySelectorAll(".alternativa").forEach(botao => {

            const letra = botao.querySelector("b").textContent;

            if (letra === correta) {
                botao.classList.add("correta");
            }

            if (letra === alternativaSelecionada && letra !== correta) {
                botao.classList.add("incorreta");
            }
        });

        if (alternativaSelecionada === correta) {

            feedback.textContent = "Muito bem! Você acertou a questão!";
            feedback.classList.add("certo");

        } else {

            feedback.textContent = `Não foi dessa vez! A alternativa correta é ${correta}.`;
            feedback.classList.add("errado");
        }

        btnResponder.disabled = true;
    }

    btnResponder.addEventListener("click", conferirResposta);

    btnNovaQuestao.addEventListener("click", carregarQuestao);

    carregarQuestao();

});
