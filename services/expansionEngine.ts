// services/expansionEngine.ts

export const constructExpansionPrompt = (
    originalPrompt: string, 
    influence: number, 
    elementsToKeep: string[]
): string => {
    
    if (influence === 100) {
        return `Expanda a imagem perfeitamente, mantendo o estilo e conteúdo 100% idênticos, apenas adicionando mais detalhes nas bordas.`;
    }

    if (influence === 0) {
        return `Use a imagem original apenas como uma referência de cor e tema, mas crie uma cena completamente nova e diferente em um estilo visualmente impactante.`;
    }

    const influenceText = `O nível de influência da imagem original é de ${influence}%.`;
    const elementsText = elementsToKeep.length > 0
        ? `Preserve os seguintes elementos da imagem original: ${elementsToKeep.join(', ')}.`
        : 'Você tem liberdade criativa total sobre os elementos.';

    return `Expanda a imagem de forma criativa. ${influenceText} ${elementsText} O prompt original era: "${originalPrompt}". Crie uma composição maior e mais elaborada.`;
}
