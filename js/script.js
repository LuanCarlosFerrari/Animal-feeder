document.addEventListener('DOMContentLoaded', () => {
    // Estado da aplicação
    let dietas = [];
    let lotes = [];
    let resultadosCalculo = null; // Armazena os últimos resultados para exportação

    // Elementos da UI
    const screens = document.querySelectorAll('.screen');
    const navButtons = document.querySelectorAll('.nav-button, .nav-button-back, .nav-button-inline');
    const logoImg = document.getElementById('logo');

    // --- Tela Inicial ---
    if (logoImg) { // Verificar se o logo existe
        const logoUrl = 'assets/logo.png'; // Caminho para o seu logo
        // Tenta carregar o logo. Se falhar, mantém o placeholder.
        const tempImg = new Image();
        tempImg.onload = () => { logoImg.src = logoUrl; };
        tempImg.onerror = () => { console.warn('Logo não encontrado em assets/logo.png. Usando placeholder.'); };
        tempImg.src = logoUrl;
    }

    // --- Navegação ---
    function setActiveScreen(screenId) {
        screens.forEach(screen => {
            screen.classList.toggle('active-screen', screen.id === screenId);
            screen.classList.toggle('hidden', screen.id !== screenId);
        });
        // Carregar dados relevantes ao entrar na tela
        if (screenId === 'telaDietas') carregarEExibirDietas();
        if (screenId === 'telaLotes') carregarEExibirLotes();
        if (screenId === 'telaCalcular') preencherTelaCalcular();
        if (screenId === 'telaResultados') exibirResultados();
    }

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            setActiveScreen(button.dataset.target);
        });
    });

    // --- Gerenciamento de Dietas ---
    const dietasContainer = document.getElementById('dietasContainer');
    const noDietasMessage = document.getElementById('noDietasMessage');
    const btnNovaDieta = document.getElementById('btnNovaDieta');
    const modalDieta = document.getElementById('modalDieta');
    const modalDietaTitle = document.getElementById('modalDietaTitle');
    const inputNomeDieta = document.getElementById('inputNomeDieta');
    const ingredientesFormContainer = document.getElementById('ingredientesFormContainer');
    const btnAdicionarIngredienteForm = document.getElementById('btnAdicionarIngredienteForm');
    const btnSalvarDieta = document.getElementById('btnSalvarDieta');
    const btnCancelarDieta = document.getElementById('btnCancelarDieta');
    const modalDietaIndexInput = document.getElementById('modalDietaIndex');
    const lblMensagemDietas = document.getElementById('lblMensagemDietas');
    const modalDietaError = document.getElementById('modalDietaError');

    // Import/Export Dietas
    const btnImportDietas = document.getElementById('btnImportDietas');
    const importDietasFile = document.getElementById('importDietasFile');
    const btnExportDietas = document.getElementById('btnExportDietas');

    function carregarDietasDoLocalStorage() {
        const dietasJSON = localStorage.getItem('animalFeederDietas');
        dietas = dietasJSON ? JSON.parse(dietasJSON) : [];
    }

    function salvarDietasNoLocalStorage() {
        localStorage.setItem('animalFeederDietas', JSON.stringify(dietas));
    }

    function exibirDietas() {
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

        document.querySelectorAll('.btn-editar-dieta').forEach(btn => btn.addEventListener('click', (e) => abrirModalEditarDieta(parseInt(e.target.dataset.index))));
        document.querySelectorAll('.btn-excluir-dieta').forEach(btn => btn.addEventListener('click', (e) => excluirDieta(parseInt(e.target.dataset.index))));
    }

    function carregarEExibirDietas() {
        carregarDietasDoLocalStorage();
        exibirDietas();
    }

    function adicionarIngredienteAoForm(nome = '', quantidade = '') {
        const div = document.createElement('div');
        div.className = 'flex items-center space-x-2 mb-2 ingrediente-form-item p-2 bg-input-bg rounded';
        div.innerHTML = `
            <input type="text" placeholder="Nome Ingrediente" value="${nome}" class="input-nome-ingrediente flex-grow p-2 rounded-md bg-bg-main border border-gray-600 focus:ring-1 focus:ring-blue-500 outline-none caret-cursor-green text-sm">
            <input type="number" placeholder="Qtd (kg)" value="${quantidade}" class="input-qtd-ingrediente w-24 p-2 rounded-md bg-bg-main border border-gray-600 focus:ring-1 focus:ring-blue-500 outline-none caret-cursor-green text-sm" step="0.01">
            <button class="btn-remover-ingrediente-form bg-red-700 hover:bg-red-600 text-white font-bold py-1 px-2.5 rounded-md text-xs transition-colors">-</button>
        `;
        ingredientesFormContainer.appendChild(div);
        div.querySelector('.btn-remover-ingrediente-form').addEventListener('click', () => div.remove());
    }

    btnAdicionarIngredienteForm.addEventListener('click', () => adicionarIngredienteAoForm());

    function abrirModalNovaDieta() {
        modalDietaTitle.textContent = 'Nova Dieta';
        inputNomeDieta.value = '';
        ingredientesFormContainer.innerHTML = '';
        adicionarIngredienteAoForm(); // Adiciona um campo de ingrediente inicial
        modalDietaIndexInput.value = ''; // Limpa o índice (para garantir que é uma nova dieta)
        modalDietaError.textContent = '';
        modalDieta.classList.remove('hidden');
        inputNomeDieta.focus();
    }

    function abrirModalEditarDieta(index) {
        const dieta = dietas[index];
        if (!dieta) return;

        modalDietaTitle.textContent = 'Editar Dieta';
        inputNomeDieta.value = dieta.nomeDieta;
        modalDietaIndexInput.value = index;
        ingredientesFormContainer.innerHTML = '';
        dieta.ingredientesPorCabeca.forEach(ing => {
            adicionarIngredienteAoForm(ing.nomeIngrediente, ing.quantidadeKg);
        });
        if (dieta.ingredientesPorCabeca.length === 0) {
            adicionarIngredienteAoForm();
        }
        modalDietaError.textContent = '';
        modalDieta.classList.remove('hidden');
        inputNomeDieta.focus();
    }

    btnNovaDieta.addEventListener('click', abrirModalNovaDieta);
    btnCancelarDieta.addEventListener('click', () => modalDieta.classList.add('hidden'));

    btnSalvarDieta.addEventListener('click', async () => {
        const nomeDieta = inputNomeDieta.value.trim();
        if (!nomeDieta) {
            modalDietaError.textContent = 'O nome da dieta é obrigatório.';
            inputNomeDieta.focus();
            return;
        }

        const ingredientesInputs = ingredientesFormContainer.querySelectorAll('.ingrediente-form-item');
        const ingredientesPorCabeca = [];
        let formValido = true;

        ingredientesInputs.forEach(item => {
            const nomeIng = item.querySelector('.input-nome-ingrediente').value.trim();
            const qtdIng = parseFloat(item.querySelector('.input-qtd-ingrediente').value);

            if (nomeIng && !isNaN(qtdIng) && qtdIng >= 0) {
                ingredientesPorCabeca.push({ nomeIngrediente: nomeIng, quantidadeKg: qtdIng });
            } else if (nomeIng || !isNaN(qtdIng)) { // Se um campo está preenchido mas o outro não ou inválido
                formValido = false;
            }
        });

        if (!formValido) {
            modalDietaError.textContent = 'Verifique os ingredientes. Nome e quantidade (válida) são necessários se o ingrediente for listado.';
            return;
        }
        if (ingredientesPorCabeca.length === 0) {
            modalDietaError.textContent = 'Adicione pelo menos um ingrediente válido.';
            return;
        }
        modalDietaError.textContent = '';


        const novaDieta = { nomeDieta, ingredientesPorCabeca };
        const editIndex = modalDietaIndexInput.value;

        if (editIndex !== '') { // Editando
            dietas[parseInt(editIndex)] = novaDieta;
            lblMensagemDietas.textContent = `Dieta "${nomeDieta}" atualizada com sucesso!`;
        } else { // Nova
            dietas.push(novaDieta);
            lblMensagemDietas.textContent = `Dieta "${nomeDieta}" salva com sucesso!`;
        }
        lblMensagemDietas.className = 'text-green-400 text-center mt-4 text-sm'; await salvarDietasNoLocalStorage();
        exibirDietas(); // Reexibe a lista
        modalDieta.classList.add('hidden');
        setTimeout(() => lblMensagemDietas.textContent = '', 3000);
    });

    function excluirDieta(index) {
        if (confirm(`Tem certeza que deseja excluir a dieta "${dietas[index].nomeDieta}"?`)) {
            const nomeExcluido = dietas[index].nomeDieta;
            dietas.splice(index, 1);
            salvarDietasNoLocalStorage();
            exibirDietas();
            lblMensagemDietas.textContent = `Dieta "${nomeExcluido}" excluída.`;
            lblMensagemDietas.className = 'text-green-400 text-center mt-4 text-sm';
            setTimeout(() => lblMensagemDietas.textContent = '', 3000);
        }
    }

    // Import/Export Dietas
    btnImportDietas.addEventListener('click', () => importDietasFile.click());
    importDietasFile.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedDietas = JSON.parse(e.target.result);
                    if (Array.isArray(importedDietas) && importedDietas.every(d => d.nomeDieta && Array.isArray(d.ingredientesPorCabeca))) {
                        dietas = importedDietas;
                        salvarDietasNoLocalStorage();
                        carregarEExibirDietas();
                        preencherSpinnerDietas(); // Atualiza o spinner na tela de cálculo
                        lblMensagemDietas.textContent = 'Dietas importadas com sucesso!';
                        lblMensagemDietas.className = 'text-green-400 text-center mt-4 text-sm';
                    } else {
                        throw new Error('Formato de arquivo JSON inválido para dietas.');
                    }
                } catch (error) {
                    console.error("Erro ao importar dietas:", error);
                    lblMensagemDietas.textContent = `Erro ao importar: ${error.message}`;
                    lblMensagemDietas.className = 'text-red-400 text-center mt-4 text-sm';
                } finally {
                    importDietasFile.value = ''; // Limpa o input de arquivo
                    setTimeout(() => lblMensagemDietas.textContent = '', 3000);
                }
            };
            reader.readAsText(file);
        }
    });

    btnExportDietas.addEventListener('click', () => {
        if (dietas.length === 0) {
            lblMensagemDietas.textContent = 'Nenhuma dieta para exportar.';
            lblMensagemDietas.className = 'text-yellow-400 text-center mt-4 text-sm';
            setTimeout(() => lblMensagemDietas.textContent = '', 3000);
            return;
        }
        const dietasJson = JSON.stringify(dietas, null, 2);
        const blob = new Blob([dietasJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'animalfeeder_dietas.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        lblMensagemDietas.textContent = 'Dietas exportadas com sucesso!';
        lblMensagemDietas.className = 'text-green-400 text-center mt-4 text-sm';
        setTimeout(() => lblMensagemDietas.textContent = '', 3000);
    });

    // --- Gerenciamento de Lotes ---
    const lotesContainer = document.getElementById('lotesContainer');
    const noLotesMessage = document.getElementById('noLotesMessage');
    const inputNovoLote = document.getElementById('inputNovoLote');
    const btnAdicionarLote = document.getElementById('btnAdicionarLote');
    const lblStatusLotes = document.getElementById('lblStatusLotes');

    // Import/Export Lotes
    const btnImportLotes = document.getElementById('btnImportLotes');
    const importLotesFile = document.getElementById('importLotesFile');
    const btnExportLotes = document.getElementById('btnExportLotes');

    function carregarLotesDoLocalStorage() {
        const lotesJSON = localStorage.getItem('animalFeederLotes');
        // Lotes são armazenados como um array de números
        lotes = lotesJSON ? JSON.parse(lotesJSON) : [];
    }

    function salvarLotesNoLocalStorage() {
        localStorage.setItem('animalFeederLotes', JSON.stringify(lotes));
    }

    function exibirLotes() {
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

        document.querySelectorAll('.btn-excluir-lote').forEach(btn => btn.addEventListener('click', (e) => excluirLote(parseInt(e.target.dataset.index))));
    }

    function carregarEExibirLotes() {
        carregarLotesDoLocalStorage();
        exibirLotes();
    }

    btnAdicionarLote.addEventListener('click', async () => {
        const numCabecas = parseInt(inputNovoLote.value); if (!isNaN(numCabecas) && numCabecas > 0) {
            lotes.push(numCabecas);
            await salvarLotesNoLocalStorage();
            exibirLotes();
            inputNovoLote.value = '';
            lblStatusLotes.textContent = 'Lote adicionado!';
            lblStatusLotes.className = 'text-green-400 text-center mt-4 text-sm';
        } else {
            lblStatusLotes.textContent = 'Número de cabeças inválido.';
            lblStatusLotes.className = 'text-red-400 text-center mt-4 text-sm';
            inputNovoLote.focus();
        }
        setTimeout(() => lblStatusLotes.textContent = '', 3000);
    });

    function excluirLote(index) {
        if (confirm(`Tem certeza que deseja excluir o Lote ${index + 1} (${lotes[index]} cabeças)?`)) {
            lotes.splice(index, 1);
            salvarLotesNoLocalStorage();
            exibirLotes();
            lblStatusLotes.textContent = 'Lote excluído.';
            lblStatusLotes.className = 'text-green-400 text-center mt-4 text-sm';
            setTimeout(() => lblStatusLotes.textContent = '', 3000);
        }
    }

    // Import/Export Lotes
    btnImportLotes.addEventListener('click', () => importLotesFile.click());
    importLotesFile.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedLotes = JSON.parse(e.target.result);
                    if (Array.isArray(importedLotes) && importedLotes.every(l => typeof l === 'number' && l > 0)) {
                        lotes = importedLotes;
                        salvarLotesNoLocalStorage();
                        carregarEExibirLotes();
                        preencherResumoLotesTelaCalcular(); // Atualiza resumo na tela de cálculo
                        lblStatusLotes.textContent = 'Lotes importados com sucesso!';
                        lblStatusLotes.className = 'text-green-400 text-center mt-4 text-sm';
                    } else {
                        throw new Error('Formato de arquivo JSON inválido para lotes (deve ser um array de números).');
                    }
                } catch (error) {
                    console.error("Erro ao importar lotes:", error);
                    lblStatusLotes.textContent = `Erro ao importar: ${error.message}`;
                    lblStatusLotes.className = 'text-red-400 text-center mt-4 text-sm';
                } finally {
                    importLotesFile.value = ''; // Limpa o input de arquivo
                    setTimeout(() => lblStatusLotes.textContent = '', 3000);
                }
            };
            reader.readAsText(file);
        }
    });

    btnExportLotes.addEventListener('click', () => {
        if (lotes.length === 0) {
            lblStatusLotes.textContent = 'Nenhum lote para exportar.';
            lblStatusLotes.className = 'text-yellow-400 text-center mt-4 text-sm';
            setTimeout(() => lblStatusLotes.textContent = '', 3000);
            return;
        }
        const lotesJson = JSON.stringify(lotes, null, 2);
        const blob = new Blob([lotesJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'animalfeeder_lotes.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        lblStatusLotes.textContent = 'Lotes exportados com sucesso!';
        lblStatusLotes.className = 'text-green-400 text-center mt-4 text-sm';
        setTimeout(() => lblStatusLotes.textContent = '', 3000);
    });

    // --- Tela de Calcular ---
    const spinnerDietas = document.getElementById('spinnerDietas');
    const lblQtdLotes = document.getElementById('lblQtdLotes');
    const lblTotalCabecas = document.getElementById('lblTotalCabecas');
    const inputPvMedio = document.getElementById('inputPvMedio');
    const inputPercConsumo = document.getElementById('inputPercConsumo');
    const btnCalcularRacao = document.getElementById('btnCalcularRacao');
    const lblErroCalculo = document.getElementById('lblErroCalculo');

    function preencherSpinnerDietas() {
        spinnerDietas.innerHTML = '';
        if (dietas.length === 0) {
            const option = document.createElement('option');
            option.value = "";
            option.textContent = "Nenhuma dieta cadastrada";
            spinnerDietas.appendChild(option);
            spinnerDietas.disabled = true;
            return;
        }
        spinnerDietas.disabled = false;
        dietas.forEach((dieta, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = dieta.nomeDieta;
            spinnerDietas.appendChild(option);
        });
    }

    function preencherResumoLotesTelaCalcular() {
        if (lotes.length === 0) {
            lblQtdLotes.textContent = 'Nenhum lote encontrado';
            lblTotalCabecas.textContent = 'Total: 0 cabeças';
        } else {
            const totalCabecas = lotes.reduce((sum, current) => sum + current, 0);
            lblQtdLotes.textContent = `${lotes.length} lote(s)`;
            lblTotalCabecas.textContent = `Total: ${totalCabecas} cabeças`;
        }
    }

    function preencherTelaCalcular() {
        carregarDietasDoLocalStorage(); // Garante que as dietas estão atualizadas
        carregarLotesDoLocalStorage();  // Garante que os lotes estão atualizados
        preencherSpinnerDietas();
        preencherResumoLotesTelaCalcular();
        inputPvMedio.value = localStorage.getItem('animalFeederPvMedio') || '';
        inputPercConsumo.value = localStorage.getItem('animalFeederPercConsumo') || '';
        lblErroCalculo.textContent = '';
        if (dietas.length > 0) inputPvMedio.focus();
    }

    // Função de cálculo portada de calculadora.py
    function calcularQuantidadesRacaoJS(numeroCabecas, dietaObj, pvMedioKg, percentualConsumoMs) {
        const resultados = [];
        if (!dietaObj || !dietaObj.ingredientesPorCabeca || dietaObj.ingredientesPorCabeca.length === 0) {
            console.error("Erro: Dieta não tem ingredientes ou lista de ingredientes está vazia.");
            return { erro: "Dieta inválida ou sem ingredientes.", calculos: [] };
        }
        if (pvMedioKg <= 0 || percentualConsumoMs <= 0 || numeroCabecas <= 0) {
            console.error(`Erro: Inputs inválidos - PV: ${pvMedioKg}, %Consumo: ${percentualConsumoMs}, Cabeças: ${numeroCabecas}`);
            return { erro: "Valores de PV, % Consumo ou Nº Cabeças inválidos.", calculos: dietaObj.ingredientesPorCabeca.map(ing => ({ nome: ing.nomeIngrediente, quantidade: 0 })) };
        }

        const consumoDiarioAnimalMsKg = pvMedioKg * (percentualConsumoMs / 100.0);
        const consumoTotalLoteMsKg = consumoDiarioAnimalMsKg * numeroCabecas;

        // Soma das quantidades (proporções) da dieta como definida pelo usuário
        const somaProporcoesDieta = dietaObj.ingredientesPorCabeca.reduce((sum, ing) => sum + (ing.quantidadeKg || 0), 0);

        if (somaProporcoesDieta === 0) {
            console.error("Erro: Soma das proporções da dieta é zero. Verifique a formulação da dieta.");
            return { erro: "Formulação da dieta inválida (soma das quantidades é zero).", calculos: dietaObj.ingredientesPorCabeca.map(ing => ({ nome: ing.nomeIngrediente, quantidade: 0 })) };
        }

        dietaObj.ingredientesPorCabeca.forEach(ingrediente => {
            if (ingrediente.nomeIngrediente && typeof ingrediente.quantidadeKg === 'number' && ingrediente.quantidadeKg >= 0) {
                const proporcaoDoIngredienteNaDieta = ingrediente.quantidadeKg / somaProporcoesDieta;
                const quantidadeFinalIngrediente = proporcaoDoIngredienteNaDieta * consumoTotalLoteMsKg;
                resultados.push({ nome: ingrediente.nomeIngrediente, quantidade: quantidadeFinalIngrediente });
            } else if (ingrediente.nomeIngrediente) {
                resultados.push({ nome: ingrediente.nomeIngrediente, quantidade: 0 });
            }
        });
        return { erro: null, calculos: resultados, consumoDiarioAnimalMsKg, consumoTotalLoteMsKg };
    }

    btnCalcularRacao.addEventListener('click', () => {
        lblErroCalculo.textContent = '';
        const dietaIndex = spinnerDietas.value;
        const pvMedio = parseFloat(inputPvMedio.value);
        const percConsumo = parseFloat(inputPercConsumo.value);
        const totalCabecas = lotes.reduce((sum, current) => sum + current, 0);

        if (dietas.length === 0 || dietaIndex === "") {
            lblErroCalculo.textContent = 'Nenhuma dieta selecionada ou cadastrada.';
            spinnerDietas.focus();
            return;
        }
        if (lotes.length === 0 || totalCabecas <= 0) {
            lblErroCalculo.textContent = 'Nenhum lote cadastrado ou número total de cabeças é zero.';
            // Poderia focar no botão de gerenciar lotes ou na tela de lotes.
            return;
        }
        if (isNaN(pvMedio) || pvMedio <= 0) {
            lblErroCalculo.textContent = 'PV Médio inválido.';
            inputPvMedio.focus();
            return;
        }
        if (isNaN(percConsumo) || percConsumo <= 0) {
            lblErroCalculo.textContent = '% Consumo inválido.';
            inputPercConsumo.focus();
            return;
        }

        localStorage.setItem('animalFeederPvMedio', pvMedio);
        localStorage.setItem('animalFeederPercConsumo', percConsumo);

        const dietaSelecionada = dietas[parseInt(dietaIndex)];
        const resultadoCalculo = calcularQuantidadesRacaoJS(totalCabecas, dietaSelecionada, pvMedio, percConsumo);

        if (resultadoCalculo.erro) {
            lblErroCalculo.textContent = `Erro no cálculo: ${resultadoCalculo.erro}`;
            resultadosCalculo = null; // Limpa resultados anteriores em caso de erro
        } else {
            resultadosCalculo = {
                nomeDieta: dietaSelecionada.nomeDieta,
                totalCabecas: totalCabecas,
                pvMedio: pvMedio,
                percConsumo: percConsumo,
                consumoDiarioAnimalMsKg: resultadoCalculo.consumoDiarioAnimalMsKg,
                consumoTotalLoteMsKg: resultadoCalculo.consumoTotalLoteMsKg,
                ingredientesCalculados: resultadoCalculo.calculos,
                dataCalculo: new Date().toLocaleString('pt-BR')
            };
            localStorage.setItem('animalFeederResultados', JSON.stringify(resultadosCalculo));
            setActiveScreen('telaResultados');
        }
    });

    // --- Tela de Resultados ---
    const resultadosContainer = document.getElementById('resultadosContainer');
    const noResultsMessage = document.getElementById('noResultsMessage');
    const btnExportarExcel = document.getElementById('btnExportarExcel');
    const lblExportStatus = document.getElementById('lblExportStatus');

    function exibirResultados() {
        const resultadosJSON = localStorage.getItem('animalFeederResultados');
        if (!resultadosJSON) {
            resultadosContainer.innerHTML = '';
            noResultsMessage.classList.remove('hidden');
            btnExportarExcel.disabled = true;
            return;
        }
        noResultsMessage.classList.add('hidden');
        btnExportarExcel.disabled = false;

        const dados = JSON.parse(resultadosJSON);
        resultadosCalculo = dados; // Atualiza a variável global para exportação

        let htmlResultados = `
            <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4 p-3 bg-bg-main rounded-md">
                <strong class="text-text-gray col-span-2 text-base mb-1">Resumo do Cálculo:</strong>
                <span class="text-text-gray">Dieta:</span> <span class="text-white">${dados.nomeDieta}</span>
                <span class="text-text-gray">Total Cabeças:</span> <span class="text-white">${dados.totalCabecas}</span>
                <span class="text-text-gray">PV Médio:</span> <span class="text-white">${dados.pvMedio} kg</span>
                <span class="text-text-gray">% Consumo MS:</span> <span class="text-white">${dados.percConsumo} %</span>
                <span class="text-text-gray">CMS/Animal/Dia:</span> <span class="text-white">${dados.consumoDiarioAnimalMsKg.toFixed(2)} kg</span>
                <span class="text-text-gray">CMS Total Lote/Dia:</span> <span class="text-white">${dados.consumoTotalLoteMsKg.toFixed(2)} kg</span>
                <span class="text-text-gray">Data:</span> <span class="text-white">${dados.dataCalculo}</span>
            </div>
            <strong class="block text-text-gray text-base mb-2">Ingredientes (Total para o Lote):</strong>
            <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm p-3 bg-bg-main rounded-md">
                <strong class="text-yellow-400">Ingrediente</strong>
                <strong class="text-yellow-400 text-right">Total (kg)</strong>
        `;

        let pesoTotalGeralCalculado = 0;
        dados.ingredientesCalculados.forEach(ing => {
            htmlResultados += `
                <span class="text-text-gray">${ing.nome}</span>
                <span class="text-white text-right">${ing.quantidade.toFixed(2)}</span>
            `;
            pesoTotalGeralCalculado += ing.quantidade;
        });

        const sacos60kg = pesoTotalGeralCalculado / 60;
        const sacosInteiros = Math.floor(sacos60kg);
        const restoKg = (sacos60kg - sacosInteiros) * 60;

        htmlResultados += `
            </div>
            <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mt-4 p-3 bg-bg-main rounded-md">
                <strong class="text-yellow-400">TOTAL GERAL:</strong>
                <strong class="text-white text-right">${pesoTotalGeralCalculado.toFixed(2)} kg</strong>

                <span class="text-text-gray">Sacos de 60kg:</span>
                <span class="text-white text-right">${sacosInteiros} sacos</span>

                <span class="text-text-gray">Resto:</span>
                <span class="text-white text-right">${restoKg.toFixed(2)} kg</span>
            </div>
        `;
        resultadosContainer.innerHTML = htmlResultados;
        lblExportStatus.textContent = '';
    }

    btnExportarExcel.addEventListener('click', () => {
        if (!resultadosCalculo || !resultadosCalculo.ingredientesCalculados) {
            lblExportStatus.textContent = "Nenhum dado de cálculo para exportar.";
            lblExportStatus.className = 'text-yellow-400 text-center mt-4 text-sm';
            return;
        }
        try {
            const dados = resultadosCalculo;
            const dataParaExportar = [
                ['Parâmetro', 'Valor'],
                ['Data do Cálculo', dados.dataCalculo],
                ['Nome da Dieta', dados.nomeDieta],
                ['Total de Cabeças', dados.totalCabecas],
                ['PV Médio (kg)', dados.pvMedio],
                ['% Consumo MS', dados.percConsumo],
                ['CMS/Animal/Dia (kg)', dados.consumoDiarioAnimalMsKg.toFixed(2)],
                ['CMS Total Lote/Dia (kg)', dados.consumoTotalLoteMsKg.toFixed(2)],
                [], // Linha em branco
                ['Ingrediente', 'Total em KG']
            ];

            let pesoTotalGeral = 0;
            dados.ingredientesCalculados.forEach(ing => {
                dataParaExportar.push([ing.nome, parseFloat(ing.quantidade.toFixed(2))]);
                pesoTotalGeral += ing.quantidade;
            });

            const sacos60kg = pesoTotalGeral / 60;
            const sacosInteiros = Math.floor(sacos60kg);
            const restoKg = (sacos60kg - sacosInteiros) * 60;

            dataParaExportar.push([]); // Linha em branco
            dataParaExportar.push(['Resumo Geral', 'Valor']);
            dataParaExportar.push(['TOTAL GERAL (kg)', parseFloat(pesoTotalGeral.toFixed(2))]);
            dataParaExportar.push(['Sacos de 60kg (Completos)', sacosInteiros]);
            dataParaExportar.push(['Resto (kg)', parseFloat(restoKg.toFixed(2))]);

            const ws = XLSX.utils.aoa_to_sheet(dataParaExportar);
            // Ajustar largura das colunas (opcional, mas melhora a visualização)
            ws['!cols'] = [{ wch: 30 }, { wch: 20 }];

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Resultados Racao");

            const timestamp = new Date().toISOString().replace(/[-:.]/g, "").slice(0, -4);
            XLSX.writeFile(wb, `resultados_racao_${timestamp}.xlsx`);

            lblExportStatus.textContent = "Exportado para Excel com sucesso!";
            lblExportStatus.className = 'text-green-400 text-center mt-4 text-sm';

        } catch (error) {
            console.error("Erro ao exportar para Excel:", error);
            lblExportStatus.textContent = `Erro ao exportar: ${error.message}`;
            lblExportStatus.className = 'text-red-400 text-center mt-4 text-sm';
        }
        setTimeout(() => lblExportStatus.textContent = '', 4000);
    });

    // --- Inicialização ---
    carregarDietasDoLocalStorage(); // Carrega inicialmente para popular o spinner
    carregarLotesDoLocalStorage();  // Carrega inicialmente para popular o resumo de lotes
    setActiveScreen('telaInicial'); // Define a tela inicial
});
