// Funções relacionadas ao gerenciamento de dietas

function carregarDietasDoLocalStorage() {
    const dietasJSON = localStorage.getItem('animalFeederDietas');
    return dietasJSON ? JSON.parse(dietasJSON) : [];
}

function salvarDietasNoLocalStorage(dietas) {
    localStorage.setItem('animalFeederDietas', JSON.stringify(dietas));
}

function exibirDietas(dietas, dietasContainer, noDietasMessage) {
    dietasContainer.innerHTML = '';
    if (dietas.length === 0) {
        noDietasMessage.classList.remove('hidden');
        return;
    }
    noDietasMessage.classList.add('hidden');
    dietas.forEach((dieta, index) => {
        const div = document.createElement('div');
        div.className = 'flex justify-between items-center p-3 bg-bg-main rounded-md shadow';
        div.innerHTML = `
            <span class="text-text-gray">${dieta.nomeDieta}</span>
            <div class="space-x-2">
                <button data-index="${index}" class="btn-editar-dieta text-sm bg-blue-600 hover:bg-blue-500 text-white py-1 px-3 rounded-md transition-colors">Editar</button>
                <button data-index="${index}" class="btn-excluir-dieta text-sm bg-red-600 hover:bg-red-500 text-white py-1 px-3 rounded-md transition-colors">Excluir</button>
            </div>
        `;
        dietasContainer.appendChild(div);
    });
}

// Outras funções de dietas podem ser adicionadas aqui
