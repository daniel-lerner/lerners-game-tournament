
import { Game } from './types';

export const DEFAULT_GAMES: Game[] = [
  {
    id: 'ek',
    name: 'Exploding Kittens',
    scoring: {
      3: { 1: 10 },
      4: { 1: 12 },
      5: { 1: 15 }
    }
  },
  {
    id: 'hg',
    name: 'Halli Galli',
    scoring: {
      4: { 1: 10 },
      5: { 1: 12 },
      6: { 1: 15 }
    }
  },
  {
    id: 'so',
    name: 'Saco de Ossos',
    scoring: {
      2: { 1: 3 }
    }
  },
  {
    id: 'fm',
    name: 'Futebol de Moeda',
    scoring: {
      2: { 1: 3 }
    }
  },
  {
    id: 'cp',
    name: 'Coup',
    scoring: {
      4: { 1: 20 },
      5: { 1: 22 },
      6: { 1: 25 }
    }
  },
  {
    id: 'ttr',
    name: 'Ticket to Ride',
    scoring: {
      3: { 1: 60, 2: 30, 3: 20 },
      4: { 1: 70, 2: 35, 3: 23 },
      5: { 1: 80, 2: 40, 3: 26 }
    }
  },
  {
    id: 'kot',
    name: 'King of Tokyo',
    scoring: {
      6: { 1: 80, 2: 40, 3: 26 },
      7: { 1: 90, 2: 45, 3: 30 },
      8: { 1: 100, 2: 50, 3: 33 }
    }
  },
  {
    id: 'pt',
    name: 'Paper Town',
    scoring: {
      3: { 1: 40, 2: 20, 3: 0 },
      4: { 1: 50, 2: 25, 3: 13 }
    }
  },
  {
    id: 'qz',
    name: 'Quartz',
    scoring: {
      3: { 1: 40, 2: 20, 3: 0 },
      4: { 1: 50, 2: 25, 3: 13 }
    }
  },
  {
    id: 'ab',
    name: 'Abstratus',
    scoring: {
      3: { 1: 40, 2: 20, 3: 0 },
      4: { 1: 50, 2: 25, 3: 13 }
    }
  },
  {
    id: 'im',
    name: 'Imagine',
    scoring: {
      6: { 1: 40, 2: 20, 3: 13 },
      7: { 1: 50, 2: 25, 3: 16 },
      8: { 1: 60, 2: 30, 3: 20 }
    }
  },
  {
    id: 'dx',
    name: 'Dixit',
    scoring: {
      6: { 1: 40, 2: 20, 3: 13 },
      7: { 1: 50, 2: 25, 3: 16 },
      8: { 1: 60, 2: 30, 3: 20 }
    }
  },
  {
    id: 'tu',
    name: 'Times Up',
    isPlusRule: true,
    scoring: {
      4: { 1: 30 }
    }
  },
  {
    id: 'mf',
    name: 'Mille Fiori',
    scoring: {
      4: { 1: 100, 2: 50, 3: 33 }
    }
  },
  {
    id: '7w',
    name: '7 Wonders',
    scoring: {
      5: { 1: 70, 2: 35, 3: 23 },
      6: { 1: 85, 2: 42, 3: 28 },
      7: { 1: 100, 2: 50, 3: 33 }
    }
  }
];
