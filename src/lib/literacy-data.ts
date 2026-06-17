// Dados educacionais para alfabetização infantil (pt-BR)

export interface LetterData {
  letter: string;
  lower: string;
  word: string;
  emoji: string;
  color: string;
}

// Alfabeto completo com palavra e emoji associados
export const ALPHABET: LetterData[] = [
  { letter: "A", lower: "a", word: "Abacaxi", emoji: "🍍", color: "#FF6B6B" },
  { letter: "B", lower: "b", word: "Bola", emoji: "⚽", color: "#4ECDC4" },
  { letter: "C", lower: "c", word: "Casa", emoji: "🏠", color: "#FFE66D" },
  { letter: "D", lower: "d", word: "Dado", emoji: "🎲", color: "#95E1D3" },
  { letter: "E", lower: "e", word: "Estrela", emoji: "⭐", color: "#FFA07A" },
  { letter: "F", lower: "f", word: "Flor", emoji: "🌸", color: "#F38181" },
  { letter: "G", lower: "g", word: "Gato", emoji: "🐱", color: "#AA96DA" },
  { letter: "H", lower: "h", word: "Helicóptero", emoji: "🚁", color: "#C7CEEA" },
  { letter: "I", lower: "i", word: "Iglu", emoji: "🛖", color: "#FFD93D" },
  { letter: "J", lower: "j", word: "Jacaré", emoji: "🐊", color: "#6BCB77" },
  { letter: "K", lower: "k", word: "Kiwi", emoji: "🥝", color: "#FF9F68" },
  { letter: "L", lower: "l", word: "Leão", emoji: "🦁", color: "#FFB7B2" },
  { letter: "M", lower: "m", word: "Maçã", emoji: "🍎", color: "#FF6B9D" },
  { letter: "N", lower: "n", word: "Navio", emoji: "🚢", color: "#4D96FF" },
  { letter: "O", lower: "o", word: "Olho", emoji: "👁️", color: "#6C5CE7" },
  { letter: "P", lower: "p", word: "Patinho", emoji: "🦆", color: "#FDCB6E" },
  { letter: "Q", lower: "q", word: "Queijo", emoji: "🧀", color: "#FFEAA7" },
  { letter: "R", lower: "r", word: "Rosa", emoji: "🌹", color: "#E84393" },
  { letter: "S", lower: "s", word: "Sol", emoji: "☀️", color: "#FDCB6E" },
  { letter: "T", lower: "t", word: "Trem", emoji: "🚂", color: "#74B9FF" },
  { letter: "U", lower: "u", word: "Uva", emoji: "🍇", color: "#A29BFE" },
  { letter: "V", lower: "v", word: "Violão", emoji: "🎸", color: "#FD79A8" },
  { letter: "W", lower: "w", word: "Web", emoji: "🌐", color: "#00CEC9" },
  { letter: "X", lower: "x", word: "Xícara", emoji: "☕", color: "#D63031" },
  { letter: "Y", lower: "y", word: "Ioga", emoji: "🧘", color: "#0984E3" },
  { letter: "Z", lower: "z", word: "Zebra", emoji: "🦓", color: "#2D3436" },
];

// Palavras para o jogo Monta Palavras (por dificuldade)
export interface WordItem {
  word: string;
  emoji: string;
  syllables: number;
  hint: string;
}

export const WORDS_EASY: WordItem[] = [
  { word: "GATO", emoji: "🐱", syllables: 2, hint: "Mia para você!" },
  { word: "SOL", emoji: "☀️", syllables: 1, hint: "Brilha no céu!" },
  { word: "BOLA", emoji: "⚽", syllables: 2, hint: "Usamos para brincar!" },
  { word: "CASA", emoji: "🏠", syllables: 2, hint: "Onde moramos!" },
  { word: "FLOR", emoji: "🌸", syllables: 1, hint: "Fica no jardim!" },
  { word: "PATO", emoji: "🦆", syllables: 2, hint: "Quack quack!" },
  { word: "MÃE", emoji: "👩", syllables: 1, hint: "Cuida de você!" },
  { word: "PÃO", emoji: "🍞", syllables: 1, hint: "Comemos no café!" },
];

