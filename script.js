const users = [
    { name: 'Ana', age: 24, image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&h=600&fit=crop' },
    { name: 'Carlos', age: 27, image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&h=600&fit=crop' },
    { name: 'Julia', age: 22, image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&h=600&fit=crop' },
    { name: 'Marcos', age: 29, image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&h=600&fit=crop' },
    { name: 'Beatriz', age: 25, image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&h=600&fit=crop' }
];

const cardContainer = document.getElementById('card-container');
const likeBtn = document.getElementById('like-btn');
const nopeBtn = document.getElementById('nope-btn');

let currentCards = [];

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
        cardContainer.innerHTML = '<h3 style="text-align:center; margin-top: 50%; color: #999;">Fim da linha! Volte mais tarde.</h3>';
        return;
    }
    
    const topCard = currentCards[currentCards.length - 1];
    
    // Removemos transições durante o arraste
    topCard.style.transition = 'none';

    // Eventos de Mouse
    topCard.addEventListener('mousedown', handleDragStart);
    // Eventos de Touch
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
    document.addEventListener('touchmove', handleDragMove, { passive: false }); // não passivo para permitir interrupção
    document.addEventListener('touchend', handleDragEnd);
}

function handleDragMove(e) {
    if (!isDragging) return;
    
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    
    currentX = clientX - startX;
    currentY = clientY - startY;
    
    const topCard = currentCards[currentCards.length - 1];
    
    // Calcula rotação com base na posição X
    const rotate = currentX * 0.1;
    
    topCard.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${rotate}deg)`;
    
    // Opacidade dos badges de feedback
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
    
    // Limiar para considerar um swipe válido (100px)
    if (Math.abs(currentX) > 100) {
        const direction = currentX > 0 ? 1 : -1;
        swipeCard(direction);
    } else {
        // Volta para o centro se não puxou o suficiente
        topCard.style.transform = 'translate(0px, 0px) rotate(0deg)';
        topCard.querySelector('.like-badge').style.opacity = 0;
        topCard.querySelector('.nope-badge').style.opacity = 0;
    }
    
    // Reseta variáveis de posição
    currentX = 0;
    currentY = 0;
}

function swipeCard(direction) {
    if (currentCards.length === 0) return;
    
    const topCard = currentCards.pop();
    
    // Anima o card saindo da tela
    const windowWidth = window.innerWidth;
    topCard.style.transition = 'transform 0.5s ease-out';
    topCard.style.transform = `translate(${direction * windowWidth}px, ${currentY}px) rotate(${direction * 45}deg)`;
    
    // Remove o card do DOM após a animação
    setTimeout(() => {
        topCard.remove();
        setupTopCard();
    }, 500);
}

// Eventos para os botões inferiores (X e Coração)
likeBtn.addEventListener('click', () => {
    if (currentCards.length > 0) {
        const topCard = currentCards[currentCards.length - 1];
        topCard.querySelector('.like-badge').style.opacity = 1;
        swipeCard(1); // Swipe pra direita
    }
});

nopeBtn.addEventListener('click', () => {
    if (currentCards.length > 0) {
        const topCard = currentCards[currentCards.length - 1];
        topCard.querySelector('.nope-badge').style.opacity = 1;
        swipeCard(-1); // Swipe pra esquerda
    }
});

// Inicializa a renderização
initCards();
