let config = localStorage.getItem("config");
config = JSON.parse(config);

function novoElemento(tagName, className) {
    const elemento = document.createElement(tagName)
    elemento.className = className
    return elemento
}

function Barreira(reversa = false) {
    this.elemento = novoElemento('div', 'barreira')
    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')
    this.elemento.appendChild(reversa ? corpo : borda)
    this.elemento.appendChild(reversa ? borda : corpo)

    this.setAltura = altura => corpo.style.height = `${altura}px`

}

/* const b= new Barreira(false)
b.setAltura(500)
document.querySelector('[wm-flappy]').appendChild(b.elemento) */



function ParDeBarreiras(altura, abertura, popsicaoNaTela) {
    this.elemento = novoElemento('div', 'par-de-barreiras')
    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)

    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)


    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior;

        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = popsicaoNaTela => this.elemento.style.left = `${popsicaoNaTela}px`
    this.getLargura = () => this.elemento.clientWidth

    this.sortearAbertura()
    this.setX(popsicaoNaTela)
}

//  const b= new ParDeBarreiras(500,300,1000)
// document.querySelector('[wm-flappy]').appendChild(b.elemento)  

function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3),
    ]

    const deslocamento = parseInt(config.vel_jogo);

    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            if (par.getX() < -par.getLargura()) {
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura()
            }
            const meio = largura / 2
            const cruzouMeio = par.getX() + deslocamento >= meio
                && par.getX() < meio
            if (cruzouMeio) {
                notificarPonto()
            }
        })
    }
}

/* const barreiras = new Barreiras(700, 400, 200, 400)
const areaDoJogo = document.querySelector('[wm-flappy]')

barreiras.pares.forEach( par => areaDoJogo.appendChild(par.elemento)) 

setInterval(() => {
    barreiras.animar()
},20)  */