export const WORDS_MEDIUM: WordItem[] = [
  { word: "ELEFANTE", emoji: "🐘", syllables: 4, hint: "Tem tromba!" },
  { word: "GIRASSOL", emoji: "🌻", syllables: 3, hint: "Segue o sol!" },
  { word: "JACARÉ", emoji: "🐊", syllables: 3, hint: "Vive no rio!" },
  { word: "BORBOLETA", emoji: "🦋", syllables: 4, hint: "Voa e é colorida!" },
  { word: "MORANGO", emoji: "🍓", syllables: 3, hint: "Fruta vermelha!" },
  { word: "GUITARRA", emoji: "🎸", syllables: 3, hint: "Instrumento musical!" },
];

export const WORDS_HARD: WordItem[] = [
  { word: "ABACAXI", emoji: "🍍", syllables: 4, hint: "Fruta tropical espinhosa!" },
  { word: "BICICLETA", emoji: "🚲", syllables: 4, hint: "Tem duas rodas!" },
  { word: "ESCOLA", emoji: "🏫", syllables: 3, hint: "Onde aprendemos!" },
  { word: "MORCEGO", emoji: "🦇", syllables: 3, hint: "Voa de noite!" },
  { word: "CHUVEIRO", emoji: "🚿", syllables: 3, hint: "Tomamos banho!" },
  { word: "PINGUIM", emoji: "🐧", syllables: 3, hint: "Vive no gelo!" },
];

export const ALL_WORDS = [...WORDS_EASY, ...WORDS_MEDIUM, ...WORDS_HARD];

// Palavras para o jogo de Sílabas (organizadas por nº de sílabas)
export interface SyllableWord {
  word: string;
  emoji: string;
  syllables: number;
  syllableBreakdown: string[];
}

export const SYLLABLE_WORDS: SyllableWord[] = [
  { word: "SOL", emoji: "☀️", syllables: 1, syllableBreakdown: ["SOL"] },
  { word: "FLOR", emoji: "🌸", syllables: 1, syllableBreakdown: ["FLOR"] },
  { word: "PÃO", emoji: "🍞", syllables: 1, syllableBreakdown: ["PÃO"] },
  { word: "GATO", emoji: "🐱", syllables: 2, syllableBreakdown: ["GA", "TO"] },
  { word: "BOLA", emoji: "⚽", syllables: 2, syllableBreakdown: ["BO", "LA"] },
  { word: "CASA", emoji: "🏠", syllables: 2, syllableBreakdown: ["CA", "SA"] },
  { word: "PATO", emoji: "🦆", syllables: 2, syllableBreakdown: ["PA", "TO"] },
  { word: "LEAO", emoji: "🦁", syllables: 2, syllableBreakdown: ["LE", "ÃO"] },
  { word: "GIRASSOL", emoji: "🌻", syllables: 3, syllableBreakdown: ["GI", "RA", "SOL"] },
  { word: "JACARE", emoji: "🐊", syllables: 3, syllableBreakdown: ["JA", "CA", "RÉ"] },
  { word: "MORANGO", emoji: "🍓", syllables: 3, syllableBreakdown: ["MO", "RAN", "GO"] },
  { word: "ELEFANTE", emoji: "🐘", syllables: 4, syllableBreakdown: ["E", "LE", "FAN", "TE"] },
  { word: "BORBOLETA", emoji: "🦋", syllables: 4, syllableBreakdown: ["BOR", "BO", "LE", "TA"] },
  { word: "BICICLETA", emoji: "🚲", syllables: 4, syllableBreakdown: ["BI", "CI", "CLE", "TA"] },
];

