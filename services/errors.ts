// services/errors.ts
// Populating this file with custom error classes for the application.

/**
 * Classe base para erros personalizados relacionados ao serviço Gemini.
 */
export class GeminiError extends Error {
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

/**
 * Lançado quando uma chave de API é inválida, não encontrada ou não possui as permissões necessárias.
 */
export class ApiKeyError extends GeminiError {
    constructor(message = "Chave de API inválida ou não encontrada. Por favor, selecione outra chave e tente novamente.") {
        super(message);
    }
}

/**
 * Lançado quando a geração de conteúdo é bloqueada devido a políticas de segurança.
 */
export class SafetyError extends GeminiError {
    constructor(message = "Sua solicitação foi bloqueada por políticas de segurança. Tente um prompt ou imagem diferente.") {
        super(message);
    }
}

/**
 * Lançado quando o modelo de IA falha em gerar o formato de saída esperado (por exemplo, sem dados de imagem).
 */
export class GenerationError extends GeminiError {
    constructor(message = "A IA não conseguiu gerar o conteúdo esperado. Tente novamente com um prompt ou configuração diferente.") {
        super(message);
    }
}

/**
 * Lançado para problemas genéricos de rede ao se comunicar com a API.
 */
export class NetworkError extends GeminiError {
    constructor(message = "Ocorreu um erro de rede. Verifique sua conexão e tente novamente.") {
        super(message);
    }
}
