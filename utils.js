/**
 * Formata uma string de CNPJ apenas com números para a máscara padrão nacional.
 * @param {string} cnpj 
 * @returns {string} CNPJ Formatado ou string original
 */
export const formatarCNPJ = (cnpj) => {
  const limpo = String(cnpj).replace(/\D/g, "");
  if (limpo.length !== 14) return cnpj;
  return limpo.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
};

/**
 * Converte data ISO (AAAA-MM-DD) para formato legível brasileiro (DD/MM/AAAA).
 * @param {string} dataIso 
 * @returns {string} Data formatada ou string original
 */
export const formatarDataBR = (dataIso) => {
  if (!dataIso) return "Não informada";
  const partes = dataIso.split("-");
  if (partes.length !== 3) return dataIso;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
};

/**
 * Mapeia os dados brutos recebidos da API garantindo consistência.
 * Implementa os requisitos estabelecidos na etapa de renderização da UC-11.
 * @param {object} payload 
 * @returns {object|null} Dados limpos mapeados ou null
 */
export const mapearDadosCNPJ = (payload) => {
  if (!payload) return null;

  const {
    cnpj = "",
    razao_social = "",
    descricao_situacao_cadastral = "",
    data_inicio_atividade = "",
    cnae_fiscal_descricao = "",
    logradouro = "",
    numero = "",
    complemento = "",
    municipio = "",
    uf = ""
  } = payload;

  const enderecoCompleto = [
    logradouro,
    numero ? `, Nº ${numero}` : "",
    complemento ? ` - ${complemento}` : ""
  ].filter(Boolean).join("");

  return {
    cnpj: formatarCNPJ(cnpj),
    razaoSocial: razao_social || "Razão Social não informada",
    status: (descricao_situacao_cadastral || "DESCONHECIDA").toUpperCase(),
    dataInicio: formatarDataBR(data_inicio_atividade),
    cnaeDescricao: cnae_fiscal_descricao || "Atividade principal não catalogada",
    endereco: enderecoCompleto || "Endereço não disponível",
    localidade: municipio && uf ? `${municipio} - ${uf}` : "Localidade não informada"
  };
};