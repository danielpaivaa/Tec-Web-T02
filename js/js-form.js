let dadosConfig = document.getElementById("logo-btn");

dadosConfig.addEventListener("click", () => {
    let nome_jogador = document.getElementById("nome-jogador").value;
    let cenario = document.querySelector('input[name="cenario"]:checked').value;
    let abertura = document.querySelector('input[name="aberturaCanos"]:checked').value;
    let distancia = document.querySelector('input[name="distanciaCanos"]:checked').value;
    let vel_jogo  = document.querySelector('input[name="velJogo"]:checked').value;
    let personagem = document.getElementById("personagem-jogo").value;
    let tipo_jogo = document.querySelector('input[name="tipoJogo"]:checked').value;
    let vel_personagem = document.querySelector('input[name="velPersonagem"]:checked').value;
    let pontuacao = document.querySelector('input[name="pontuacaoJogo"]:checked').value;

    let config = {
        nome_jogador,
        cenario,
        abertura,
        distancia,
        vel_jogo,
        personagem,
        tipo_jogo,
        vel_personagem,
        pontuacao,
    }

    config = JSON.stringify(config);
    localStorage.setItem("config", config);
    location.href = "index.html";
});