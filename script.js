// Pegar elementos da DOM que precisam ser iniciados agora

const mainWrapper = document.querySelector(".main-wrapper");

// Função para criar uma animação de fade-out e fade-in no elemento

const FadeAnimation = (elem) => {
  elem.classList.add("f-o-i");
  setTimeout(() => {
    elem.classList.remove("f-o-i");
  }, 750);
};

// Criação das variáveis que serão cruciais para a manipulação de dados e navegação

let listaAtual = [];
let filmeCards;

// Pega a informação da lista favorita que está no cachê do navegador, é usado JSON.parse() para transformar strings em objetos usáveis no javascript porque o localStorage só aceita strings.

let listaFavorita = JSON.parse(localStorage.getItem("listaFavorita"));

// Se não houver nenhuma lista salva, cria um array vazio;

if (listaFavorita == null) {
  listaFavorita = [];
}

// Função que faz a requisição na GhibliAPI, manda a resposta para a função AlimentarLista() e então tira a classe de opacidade 0 do .main-wrapper

const FetchCapa = () => {
  fetch("https://ghibliapiforked.onrender.com/films")
    .then((lista) => lista.json())
    .then((lista) => AlimentarLista(lista));
  mainWrapper.classList.remove("opacity-0");
};

// Função que pega toda a resposta da requisição do FetchCapa e armazena na variável listaAtual, então chama a função MostrarCapas

const AlimentarLista = (lista) => {
  listaAtual = lista;
  MostrarCapas(listaAtual);
};

// Função que adiciona uma div com a classe .grade na div mainWrapper para receber os cards de acordo com a aba que foi clicada (All ou Favorited)

const MostrarCapas = (lista) => {
  let listaInterna;

  mainWrapper.insertAdjacentHTML("afterbegin", '<div class="grade"></div>');

  let grade = document.querySelector(".grade");

  // Função que monta os cards de acordo com um objeto de filme passado como parâmetro dentro da div com a classe .grade

  const MontarCards = (filme) => {
    let templateCard = `
      <div class="filme-card" filme-id="${filme.id}">
        <p class="titulo">${filme.title}</p>
        <img src="${filme.image}" alt="${filme.title}'s cover image." class="capa">
      </div>
      `;
    grade.insertAdjacentHTML("afterbegin", templateCard);
  };

  // Verifica se a lista que foi passada como parâmetro é a lista com todos os filmes ou a lista com apenas os favoritados e armazena a lista na variável listaInterna

  if (lista == listaAtual) {
    listaInterna = lista;

    // Se for a lista com todos os filmes, percorre pelos objetos dos filmes que estão nessa lista e chama a função que monta o card do filme para cada objeto encontrado

    for (let filme of listaInterna) {
      MontarCards(filme);
    }
  } else if (lista == listaFavorita) {
    listaInterna = lista;

    // Se for a lista com apenas os filmes favoritados, percorre todos os objetos dessa lista e chama a função que monta o card do filme, porém, procura na lista com todos os filmes o filme que tem o mesmo id que o filme favoritado e, então, manda o objeto do filme como parâmetro

    listaInterna.forEach((filme) => {
      MontarCards(listaAtual.find((e) => e.id == filme.id));
    });
  }

  // Armazena todos os cards renderizados em uma variável para depois criar uma função que manda o id do filme daquele card para a função que vai criar a página daquele filme que o usuário clicou, também usa a função de animação que foi criada no inicio para ter um efeito bacana

  filmeCards = document.querySelectorAll(".filme-card");

  filmeCards.forEach((card) => {
    card.addEventListener("click", () => {
      let id = card.getAttribute("filme-id");
      CriarAbout(id);
      FadeAnimation(mainWrapper);
    });
  });
};

// Chama os dois spans ("All" e "Favorited") que vão ser utilizados como barra de navegação para o javascript

const spanAll = document.querySelector("span.all");
const spanFavorite = document.querySelector("span.favorite");

// Funções que limpam o html do mainWrapper, estiliza os dois spans para apenas o clicado ser sublinhado e chama a função MostrarCapas com a lista desejada como parâmetro

const ListarAtual = () => {
  mainWrapper.innerHTML = "";
  spanAll.classList.add("selected");
  spanFavorite.classList.remove("selected");
  MostrarCapas(listaAtual);
};

const ListarFavoritos = () => {
  mainWrapper.innerHTML = "";
  spanFavorite.classList.add("selected");
  spanAll.classList.remove("selected");
  MostrarCapas(listaFavorita);
};

