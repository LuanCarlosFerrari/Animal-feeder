// Funções utilitárias para manipulação de UI

function setActiveScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.toggle('active-screen', screen.id === screenId);
        screen.classList.toggle('hidden', screen.id !== screenId);
    });
}

// Outras funções de UI podem ser adicionadas aqui
