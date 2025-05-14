// Funções relacionadas ao gerenciamento de lotes

function carregarLotesDoLocalStorage() {
    const lotesJSON = localStorage.getItem('animalFeederLotes');
    return lotesJSON ? JSON.parse(lotesJSON) : [];
}

function salvarLotesNoLocalStorage(lotes) {
    localStorage.setItem('animalFeederLotes', JSON.stringify(lotes));
}

function exibirLotes(lotes, lotesContainer, noLotesMessage) {
    lotesContainer.innerHTML = '';
    if (lotes.length === 0) {
        noLotesMessage.classList.remove('hidden');
        return;
    }
    noLotesMessage.classList.add('hidden');
    lotes.forEach((numCabecas, index) => {
        const div = document.createElement('div');
        div.className = 'flex justify-between items-center p-2.5 bg-bg-main rounded-md shadow';
        div.innerHTML = `
            <span class="text-text-gray">Lote ${index + 1}: ${numCabecas} cabeças</span>
            <button data-index="${index}" class="btn-excluir-lote text-sm bg-red-600 hover:bg-red-500 text-white py-1 px-3 rounded-md transition-colors">Excluir</button>
        `;
        lotesContainer.appendChild(div);
    });
}

// Outras funções de lotes podem ser adicionadas aqui
