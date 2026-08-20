// app.js

// ----------------------------------------------------
// 1. Tratamento e Mapeamento de Dados (Funções Puras)
// ----------------------------------------------------

/**
 * Formata data no formato ISO (AAAA-MM-DD) para padrão brasileiro (DD/MM/AAAA)
 * @param {string} dataString 
 * @returns {string}
 */
const formatarData = (dataString) => {
  if (!dataString) return 'Não informada';
  const partes = dataString.split('-');
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return dataString;
};

/**
 * Formata strings de CNPJ inseridas sem caracteres especiais
 * @param {string} cnpj 
 * @returns {string}
 */
const formatarCNPJ = (cnpj) => {
  if (!cnpj) return '';
  const limpo = cnpj.replace(/\D/g, '');
  if (limpo.length !== 14) return cnpj;
  return limpo.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
};

/**
 * Mapeia os dados brutos recebidos da BrasilAPI para a estrutura exigida.
 * Exemplo de função pura para garantir resiliência aos dados de entrada.
 * 
 * @param {Object} payload - Dados originais da API
 * @returns {Object|null} Dados higienizados para a interface
 */
export const mapearDadosCNPJ = (payload) => {
  if (!payload) return null;

  const {
    cnpj,
    razao_social,
    descricao_situacao_cadastral,
    data_inicio_atividade,
    cnae_fiscal_descricao,
    logradouro,
    municipio,
    uf
  } = payload;

  return {
    cnpj: formatarCNPJ(cnpj) || 'Não informado',
    razaoSocial: razao_social || 'Não informada',
    situacao: descricao_situacao_cadastral || 'Não informada',
    dataInicio: formatarData(data_inicio_atividade),
    cnaeDescricao: cnae_fiscal_descricao || 'Não informado',
    logradouro: logradouro || 'Não informado',
    municipio: municipio || 'Não informado',
    uf: uf || 'Não especificado'
  };
};

// ----------------------------------------------------
// 2. Geração de Interface (HTML Dinâmico)
// ----------------------------------------------------

/**
 * Gera a estrutura HTML para renderizar os dados estruturados do CNPJ.
 * @param {Object} dados 
 * @returns {string} HTML Template String
 */
export const gerarCardCNPJHTML = (dados) => {
  if (!dados) {
    return `
      <div class="empty-state">
        <p>Nenhum dado disponível para visualização.</p>
      </div>
    `;
  }

  const {
    cnpj,
    razaoSocial,
    situacao,
    dataInicio,
    cnaeDescricao,
    logradouro,
    municipio,
    uf
  } = dados;

  const classeSituacao = situacao.toUpperCase() === 'ATIVA' ? 'badge-ativa' : 'badge-outros';

  return `
    <article class="cnpj-card">
      <h3>
        ${razaoSocial}
        <span class="badge-situacao ${classeSituacao}">${situacao}</span>
      </h3>
      
      <div class="grid-details">
        <div class="detail-item">
          <span class="label">CNPJ</span>
          <span class="value">${cnpj}</span>
        </div>
        <div class="detail-item">
          <span class="label">Data de Início</span>
          <span class="value">${dataInicio}</span>
        </div>
        <div class="detail-item">
          <span class="label">Atividade Principal (CNAE)</span>
          <span class="value">${cnaeDescricao}</span>
        </div>
        <div class="detail-item">
          <span class="label">Logradouro</span>
          <span class="value">${logradouro}</span>
        </div>
        <div class="detail-item">
          <span class="label">Município / UF</span>
          <span class="value">${municipio} - ${uf}</span>
        </div>
      </div>
    </article>
  `;
};

/**
 * Gera o componente de erro apropriado com base no código de status.
 * @param {number} status 
 * @param {string} mensagem 
 * @returns {string}
 */