// Palavras para o jogo "Qual é a Letra?" (identificar inicial)
export const INITIAL_LETTER_WORDS: WordItem[] = [
  { word: "ARCO-ÍRIS", emoji: "🌈", syllables: 3, hint: "A" },
  { word: "BALÃO", emoji: "🎈", syllables: 2, hint: "B" },
  { word: "CARRO", emoji: "🚗", syllables: 2, hint: "C" },
  { word: "DINOSSAURO", emoji: "🦕", syllables: 4, hint: "D" },
  { word: "ELEFANTE", emoji: "🐘", syllables: 4, hint: "E" },
  { word: "FOCA", emoji: "🦭", syllables: 2, hint: "F" },
  { word: "GIRAFA", emoji: "🦒", syllables: 3, hint: "G" },
  { word: "HIPOPÓTAMO", emoji: "🦛", syllables: 5, hint: "H" },
  { word: "ILHA", emoji: "🏝️", syllables: 2, hint: "I" },
  { word: "JANELA", emoji: "🪟", syllables: 3, hint: "J" },
  { word: "KIWI", emoji: "🥝", syllables: 2, hint: "K" },
  { word: "LUA", emoji: "🌙", syllables: 2, hint: "L" },
  { word: "MACACO", emoji: "🐵", syllables: 3, hint: "M" },
  { word: "NUVEM", emoji: "☁️", syllables: 2, hint: "N" },
  { word: "OVELHA", emoji: "🐑", syllables: 3, hint: "O" },
  { word: "PIPOCA", emoji: "🍿", syllables: 3, hint: "P" },
  { word: "QUEIJO", emoji: "🧀", syllables: 2, hint: "Q" },
  { word: "RAPOSA", emoji: "🦊", syllables: 3, hint: "R" },
  { word: "SAPATO", emoji: "👟", syllables: 3, hint: "S" },
  { word: "TARTARUGA", emoji: "🐢", syllables: 4, hint: "T" },
  { word: "UVA", emoji: "🍇", syllables: 2, hint: "U" },
  { word: "VIOLÃO", emoji: "🎸", syllables: 3, hint: "V" },
  { word: "WIFI", emoji: "📶", syllables: 2, hint: "W" },
  { word: "XADREZ", emoji: "♟️", syllables: 2, hint: "X" },
  { word: "IOGURTE", emoji: "🥛", syllables: 3, hint: "Y" },
  { word: "ZEBRA", emoji: "🦓", syllables: 2, hint: "Z" },
];

export const GAME_LIST = [
  { id: "abc", name: "ABC Vivo", emoji: "🔠", color: "#FF6B6B", description: "Conheça as letras com sons e imagens!" },
  { id: "words", name: "Monta Palavras", emoji: "🧩", color: "#4ECDC4", description: "Arraste letras para formar palavras!" },
  { id: "complete", name: "Complete a Palavra", emoji: "📝", color: "#FFE66D", description: "Descubra qual letra está faltando!" },
  { id: "hunt", name: "Caça Letras", emoji: "🔍", color: "#95E1D3", description: "Encontre as letras escondidas!" },
  { id: "wordsearch", name: "Caça Palavras", emoji: "🆎", color: "#FFA07A", description: "Encontre as palavras na grade!" },
  { id: "draw", name: "Escreva a Letra", emoji: "✏️", color: "#F38181", description: "Escreva as letras na tela!" },
  { id: "memory", name: "Jogo da Memória", emoji: "🧠", color: "#AA96DA", description: "Encontre os pares maiúsculo/minúsculo!" },
  { id: "order", name: "Ordem Alfabética", emoji: "📚", color: "#C7CEEA", description: "Coloque as letras em ordem!" },
  { id: "syllables", name: "Sílabas", emoji: "👏", color: "#FFD93D", description: "Conte as sílabas batendo palmas!" },
  { id: "whatsletter", name: "Qual é a Letra?", emoji: "🎧", color: "#6BCB77", description: "Ouça a palavra e adivhe a primeira letra!" },
  { id: "bingo", name: "Bingo das Letras", emoji: "🎯", color: "#FF9F68", description: "Marque as letras na cartela!" },
] as const;

export type GameId = (typeof GAME_LIST)[number]["id"];