// Funções anônimas que só chamam as funções anteriores se o span clicado não tiver a classe .selected (para evitar as funções serem chamadas multiplas vezes caso usuário clique em uma aba que já está ativa)

spanAll.onclick = () => {
  if (!spanAll.classList.contains("selected")) {
    ListarAtual();
  }
};

spanFavorite.onclick = () => {
  if (!spanFavorite.classList.contains("selected")) {
    ListarFavoritos();
  }
};

// Função que cria a página do filme selecionado anteriormente pelo usuário, ela primeiro procura o filme no array listaAtual utilizando o id fornecido na chamada da função e guarda aquele objeto do filme dentro da variável filmeAtual

const CriarAbout = (id) => {
  mainWrapper.innerHTML = "";
  let filmeAtual = listaAtual.find((filme) => filme.id == id);

  // Cria o template do html dinâmico que será alimentado com os dados do filme selecionado com todas as informações e uma imagem que será usada como botão para voltar aos cards de todos os filmes

  let templateFilmeAtual = `
  <div class="filme-about">
    <span class="voltar"><img src="https://cdn-icons-png.flaticon.com/512/507/507257.png" width="25px"></span>
    <div class="info">
      <h2>${filmeAtual.title}</h2>
      <hr>
      <p class="titulo">${filmeAtual.original_title_romanised} - ${filmeAtual.original_title}</p>
      <p>${filmeAtual.description}</p>
      <img src="${filmeAtual.movie_banner}">
    </div>
    <div class="capa">
      <img src="${filmeAtual.image}" alt="${filmeAtual.title}'s cover image."> <br>
      <img src="https://cdn-icons-png.flaticon.com/512/2589/2589175.png" class="heart" width="50px"><br>
      <hr>
      <p>Director: ${filmeAtual.director}</p>
      <p>Producers: ${filmeAtual.producer}</p>
      <p>Release year: ${filmeAtual.release_date}</p>
      <p>Duration: ${filmeAtual.running_time} minutes</p>
    </div>
  </div>
  `;

  // Adiciona o template no html dentro da div com a classe "main-wrapper"

  mainWrapper.insertAdjacentHTML("afterbegin", templateFilmeAtual);

  // Criação da variável que traz a imagem com a classe "voltar" para o js

  let voltar = document.querySelector(".voltar");

  // Cria uma função anônima que sempre é ativada quando o usuário clica na imagem da setinha para voltar, essa função apaga todo o código dentro do .main-wrapper, checa se o usuário está na aba "All" ou "Favorited" e chama a função de renderizar os cards dos filmes baseado na aba que o usuário está, e por fim, também chama a função de animação de fade

  voltar.onclick = () => {
    if (spanFavorite.classList.contains("selected")) {
      ListarFavoritos();
    } else if (spanAll.classList.contains("selected")) {
      ListarAtual();
    }
    FadeAnimation(mainWrapper);
  };

  // Guarda a imagem com o coração de favoritar numa variável

  let heart = document.querySelector(".heart");

  // Verifica se o id do filme selecionado está no array de objetos contendo o id dos filmes favoritos

  if (listaFavorita.some((e) => e.id == filmeAtual.id)) {
    // Se o filme estiver na lista de favoritos ele adiciona a classe .favorite para a imagem ficar estilizada

    heart.classList.add("favorite");

    // Se o filme estiver na lista de favoritos e o usuário clicar na imagem do coração, ele vai retirar a classe de estilização, retirar o filme atual do array de objetos contendo o id dos filmes favoritos e atualizar a lista de filmes favoritos guardada no localStorage, porém usando JSON.stringfy para transformar a listaFavorita em string, pois o localStorage só armazena strings dentro de variáveis

    heart.onclick = () => {
      heart.classList.remove("favorite");
      listaFavorita.splice(
        listaFavorita.indexOf(
          listaFavorita.find((e) => e.id === filmeAtual.id)
        ),
        1
      );
      localStorage.setItem("listaFavorita", JSON.stringify(listaFavorita));
    };
  } else {
    // Se o filme NÃO estiver na lista de favoritos e o usuário clicar na imagem do coração, ele vai adicionar a classe de estilização, adicionar um objeto contendo o id do filme atual na lista de filmes favoritos e atualizar a lista de filmes favoritos guardada no localStorage do mesmo jeito que a função acima
    heart.onclick = () => {
      heart.classList.add("favorite");
      listaFavorita.push({ id: filmeAtual.id });
      localStorage.setItem("listaFavorita", JSON.stringify(listaFavorita));
    };
  }
};

// Primeira e única chamada da função que faz a requisição à API

FetchCapa();