export const gerarErroHTML = (status, mensagem) => {
  let titulo = 'Erro Inesperado';
  let explicacao = mensagem || 'Ocorreu uma falha na comunicação com o servidor.';

  if (status === 400) {
    titulo = 'Formato de CNPJ Inválido';
    explicacao = 'Por favor, insira um CNPJ válido com 14 dígitos numéricos.';
  } else if (status === 404) {
    titulo = 'CNPJ Não Encontrado';
    explicacao = 'A base de dados da BrasilAPI não retornou registros para este CNPJ.';
  } else if (status === 500) {
    titulo = 'Falha Interna no Servidor';
    explicacao = 'O servidor remoto enfrentou instabilidades. Tente novamente mais tarde.';
  }

  return `
    <div class="error-state">
      <div class="error-icon" aria-hidden="true">⚠️</div>
      <p class="error-title">Status ${status}: ${titulo}</p>
      <p class="error-message">${explicacao}</p>
    </div>
  `;
};

// ----------------------------------------------------
// 3. Orquestração e Chamadas de API / Simulação
// ----------------------------------------------------

const API_BASE_URL = 'https://brasilapi.com.br/api/cnpj/v1';
const resultContainer = document.getElementById('result-container');
const cnpjInput = document.getElementById('cnpj-input');
const searchForm = document.getElementById('search-form');

// Máscara simplificada de entrada para o CNPJ
cnpjInput.addEventListener('input', (e) => {
  let value = e.target.value.replace(/\D/g, '');
  if (value.length > 14) value = value.slice(0, 14);
  
  if (value.length > 12) {
    value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  } else if (value.length > 8) {
    value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})$/, '$1.$2.$3/$4');
  } else if (value.length > 5) {
    value = value.replace(/^(\d{2})(\d{3})(\d{3})$/, '$1.$2.$3');
  } else if (value.length > 2) {
    value = value.replace(/^(\d{2})(\d{3})$/, '$1.$2');
  }
  
  e.target.value = value;
});

/**
 * Executa a requisição externa ou simula cenários controlados
 * @param {string} cnpj - Número limpo do CNPJ
 * @param {boolean} forceMock500 - Força a emulação do erro de servidor
 */
const realizarConsulta = async (cnpj, forceMock500 = false) => {
  resultContainer.innerHTML = `
    <div class="loader">
      <div class="spinner" aria-hidden="true"></div>
      <p>Consultando base de dados da BrasilAPI...</p>
    </div>
  `;

  try {
    if (forceMock500) {
      // Simulação controlada de erro 500 local
      await new Promise(resolve => setTimeout(resolve, 800));
      throw { status: 500, message: 'Erro interno simulado no servidor.' };
    }

    const cnpjLimpo = cnpj.replace(/\D/g, '');
    
    // Validação preliminar do formato para simulação direta do erro 400
    if (cnpjLimpo.length !== 14) {
      throw { status: 400, message: 'CNPJ deve conter exatamente 14 dígitos.' };
    }

    const resposta = await fetch(`${API_BASE_URL}/${cnpjLimpo}`);

    if (!resposta.ok) {
      throw { status: resposta.status, message: 'Erro retornado pela API externa.' };
    }

    const dadosBrutos = await resposta.json();
    const dadosMapeados = mapearDadosCNPJ(dadosBrutos);
    
    resultContainer.innerHTML = gerarCardCNPJHTML(dadosMapeados);

  } catch (erro) {
    const status = erro.status || 500;
    const mensagem = erro.message || '';
    resultContainer.innerHTML = gerarErroHTML(status, mensagem);
  }
};

// Evento de submissão do formulário
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const cnpj = cnpjInput.value;
  if (cnpj) {
    realizarConsulta(cnpj);
  }
});

// Eventos do Painel de Testes Rápidos
document.querySelectorAll('.btn-test').forEach(botao => {
  botao.addEventListener('click', () => {
    const cenario = botao.getAttribute('data-test');

    switch (cenario) {
      case '200':
        // Banco do Brasil S.A. (CNPJ Real Válido)
        cnpjInput.value = '00.000.000/0001-91';
        realizarConsulta('00000000000191');
        break;
      case '400':
        // Formato Inválido
        cnpjInput.value = '1234-invalid';
        realizarConsulta('1234');
        break;
      case '404':
        // CNPJ inexistente mas com formato estruturado correto
        cnpjInput.value = '99.999.999/0001-99';
        realizarConsulta('99999999000199');
        break;
      case '500':
        // Força a emulação do status 500
        cnpjInput.value = '55.555.555/0005-55';
        realizarConsulta('55555555000555', true);
        break;
    }
  });
});