function Passaro(alturaJogo) {
    let voando = false

    this.elemento = novoElemento('img', 'passaro')
    if(config.tipo_jogo == "treino"){
        this.elemento.src = "/img/passarudo.gif"
    }else {
        this.elemento.src = `img/${config.personagem}.png`
    }
    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`

    window.onkeydown = e => voando = true
    window.onkeyup = e => voando = false

    this.animar = () => {
        let novoY;
        switch (config.vel_personagem) {
            case "baixa":
                novoY = this.getY() + (voando ? 4 : -2)
                break;
            case "media":
                novoY = this.getY() + (voando ? 8 : -5)
                break;
            case "rapida":
                novoY = this.getY() + (voando ? 16 : -10)
                break;
            default:
                break;
        }
        const alturaMaxima = alturaJogo - this.elemento.clientHeight

        if (novoY <= 0) {
            this.setY(0)
        } else if (novoY >= alturaMaxima) {
            this.setY(alturaMaxima)
        } else {
            this.setY(novoY)
        }
    }
    this.setY(alturaJogo / 2)
}

/* const barreiras = new Barreiras(700, 400, 200, 400)
const passaro = new Passaro(700)

const areaDoJogo = document.querySelector('[wm-flappy]')

areaDoJogo.appendChild(passaro.elemento)
barreiras.pares.forEach( par => areaDoJogo.appendChild(par.elemento)) 

setInterval(() => {
      barreiras.animar()
      passaro.animar() 
},20) */


function Progresso() {

    this.elemento = novoElemento('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0)
}

/*  const barreiras = new Barreiras(700, 400, 200, 400)
const passaro = new Passaro(700)

const areaDoJogo = document.querySelector('[wm-flappy]')

areaDoJogo.appendChild(passaro.elemento)
barreiras.pares.forEach( par => areaDoJogo.appendChild(par.elemento))  */


function estaoSobrepostos(elementoA, elementoB) {

    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()
    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top

    return horizontal && vertical
}

function colidiu(element, funcao) {
    let colidiu = false;
    funcao.pares.forEach(parDefuncao => {
        if (!colidiu) {
            const superior = parDefuncao.superior.elemento
            const inferior = parDefuncao.inferior.elemento
            colidiu = estaoSobrepostos(element.elemento, superior)
                || estaoSobrepostos(element.elemento, inferior)
        }
    })
    
    return colidiu

}

function FlappyBird() {
    let pontos = 0;
    let personagemOriginal = config.personagem;

    const areaDoJogo = document.querySelector('[wm-flappy]')
    if (config.cenario == "noite") {
        areaDoJogo.style.backgroundImage = "url(/img/bg-noite.png)";
    }
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth

    // const pause = new Pause();
    const bonus = new Bonus(altura, largura);
    
    const progresso = new Progresso();
    const barreiras = new Barreiras(altura, largura, parseInt(config.abertura), parseInt(config.distancia),
        () => {
            switch (config.pontuacao) {
                case '1':
                    progresso.atualizarPontos(++pontos);
                    break;
                case '10':
                    progresso.atualizarPontos(++pontos*10);
                    break;
                case '100':
                    progresso.atualizarPontos(++pontos*100);
                    break;
                default:
                    break;
            }
        });
    const passaro = new Passaro(altura)

    // areaDoJogo.appendChild(pause.elemento)
    areaDoJogo.appendChild(bonus.elemento)
    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

    this.start = () => {
        let contadora = 0;
        const temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar()
            bonus.animar()
            if(colidiu(bonus, barreiras)){
                bonus.elemento.style.display = "none";
                bonus.trocar();
            }

            if(estaoSobrepostos(passaro.elemento, bonus.elemento)) {
                bonus.elemento.style.display = "none";
                bonus.trocar();
                if(bonus.elemento.name !== "coin"){
                    passaro.elemento.src = "/img/passarudo.gif";
                    config.tipo_jogo = "treino";
                    setTimeout(() => {
                        passaro.elemento.src = `/img/${personagemOriginal}.png`;
                        config.tipo_jogo = "real";
                    }, 5000);
                }else {
                    pontos = pontos + 10;
                    passaro.elemento.src = `/img/${personagemOriginal}.png`;
                    config.tipo_jogo = "real";
                }

            }
            if(bonus.getX() < 0 || contadora > 500){
                bonus.elemento.style.display = "block"
                contadora = 0;
                bonus.trocar();
            }

            if (config.tipo_jogo == "real") {

                if (colidiu(passaro, barreiras)) {
                    clearInterval(temporizador);
                    GameOver(pontos);
                }
            }
            contadora++;
        }, 20)
    }
}

function Bonus(alturaJogo, laguraJogo){
    let sorte = parseInt(Math.random()*10);
    this.elemento = novoElemento('img', 'bonus');

        if(sorte > 3){
            this.elemento.src = "/img/coin.png";
            this.elemento.name = "coin";
        }else {
            this.elemento.src = "/img/minhoca.png";
            this.elemento.name = "minhoca";
        }

    const alturaMaxima = alturaJogo;
    const larguraMaxima = laguraJogo;

    const deslocamento = parseInt(config.vel_jogo);
  
    let altura = Math.random()*alturaMaxima;
    let largura = Math.random()*(larguraMaxima-larguraMaxima/2)+larguraMaxima/2;
    
    this.getX = () => parseInt(this.elemento.style.left.split('px'))
    this.setX = posicaoNaTela => this.elemento.style.left = `${posicaoNaTela}px`
    
    this.animar = () => {
        this.elemento.style.top = `${altura}px`;
        this.setX(this.getX()-deslocamento);
        if(this.getX() <= 0) {
            altura = Math.random()*alturaMaxima;
            this.setX(largura);
        }
    }
    this.setX(largura);

    this.trocar = () => {
        sorte = parseInt(Math.random()*10);
        if(sorte > 3){
            this.elemento.src = "/img/coin.png";
            this.elemento.name = "coin";
        }else {
            this.elemento.src = "/img/minhoca.png";
            this.elemento.name = "minhoca";
        } 
    }
}

function GameOver(pontos) {
    let tela = document.getElementById("gameOver");
    tela.style.display = "block";
    let recarregar = document.getElementById("recarregar");
    recarregar.addEventListener("click", () => {
        window.location.reload();
    });

    let novoJogo = document.getElementById("novoJogo");
    novoJogo.addEventListener("click", () => {
        location.href = "form.html";
    });
}

let time = 3;
let start = setInterval(() => {
    let get = document.getElementById("getReady");
    if (time == 0) {
        get.style.display = "none";
        new FlappyBird().start();
        clearInterval(start);
        return;
    }
    time--;
    let tempo = document.getElementById("tempo");
    if (time != 0) {
        tempo.innerHTML = time;
    } else {
        tempo.innerHTML = "Go!";
    }

}, 1000);
