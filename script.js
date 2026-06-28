const users = [
    { name: 'Ana', age: 24, image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&h=600&fit=crop' },
    { name: 'Carlos', age: 27, image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&h=600&fit=crop' },
    { name: 'Julia', age: 22, image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&h=600&fit=crop' },
    { name: 'Marcos', age: 29, image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&h=600&fit=crop' },
    { name: 'Beatriz', age: 25, image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&h=600&fit=crop' }
];

const loginScreen = document.getElementById('login-screen');
const cardContainer = document.getElementById('card-container');
const appFooter = document.getElementById('app-footer');
const likeBtn = document.getElementById('like-btn');
const nopeBtn = document.getElementById('nope-btn');

const userNameInput = document.getElementById('user-name');
const userImageInput = document.getElementById('user-image');
const imagePreview = document.getElementById('image-preview');
const startBtn = document.getElementById('start-btn');

let currentCards = [];
let myProfile = { name: '', image: '' };

// Evento para preview da imagem quando o usuário escolhe um arquivo
userImageInput.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
        const imageUrl = URL.createObjectURL(file);
        imagePreview.style.backgroundImage = `url('${imageUrl}')`;
        imagePreview.style.display = 'block';
        myProfile.image = imageUrl;
    }
});

// Suporte à tecla "Enter" no formulário de login
userNameInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        startBtn.click();
    }
});

// Evento para criar o perfil e começar
startBtn.addEventListener('click', () => {
    const name = userNameInput.value.trim();
    if (!name) {
        alert("Por favor, digite seu nome!");
        return;
    }
    if (!myProfile.image) {
        alert("Por favor, escolha uma foto do seu dispositivo!");
        return;
    }

    myProfile.name = name;
    
    // Oculta tela de login e mostra a interface principal do Tinder
    loginScreen.style.display = 'none';
    cardContainer.style.display = 'block';
    appFooter.style.display = 'flex';
    
    // Inicia os cards depois do login
    initCards();
});

function initCards() {
    // Adiciona os cards ao DOM de trás para frente para que o primeiro fique por cima
    for (let i = users.length - 1; i >= 0; i--) {
        const user = users[i];
        const card = document.createElement('div');
        card.classList.add('tinder-card');
        card.style.backgroundImage = `url('${user.image}')`;
        card.style.zIndex = users.length - i; // Garantir a ordem
        
        card.innerHTML = `
            <div class="badge like-badge">LIKE</div>
            <div class="badge nope-badge">NOPE</div>
            <div class="card-info">
                <h3>${user.name} <span class="age">${user.age}</span></h3>
            </div>
        `;
        
        cardContainer.appendChild(card);
        currentCards.push(card);
    }
    
    // Inverte o array para que o topo seja o índice mais alto
    currentCards.reverse();
    setupTopCard();
}

let isDragging = false;
let startX = 0, startY = 0;
let currentX = 0, currentY = 0;

function setupTopCard() {
    if (currentCards.length === 0) {
        // Quando os cards acabam, mostramos o perfil do próprio usuário como feedback de fim da linha!
        cardContainer.innerHTML = `
            <div style="text-align:center; margin-top: 40%; padding: 20px;">
                <h3 style="color: #fe3c72; font-size: 2rem;">Acabou!</h3>
                <p style="color: #666; margin-top: 10px;">Mas ei, seu perfil ficou incrível, ${myProfile.name}!</p>
                <div style="width: 120px; height: 120px; border-radius: 50%; background-image: url('${myProfile.image}'); background-size: cover; background-position: center; margin: 20px auto; border: 4px solid #fe3c72; box-shadow: 0 4px 10px rgba(0,0,0,0.2);"></div>
            </div>`;
        return;
    }
    
    const topCard = currentCards[currentCards.length - 1];
    
    // Removemos transições durante o arraste
    topCard.style.transition = 'none';

    // Eventos de Mouse (Computador)
    topCard.addEventListener('mousedown', handleDragStart);
    // Eventos de Touch (Celular)
    topCard.addEventListener('touchstart', handleDragStart, { passive: true });
}

