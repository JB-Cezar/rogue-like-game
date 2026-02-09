const DATA = {
    heroes: [
        {
            id: 'guerreiro',
            name: 'Guerreiro',
            img: 'img/jogadores/guerreiro.png',
            hp: 150,
            maxHp: 150,
            atk: 15,
            def: 10,
            speed: 5,
            desc: 'Alta vida e defesa. Um tanque natural.'
        },
        {
            id: 'mago',
            name: 'Mago',
            img: 'img/jogadores/mago.png',
            hp: 80,
            maxHp: 80,
            atk: 25,
            def: 3,
            speed: 8,
            desc: 'Poder destrutivo, mas frágil.'
        },
        {
            id: 'arqueira',
            name: 'Arqueira',
            img: 'img/jogadores/arqueira.png',
            hp: 100,
            maxHp: 100,
            atk: 20,
            def: 5,
            speed: 12,
            desc: 'Rápida e letal a distância.'
        },
        {
            id: 'druida',
            name: 'Druida',
            img: 'img/jogadores/druida.png',
            hp: 120,
            maxHp: 120,
            atk: 12,
            def: 8,
            speed: 6,
            desc: 'Guerreiro da natureza balanceado.'
        },
        {
            id: 'ladino',
            name: 'Ladino',
            img: 'img/jogadores/ladino.png',
            hp: 90,
            maxHp: 90,
            atk: 22,
            def: 4,
            speed: 15,
            desc: 'Mestre da esquiva e ataques surpresa.'
        }
    ],
    monsters: {
        easy: [
            { name: 'Slime', img: 'img/monstros/monstro aquatico.png', hp: 30, atk: 5, xp: 10 },
            { name: 'Zumbi', img: 'img/monstros/zombie.png', hp: 40, atk: 8, xp: 15 },
            { name: 'Diabrete', img: 'img/monstros/demoniozinho.png', hp: 35, atk: 10, xp: 18 }
        ],
        medium: [
            { name: 'Orc', img: 'img/monstros/orc.png', hp: 80, atk: 15, xp: 40 },
            { name: 'Golem de Barro', img: 'img/monstros/golem de barro.png', hp: 100, atk: 12, xp: 45 },
            { name: 'Pé Grande', img: 'img/monstros/pe grande.png', hp: 90, atk: 18, xp: 50 }
        ],
        hard: [
            { name: 'Gárgula', img: 'img/monstros/gargola.png', hp: 150, atk: 20, xp: 80 },
            { name: 'Ciclope', img: 'img/monstros/ciclope.png', hp: 200, atk: 25, xp: 100 },
            { name: 'Golem de Pedra', img: 'img/monstros/golem de pedra.png', hp: 250, atk: 18, xp: 90 }
        ],
        boss: [
            { name: 'Dragão Vermelho', img: 'img/monstros/dragão vermelho.png', hp: 500, atk: 40, xp: 500 },
            { name: 'Cthulhu', img: 'img/monstros/cthulhu.png', hp: 666, atk: 50, xp: 666 },
            { name: 'Demônio Maior', img: 'img/monstros/demonio.png', hp: 450, atk: 45, xp: 450 }
        ]
    },
    dungeons: [
        { id: 1, name: 'Caverna Úmida', rooms: 5, difficulty: 'easy', boss: 'easy' }, // Boss easy para teste rapido ou intro
        { id: 2, name: 'floresta Sombria', rooms: 8, difficulty: 'medium', boss: 'medium' },
        { id: 3, name: 'Torre do Esquecimento', rooms: 12, difficulty: 'hard', boss: 'hard' },
        { id: 4, name: 'Abismo Infernal', rooms: 15, difficulty: 'hard', boss: 'boss' }
    ]
};
