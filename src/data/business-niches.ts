/**
 * Fonte de verdade da taxonomia de nichos do Garimpo.
 * Adicione novos nichos apenas aqui — nunca espalhe listas pelo JSX.
 */

export interface Niche {
  id: string;
  label: string;
  category: string;
  /** Sinônimos usados apenas na pesquisa do combobox e nas consultas ao Google. */
  searchTerms: string[];
}

export const TODOS_OS_NICHOS_ID = "todos";

/** Remove acentos e caixa — usado somente para pesquisa/comparação. */
export function normalizarTexto(valor: string): string {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function slug(label: string): string {
  return normalizarTexto(label)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Sinônimos adicionais por label (opcional). */
const SINONIMOS: Record<string, string[]> = {
  "Clínicas odontológicas": ["dentista", "odontologia", "consultório odontológico"],
  Dentistas: ["dentista", "odontologia"],
  "Clínicas médicas": ["médico", "consultório médico", "ambulatório"],
  "Clínicas de estética": ["estética", "harmonização facial", "botox"],
  Fisioterapia: ["fisioterapeuta", "reabilitação"],
  Psicologia: ["psicólogo", "terapia", "psicoterapia"],
  Nutrição: ["nutricionista"],
  Veterinárias: ["veterinário", "clínica veterinária", "pet"],
  Óticas: ["ótica", "óculos", "optica"],
  "Salões de beleza": ["cabeleireiro", "salão", "beleza"],
  Barbearias: ["barbeiro", "barber shop"],
  Academias: ["academia", "musculação", "fitness"],
  Restaurantes: ["restaurante", "comida", "almoço"],
  "Oficinas mecânicas": ["oficina", "mecânica", "mecânico", "centro automotivo"],
  Autopeças: ["auto peças", "peças automotivas"],
  Funilarias: ["funilaria", "lanternagem"],
  Borracharias: ["borracharia", "pneu"],
  Construtoras: ["construtora", "construção civil"],
  Imobiliárias: ["imobiliária", "imóveis", "corretor"],
  Marcenarias: ["marcenaria", "móveis planejados", "moveis sob medida"],
  "Lojas de móveis": ["móveis", "moveis", "mobiliário"],
  "Escritórios de advocacia": ["advogado", "advocacia", "advogados", "jurídico"],
  Contabilidades: ["contador", "contabilidade", "escritório contábil"],
  "Empresas de software": ["software", "desenvolvimento", "TI"],
  "Assistência técnica de informática": ["informática", "conserto de computador", "suporte"],
  "Pet shops": ["pet shop", "petshop", "banho e tosa"],
  Escolas: ["escola", "colégio", "ensino"],
  Autoescolas: ["autoescola", "cnh", "cfc"],
  "Empresas de limpeza": ["limpeza", "conservação", "faxina"],
  Dedetizadoras: ["dedetização", "controle de pragas"],
  "Ar-condicionado": ["ar condicionado", "climatização", "refrigeração"],
  Transportadoras: ["transportadora", "frete", "logística"],
  Hotéis: ["hotel", "hospedagem"],
  Metalúrgicas: ["metalúrgica", "metalurgia", "serralheria industrial"],
  Agropecuárias: ["agropecuária", "agro", "insumos"],
  "Energia solar": ["energia solar", "painel solar", "fotovoltaico"],
};

const TAXONOMIA: Record<string, string[]> = {
  Saúde: [
    "Clínicas odontológicas",
    "Dentistas",
    "Clínicas médicas",
    "Clínicas de estética",
    "Fisioterapia",
    "Psicologia",
    "Nutrição",
    "Fonoaudiologia",
    "Oftalmologia",
    "Dermatologia",
    "Ortopedia",
    "Pediatria",
    "Ginecologia",
    "Cardiologia",
    "Laboratórios",
    "Centros de diagnóstico",
    "Farmácias",
    "Drogarias",
    "Veterinárias",
    "Hospitais veterinários",
    "Óticas",
  ],
  "Beleza e bem-estar": [
    "Salões de beleza",
    "Barbearias",
    "Esmalterias",
    "Manicure e pedicure",
    "Spas",
    "Massoterapia",
    "Academias",
    "CrossFit",
    "Pilates",
    "Yoga",
    "Personal trainers",
  ],
  Alimentação: [
    "Restaurantes",
    "Pizzarias",
    "Hamburguerias",
    "Lanchonetes",
    "Padarias",
    "Confeitarias",
    "Cafeterias",
    "Sorveterias",
    "Açaiterias",
    "Churrascarias",
    "Marmitarias",
    "Buffets",
    "Docerias",
    "Bares",
    "Distribuidoras de alimentos",
    "Mercados",
    "Supermercados",
    "Hortifrutis",
    "Açougues",
  ],
  Automotivo: [
    "Oficinas mecânicas",
    "Autopeças",
    "Centros automotivos",
    "Funilarias",
    "Pintura automotiva",
    "Autoelétricas",
    "Borracharias",
    "Lojas de pneus",
    "Lava-rápidos",
    "Estética automotiva",
    "Concessionárias",
    "Revendas de veículos",
    "Motocicletas",
    "Oficinas de motos",
    "Guinchos",
    "Locadoras de veículos",
  ],
  "Construção e imóveis": [
    "Construtoras",
    "Incorporadoras",
    "Imobiliárias",
    "Corretores de imóveis",
    "Arquitetura",
    "Engenharia civil",
    "Empreiteiras",
    "Reformas",
    "Pintores",
    "Eletricistas",
    "Encanadores",
    "Vidraçarias",
    "Serralherias",
    "Marcenarias",
    "Marmorarias",
    "Gesso e drywall",
    "Materiais de construção",
    "Madeireiras",
    "Lojas de tintas",
    "Pisos e revestimentos",
    "Esquadrias",
    "Energia solar",
    "Piscinas",
  ],
  "Serviços profissionais": [
    "Contabilidades",
    "Escritórios de advocacia",
    "Consultorias empresariais",
    "Corretoras de seguros",
    "Despachantes",
    "Administradoras de condomínios",
    "Recursos humanos",
    "Recrutamento",
    "Tradução",
    "Marketing",
    "Agências de publicidade",
    "Agências digitais",
    "Fotografia",
    "Produtoras de vídeo",
    "Gráficas",
  ],
  Tecnologia: [
    "Empresas de software",
    "Assistência técnica de informática",
    "Lojas de informática",
    "Manutenção de computadores",
    "Telecomunicações",
    "Segurança eletrônica",
    "Automação comercial",
    "Provedores de internet",
  ],
  Comércio: [
    "Lojas de roupas",
    "Calçados",
    "Moda feminina",
    "Moda masculina",
    "Moda infantil",
    "Joalherias",
    "Relojoarias",
    "Lojas de presentes",
    "Papelarias",
    "Livrarias",
    "Floriculturas",
    "Pet shops",
    "Lojas de móveis",
    "Colchões",
    "Eletrodomésticos",
    "Eletrônicos",
    "Celulares",
    "Utilidades domésticas",
    "Decoração",
    "Iluminação",
  ],
  Educação: [
    "Escolas",
    "Escolas particulares",
    "Escolas infantis",
    "Creches",
    "Cursos profissionalizantes",
    "Escolas de idiomas",
    "Escolas de música",
    "Autoescolas",
    "Reforço escolar",
    "Faculdades",
    "Cursos preparatórios",
  ],
  "Casa e serviços": [
    "Empresas de limpeza",
    "Dedetizadoras",
    "Controle de pragas",
    "Jardinagem",
    "Paisagismo",
    "Mudanças",
    "Fretes",
    "Chaveiros",
    "Assistência técnica",
    "Refrigeração",
    "Ar-condicionado",
    "Manutenção residencial",
    "Segurança",
    "Monitoramento",
    "Portaria",
  ],
  Eventos: [
    "Casas de festas",
    "Cerimonial",
    "Decoração de festas",
    "Fotógrafos",
    "Filmagem",
    "DJs",
    "Som e iluminação",
    "Locação de equipamentos",
    "Espaços para eventos",
  ],
  "Turismo e hospedagem": [
    "Hotéis",
    "Pousadas",
    "Hostels",
    "Agências de turismo",
    "Operadoras de turismo",
    "Transporte turístico",
    "Aluguel por temporada",
  ],
  "Transporte e logística": [
    "Transportadoras",
    "Logística",
    "Motoboys",
    "Entregas",
    "Táxi",
    "Transporte executivo",
    "Estacionamentos",
  ],
  "Indústria e B2B": [
    "Indústrias",
    "Distribuidoras",
    "Atacadistas",
    "Metalúrgicas",
    "Usinagem",
    "Embalagens",
    "Plásticos",
    "Uniformes",
    "Equipamentos industriais",
    "Máquinas e equipamentos",
    "Manutenção industrial",
    "EPIs",
    "Ferramentas",
  ],
  Agronegócio: [
    "Agropecuárias",
    "Lojas agrícolas",
    "Máquinas agrícolas",
    "Implementos agrícolas",
    "Veterinária rural",
    "Rações",
    "Insumos agrícolas",
    "Irrigação",
  ],
};

export const NICHE_CATEGORIES: string[] = Object.keys(TAXONOMIA);

export const NICHES: Niche[] = NICHE_CATEGORIES.flatMap((category) =>
  (TAXONOMIA[category] ?? []).map((label) => ({
    id: slug(label),
    label,
    category,
    searchTerms: [label, ...(SINONIMOS[label] ?? [])],
  })),
);

const POR_ID = new Map(NICHES.map((n) => [n.id, n]));

export function buscarNichoPorId(id: string): Niche | undefined {
  return POR_ID.get(id);
}

export function buscarNichoPorLabel(label: string): Niche | undefined {
  const alvo = normalizarTexto(label);
  return NICHES.find((n) => normalizarTexto(n.label) === alvo);
}

/** Índice de pesquisa pré-computado (label + categoria + sinônimos, sem acento). */
const INDICE = NICHES.map((n) => ({
  niche: n,
  haystack: normalizarTexto([n.label, n.category, ...n.searchTerms].join(" ")),
}));

export function filtrarNichos(termo: string): Niche[] {
  const alvo = normalizarTexto(termo);
  if (!alvo) return NICHES;
  const palavras = alvo.split(/\s+/).filter(Boolean);
  return INDICE.filter((item) => palavras.every((p) => item.haystack.includes(p))).map(
    (i) => i.niche,
  );
}

/**
 * Ordem round-robin entre categorias para a opção "Todos os nichos":
 * pega o 1º nicho de cada categoria, depois o 2º, e assim por diante.
 */
export function planoTodosOsNichos(): Niche[] {
  const porCategoria = NICHE_CATEGORIES.map((c) => NICHES.filter((n) => n.category === c));
  const maior = Math.max(...porCategoria.map((l) => l.length));
  const plano: Niche[] = [];
  for (let i = 0; i < maior; i++) {
    for (const lista of porCategoria) {
      const item = lista[i];
      if (item) plano.push(item);
    }
  }
  return plano;
}