function handleDragStart(e) {
    if (currentCards.length === 0) return;
    isDragging = true;
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    
    startX = clientX;
    startY = clientY;
    
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchmove', handleDragMove, { passive: false }); 
    document.addEventListener('touchend', handleDragEnd);
}

function handleDragMove(e) {
    if (!isDragging) return;
    
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    
    currentX = clientX - startX;
    currentY = clientY - startY;
    
    const topCard = currentCards[currentCards.length - 1];
    
    // Calcula rotação
    const rotate = currentX * 0.1;
    topCard.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${rotate}deg)`;
    
    // Opacidade dos badges
    const likeBadge = topCard.querySelector('.like-badge');
    const nopeBadge = topCard.querySelector('.nope-badge');
    
    if (currentX > 0) {
        likeBadge.style.opacity = Math.min(currentX / 100, 1);
        nopeBadge.style.opacity = 0;
    } else {
        nopeBadge.style.opacity = Math.min(Math.abs(currentX) / 100, 1);
        likeBadge.style.opacity = 0;
    }
}

function handleDragEnd(e) {
    if (!isDragging) return;
    isDragging = false;
    
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
    document.removeEventListener('touchmove', handleDragMove);
    document.removeEventListener('touchend', handleDragEnd);
    
    const topCard = currentCards[currentCards.length - 1];
    topCard.style.transition = 'transform 0.3s ease-out';
    
    if (Math.abs(currentX) > 100) {
        const direction = currentX > 0 ? 1 : -1;
        swipeCard(direction);
    } else {
        // Retorna para o centro
        topCard.style.transform = 'translate(0px, 0px) rotate(0deg)';
        topCard.querySelector('.like-badge').style.opacity = 0;
        topCard.querySelector('.nope-badge').style.opacity = 0;
    }
    
    currentX = 0;
    currentY = 0;
}

function swipeCard(direction) {
    if (currentCards.length === 0) return;
    
    const topCard = currentCards.pop();
    const windowWidth = window.innerWidth;
    
    topCard.style.transition = 'transform 0.5s ease-out';
    topCard.style.transform = `translate(${direction * windowWidth}px, ${currentY}px) rotate(${direction * 45}deg)`;
    
    setTimeout(() => {
        topCard.remove();
        setupTopCard();
    }, 500);
}

// ---- Funcionalidades de Clique ----
likeBtn.addEventListener('click', () => {
    if (currentCards.length > 0) {
        const topCard = currentCards[currentCards.length - 1];
        topCard.querySelector('.like-badge').style.opacity = 1;
        swipeCard(1); 
    }
});

nopeBtn.addEventListener('click', () => {
    if (currentCards.length > 0) {
        const topCard = currentCards[currentCards.length - 1];
        topCard.querySelector('.nope-badge').style.opacity = 1;
        swipeCard(-1); 
    }
});

// ---- NOVA FUNCIONALIDADE: Controle via Teclado ----
document.addEventListener('keydown', (e) => {
    // Só permite usar as setas se a tela de login já foi ocultada
    if (loginScreen.style.display === 'none' && currentCards.length > 0) {
        if (e.key === 'ArrowRight') {
            // Seta para direita = Like
            likeBtn.click();
            // Efeito visual rápido de apertar o botão
            likeBtn.style.transform = 'scale(0.85)';
            setTimeout(() => likeBtn.style.transform = 'scale(1)', 150);
        } else if (e.key === 'ArrowLeft') {
            // Seta para esquerda = Nope
            nopeBtn.click();
            // Efeito visual rápido de apertar o botão
            nopeBtn.style.transform = 'scale(0.85)';
            setTimeout(() => nopeBtn.style.transform = 'scale(1)', 150);
        }
    }
});
