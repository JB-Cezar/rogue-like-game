/**
 * gameData.js - Banco de Dados do Jogo
 * Contém todas as informações estáticas sobre itens, heróis, inimigos e habilidades.
 */
export const gameData = {
    // Definições de Armas
    weapons: {
        fists: { id: 'fists', name: 'Punhos', hitBonus: 0, minDmg: 1, maxDmg: 2, price: 0 },
        sword: { id: 'sword', name: 'Espada Curta', hitBonus: 2, minDmg: 6, maxDmg: 16, price: 50 },
        axe: { id: 'axe', name: 'Machado de Duas Mãos', hitBonus: 1, minDmg: 8, maxDmg: 18, price: 55 },
        staff: { id: 'staff', name: 'Cajado Arcano', hitBonus: 3, minDmg: 5, maxDmg: 15, price: 40 },
        bow: { id: 'bow', name: 'Arco Longo', hitBonus: 3, minDmg: 4, maxDmg: 20, price: 50 },
        dagger: { id: 'dagger', name: 'Adaga', hitBonus: 4, minDmg: 2, maxDmg: 8, price: 35 },
        club: { id: 'club', name: 'Porrete', hitBonus: 1, minDmg: 2, maxDmg: 4, price: 10 },
        // Itens exclusivos da Loja
        magic_sword: { id: 'magic_sword', name: 'Lâmina Rúnica', hitBonus: 4, minDmg: 16, maxDmg: 30, price: 400 },
        warhammer: { id: 'warhammer', name: 'Martelo de Guerra', hitBonus: 2, minDmg: 13, maxDmg: 23, price: 350 }
    },

    // Definições de Armaduras (AC = Classe de Armadura, reduz chance de ser atingido)
    armors: {
        none: { id: 'none', name: 'Sem Armadura', ac: 1, price: 0 },
        cloth: { id: 'cloth', name: 'Túnica', ac: 2, price: 20 },
        leather: { id: 'leather', name: 'Couro', ac: 4, price: 60 },
        chain: { id: 'chain', name: 'Cota de Malha', ac: 6, price: 150 },
        plate: { id: 'plate', name: 'Armadura Completa', ac: 8, price: 400 },
        mithril: { id: 'mithril', name: 'Armadura de Mithril', ac: 10, price: 900 }
    },

    // Itens consumíveis disponíveis na loja
    shopItems: [
        { name: 'Poção de Vida', type: 'heal', value: 50, price: 20, desc: 'Recupera 50 HP' },
        { name: 'Poção Grande', type: 'heal', value: 150, price: 60, desc: 'Recupera 150 HP' },
        { name: 'Bomba de Fogo', type: 'damage', value: 30, price: 100, desc: 'Explosão: 30 Dano Garantido' }
    ],

    // Modelos de Heróis jogáveis
    heroes: [
        {
            id: 'guerreiro',
            name: 'Guerreiro',
            img: 'img/jogadores/guerreiro.png',
            hp: 150,
            maxHp: 150,
            maxMp: 20,
            baseHit: 2,
            baseDmg: 0,
            weapon: 'sword',
            armor: 'chain',
            speed: 5,
            desc: 'Equilibrado. Espada e Cota de Malha.'
        },
        {
            id: 'barbaro',
            name: 'Bárbaro',
            img: 'img/jogadores/barbaro.png',
            hp: 200,
            maxHp: 200,
            maxMp: 10,
            baseHit: 2,
            baseDmg: 1,
            weapon: 'axe',
            armor: 'none',
            speed: 6,
            desc: 'Fúria incontrolável. Machado pesado e peito aberto.'
        },
        {
            id: 'mago',
            name: 'Mago',
            img: 'img/jogadores/mago.png',
            hp: 80,
            maxHp: 80,
            maxMp: 50,
            baseHit: 3,
            baseDmg: 0,
            weapon: 'staff',
            armor: 'cloth',
            speed: 8,
            desc: 'Frágil, mas preciso.'
        },
        {
            id: 'arqueira',
            name: 'Arqueira',
            img: 'img/jogadores/arqueira.png',
            hp: 100,
            maxHp: 100,
            maxMp: 30,
            baseHit: 4,
            baseDmg: 0,
            weapon: 'bow',
            armor: 'leather',
            speed: 12,
            desc: 'Mira letal.'
        },
        {
            id: 'druida',
            name: 'Druida',
            img: 'img/jogadores/druida.png',
            hp: 120,
            maxHp: 120,
            maxMp: 40,
            baseHit: 2,
            baseDmg: 0,
            weapon: 'club',
            armor: 'leather',
            speed: 6,
            desc: 'Protetor da floresta.'
        },
        {
            id: 'ladino',
            name: 'Ladino',
            img: 'img/jogadores/ladino.png',
            hp: 90,
            maxHp: 90,
            maxMp: 25,
            baseHit: 3,
            baseDmg: 0,
            weapon: 'dagger',
            armor: 'leather',
            speed: 15,
            desc: 'Mestre da esquiva.'
        }
    ],

    // Lista de Monstros dividida por dificuldade
    monsters: {
        easy: [
            { name: 'Slime', img: 'img/monstros/monstro aquatico.png', hp: 20, maxHp: 20, ac: 2, hitBonus: 1, minDmg: 1, maxDmg: 3, xp: 1 },
            { name: 'Zumbi', img: 'img/monstros/zombie.png', hp: 30, maxHp: 30, ac: 3, hitBonus: 2, minDmg: 2, maxDmg: 5, xp: 5 },
            { name: 'Diabrete', img: 'img/monstros/demoniozinho.png', hp: 25, maxHp: 25, ac: 4, hitBonus: 3, minDmg: 1, maxDmg: 4, xp: 8 }
        ],
        medium: [
            { name: 'Orc', img: 'img/monstros/orc.png', hp: 60, maxHp: 60, ac: 5, hitBonus: 4, minDmg: 4, maxDmg: 8, xp: 40 },
            { name: 'Golem de Barro', img: 'img/monstros/golem de barro.png', hp: 80, maxHp: 80, ac: 6, hitBonus: 3, minDmg: 5, maxDmg: 9, xp: 45 },
            { name: 'Pé Grande', img: 'img/monstros/pe grande.png', hp: 70, maxHp: 70, ac: 4, hitBonus: 5, minDmg: 6, maxDmg: 10, xp: 50 }
        ],
        hard: [
            { name: 'Gárgula', img: 'img/monstros/gargola.png', hp: 100, maxHp: 100, ac: 8, hitBonus: 6, minDmg: 5, maxDmg: 10, xp: 80 },
            { name: 'Ciclope', img: 'img/monstros/ciclope.png', hp: 150, maxHp: 150, ac: 5, hitBonus: 7, minDmg: 10, maxDmg: 20, xp: 100 },
            { name: 'Golem de Pedra', img: 'img/monstros/golem de pedra.png', hp: 200, maxHp: 200, ac: 9, hitBonus: 4, minDmg: 8, maxDmg: 12, xp: 90 }
        ],
        boss: [
            { name: 'Dragão Vermelho', img: 'img/monstros/dragão vermelho.png', hp: 400, maxHp: 400, ac: 8, hitBonus: 10, minDmg: 15, maxDmg: 25, xp: 500 },
            { name: 'Cthulhu', img: 'img/monstros/cthulhu.png', hp: 500, maxHp: 500, ac: 6, hitBonus: 12, minDmg: 20, maxDmg: 30, xp: 666 },
            { name: 'Demônio Maior', img: 'img/monstros/demonio.png', hp: 350, maxHp: 350, ac: 7, hitBonus: 9, minDmg: 12, maxDmg: 22, xp: 450 }
        ]
    },

    // Lista de Masmorras (Dungeons)
    dungeons: [
        { id: 1, name: 'Caverna Úmida', rooms: 5, difficulty: 'easy', boss: 'easy' },
        { id: 2, name: 'Floresta Sombria', rooms: 8, difficulty: 'medium', boss: 'medium' },
        { id: 3, name: 'Torre do Esquecimento', rooms: 12, difficulty: 'hard', boss: 'hard' },
        { id: 4, name: 'Abismo Infernal', rooms: 15, difficulty: 'hard', boss: 'boss' }
    ],

    // Níveis e Experiência necessária (obsoleto se usar fórmula dinâmica)
    levels: [
        { level: 1, xp: 0 },
        { level: 2, xp: 100 },
        { level: 3, xp: 250 },
        { level: 4, xp: 500 },
        { level: 5, xp: 800 },
        { level: 6, xp: 1200 },
        { level: 7, xp: 1700 },
        { level: 8, xp: 2300 },
        { level: 9, xp: 3000 },
        { level: 10, xp: 4000 }
    ],

    // Habilidades por Classe
    skills: {
        mago: [
            { id: 'raio', name: 'Raio Arcano', level: 1, type: 'damage', cost: 5, value: 15, desc: '15 Dano Fixo (Ignora AC)' },
            { id: 'escudo', name: 'Escudo Mágico', level: 2, type: 'buff', cost: 10, stat: 'ac', value: 5, duration: 3, desc: '+5 AC por 3 turnos' },
            { id: 'bola_fogo', name: 'Bola de Fogo', level: 3, type: 'damage', cost: 15, value: 30, desc: '30 Dano de Fogo' }
        ],
        guerreiro: [
            { id: 'golpe_forte', name: 'Golpe Pesado', level: 1, type: 'damage_mod', cost: 8, value: 1.5, desc: 'Ataque com 150% de Dano' },
            { id: 'grito', name: 'Grito de Guerra', level: 2, type: 'buff', cost: 12, stat: 'baseDmg', value: 3, duration: 4, desc: '+3 Dano Base por 4 turnos' }
        ],
        barbaro: [
            { id: 'furia', name: 'Fúria', level: 1, type: 'buff', cost: 0, stat: 'baseDmg', value: 2, duration: 3, desc: '+2 Dano, Custo 0' },
            { id: 'esmagar', name: 'Esmagar', level: 2, type: 'damage_mod', cost: 5, value: 2.0, desc: 'Ataque Duplo' }
        ],
        arqueira: [
            { id: 'tiro_preciso', name: 'Tiro Preciso', level: 1, type: 'damage', cost: 5, value: 12, desc: '12 Dano Garantido' },
            { id: 'tiro_rapido', name: 'Tiro Rápido', level: 2, type: 'damage_multi', cost: 10, count: 2, desc: 'Ataca 2 vezes' }
        ],
        druida: [
            { id: 'curar', name: 'Toque de Cura', level: 1, type: 'heal', cost: 8, value: 20, desc: 'Cura 20 HP' },
            { id: 'espinhos', name: 'Espinhos', level: 2, type: 'buff', cost: 10, stat: 'thorns', value: 5, duration: 3, desc: 'Inimigos levam 5 dano ao atacar' }
        ],
        ladino: [
            { id: 'veneno', name: 'Lâmina Venenosa', level: 1, type: 'buff', cost: 5, stat: 'poison_dmg', value: 3, duration: 3, desc: '+3 Dano Venenoso p/ atq' },
            { id: 'backstab', name: 'Apuhalada', level: 2, type: 'damage_mod', cost: 10, value: 2.5, desc: '250% Dano Crítico' }
        ]
    }
};

