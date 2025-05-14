// Funções relacionadas ao cálculo de ração

function calcularQuantidadesRacaoJS(numeroCabecas, dietaObj, pvMedioKg, percentualConsumoMs) {
    const resultados = [];
    if (!dietaObj || !dietaObj.ingredientesPorCabeca || dietaObj.ingredientesPorCabeca.length === 0) {
        return { erro: "Dieta inválida ou sem ingredientes.", calculos: [] };
    }
    if (pvMedioKg <= 0 || percentualConsumoMs <= 0 || numeroCabecas <= 0) {
        return { erro: "Valores de PV, % Consumo ou Nº Cabeças inválidos.", calculos: dietaObj.ingredientesPorCabeca.map(ing => ({ nome: ing.nomeIngrediente, quantidade: 0 })) };
    }
    const consumoDiarioAnimalMsKg = pvMedioKg * (percentualConsumoMs / 100.0);
    const consumoTotalLoteMsKg = consumoDiarioAnimalMsKg * numeroCabecas;
    const somaProporcoesDieta = dietaObj.ingredientesPorCabeca.reduce((sum, ing) => sum + (ing.quantidadeKg || 0), 0);
    if (somaProporcoesDieta === 0) {
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

// Outras funções de cálculo podem ser adicionadas aqui
