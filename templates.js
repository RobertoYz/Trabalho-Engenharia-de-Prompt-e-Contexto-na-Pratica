import { mapearDadosCNPJ } from './utils.js';

/**
 * Gera o HTML para o card com os dados cadastrais estruturados da empresa.
 * @param {object} dadosBrutos 
 * @returns {string} String HTML
 */
export const gerarCardEmpresaHTML = (dadosBrutos) => {
  const dados = mapearDadosCNPJ(dadosBrutos);
  if (!dados) return "";

  const {
    cnpj,
    razaoSocial,
    status,
    dataInicio,
    cnaeDescricao,
    endereco,
    localidade
  } = dados;

  const classeStatus = status === "ATIVA" ? "status-ativa" : "status-inativa";

  return `
    <article class="card-empresa fade-in" aria-labelledby="razao-social-titulo">
      <header class="card-header">
        <div>
          <span class="badge ${classeStatus}">${status}</span>
          <h2 id="razao-social-titulo" class="razao-social">${razaoSocial}</h2>
          <p class="cnpj-subtle">CNPJ: ${cnpj}</p>
        </div>
      </header>
      
      <div class="card-body">
        <div class="info-group">
          <span class="info-label">Atividade Econômica Principal (CNAE)</span>
          <p class="info-value">${cnaeDescricao}</p>
        </div>

        <div class="info-grid">
          <div class="info-group">
            <span class="info-label">Data de Início da Atividade</span>
            <p class="info-value">${dataInicio}</p>
          </div>
          <div class="info-group">
            <span class="info-label">Localização</span>
            <p class="info-value">${localidade}</p>
          </div>
        </div>

        <div class="info-group border-top">
          <span class="info-label">Logradouro / Endereço</span>
          <p class="info-value">${endereco}</p>
        </div>
      </div>
    </article>
  `;
};

/**
 * Gera mensagem estruturada para cenários de erro ou estados vazios.
 * @param {string} titulo 
 * @param {string} mensagem 
 * @param {string} tipo (error|info)
 * @returns {string} String HTML
 */
export const gerarAlertaHTML = (titulo, mensagem, tipo = "error") => {
  const icon = tipo === "error" ? "⚠️" : "ℹ️";
  return `
    <div class="alerta alerta-${tipo} fade-in" role="alert">
      <span class="alerta-icon" aria-hidden="true">${icon}</span>
      <div>
        <h4 class="alerta-titulo">${titulo}</h4>
        <p class="alerta-corpo">${mensagem}</p>
      </div>
    </div>
  `;
};

/**
 * Gera o esqueleto animado indicador de processamento/carregamento.
 * @returns {string} String HTML
 */
export const gerarLoaderHTML = () => `
  <div class="loader-container" aria-busy="true" aria-live="polite">
    <div class="spinner"></div>
    <p>Buscando informações na base da BrasilAPI...</p>
  </div>
`;