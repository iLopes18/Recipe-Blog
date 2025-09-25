// Configurações Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAHuoWoB3C11n-tDTBeBbBukDjrD0-Rpn0",
  authDomain: "recipe-blog-a2fae.firebaseapp.com",
  projectId: "recipe-blog-a2fae",
  storageBucket: "recipe-blog-a2fae.appspot.com",
  messagingSenderId: "92424634969",
  appId: "1:92424634969:web:a0994e3c4761eae2f7a748"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// -------------------- Login/Logout --------------------
function login() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById('login-div').style.display = 'none';
      document.getElementById('adicionar-div').style.display = 'block';
    })
    .catch(err => alert(err.message));
}

function logout() {
  auth.signOut().then(() => {
    document.getElementById('adicionar-div').style.display = 'none';
    document.getElementById('login-div').style.display = 'block';
  });
}

// -------------------- Adicionar Receitas --------------------
function adicionarReceita() {
  const nome = document.getElementById('nome-receita').value;
  const porcao = document.getElementById('porcao-receita').value;
  const categoria = document.getElementById('categoria-receita').value;
  const ingredientes = document.getElementById('ingredientes-receita').value;
  const instrucoes = document.getElementById('instrucoes-receita').value;
  const tempoPreparo = document.getElementById('tempo-preparo').value;
  const tempoCozedura = document.getElementById('tempo-cozedura').value;

  if (!nome || !porcao || !ingredientes || !instrucoes) {
    alert('Preenche todos os campos obrigatórios!');
    return;
  }

  db.collection('receitas').add({ nome, porcao, categoria, ingredientes, instrucoes, tempoPreparo, tempoCozedura })
    .then(() => {
      alert('Receita adicionada!');
      document.getElementById('nome-receita').value = '';
      document.getElementById('porcao-receita').value = '';
      document.getElementById('ingredientes-receita').value = '';
      document.getElementById('instrucoes-receita').value = '';
      document.getElementById('tempo-preparo').value = '';
      document.getElementById('tempo-cozedura').value = '';
      carregarReceitas();
    })
    .catch(err => alert(err.message));
}

// -------------------- Múltiplas Receitas --------------------
let receitasValidadas = [];
function validarReceitas() {
  const input = document.getElementById('receitas-multiples').value;
  try {
    const arr = JSON.parse(input);
    if (!Array.isArray(arr)) throw new Error('Deve ser um array');
    receitasValidadas = arr.filter(r => r.nome && r.porcao && r.categoria && r.ingredientes && r.instrucoes);
    document.getElementById('validacao-result').textContent = `Receitas válidas: ${receitasValidadas.length}`;
    document.getElementById('enviar-todas').style.display = receitasValidadas.length > 0 ? 'block' : 'none';
  } catch(e) {
    alert('JSON inválido: ' + e.message);
  }
}

function enviarReceitasValidas() {
  const promises = receitasValidadas.map(r => db.collection('receitas').add(r));
  Promise.all(promises).then(() => {
    alert('Todas as receitas válidas foram enviadas!');
    receitasValidadas = [];
    document.getElementById('receitas-multiples').value = '';
    document.getElementById('validacao-result').textContent = '';
    document.getElementById('enviar-todas').style.display = 'none';
    carregarReceitas();
  });
}

// -------------------- Carregar Receitas --------------------
function carregarReceitas() {
  db.collection('receitas').get().then(snapshot => {
    const lista = document.getElementById('lista-receitas');
    lista.innerHTML = '';
    snapshot.forEach(doc => {
      const r = doc.data();
      const li = document.createElement('li');
      li.setAttribute('data-categoria', r.categoria);
      li.innerHTML = `<strong>${r.nome}</strong><br>
                      Porção: ${r.porcao}<br>
                      Ingredientes:<br>${r.ingredientes.replace(/\n/g,'<br>')}<br>
                      Instruções: ${r.instrucoes}<br>
                      Tempo preparo: ${r.tempoPreparo} min | Tempo cozedura: ${r.tempoCozedura} min`;

      // Clique para abrir modal
      li.addEventListener('click', () => abrirModal(r));

      lista.appendChild(li);
    });
  });
}

// -------------------- Receita Aleatória --------------------
function escolherAleatoria() {
  const checkboxes = document.querySelectorAll('#aleatorio input[type="checkbox"]:checked');
  const categoriasSelecionadas = Array.from(checkboxes).map(cb => cb.value);
  if (categoriasSelecionadas.length === 0) {
    alert('Seleciona pelo menos uma categoria!');
    return;
  }

  db.collection('receitas').get().then(snapshot => {
    const filtradas = [];
    snapshot.forEach(doc => {
      const r = doc.data();
      if (categoriasSelecionadas.includes(r.categoria)) filtradas.push(r);
    });

    if (filtradas.length === 0) {
      alert('Nenhuma receita nessa categoria!');
      return;
    }

    const aleatoria = filtradas[Math.floor(Math.random() * filtradas.length)];
    document.getElementById('receita-aleatoria').innerHTML = `<strong>${aleatoria.nome}</strong><br>
      Porção: ${aleatoria.porcao}<br>
      Ingredientes:<br>${aleatoria.ingredientes.replace(/\n/g,'<br>')}<br>
      Instruções: ${aleatoria.instrucoes}`;
  });
}

// -------------------- Modal --------------------
function abrirModal(receita) {
  const modal = document.getElementById('modal-receita');
  const conteudo = document.getElementById('modal-conteudo');
  conteudo.innerHTML = `<h2>${receita.nome}</h2>
    <p><strong>Categoria:</strong> ${receita.categoria}</p>
    <p><strong>Porção:</strong> ${receita.porcao}</p>
    <p><strong>Ingredientes:</strong><br>${receita.ingredientes.replace(/\n/g,'<br>')}</p>
    <p><strong>Instruções:</strong><br>${receita.instrucoes}</p>
    <p><strong>Tempo preparo:</strong> ${receita.tempoPreparo} min | <strong>Tempo cozedura:</strong> ${receita.tempoCozedura} min</p>`;
  modal.style.display = 'flex';
}

function fecharModal() {
  document.getElementById('modal-receita').style.display = 'none';
}

document.getElementById('modal-receita').addEventListener('click', (e) => {
  if (e.target.id === 'modal-receita') fecharModal();
});

// -------------------- Navegação --------------------
function showSection(sectionId) {
  ['login','receitas','aleatorio'].forEach(id => document.getElementById(id).classList.add('hidden'));
  document.getElementById(sectionId).classList.remove('hidden');
}

window.onload = () => {
  showSection('receitas');
  carregarReceitas();
};
