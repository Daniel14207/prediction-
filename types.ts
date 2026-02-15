
export enum Screen {
  SPLASH = 'SPLASH',
  LOGIN = 'LOGIN',
  ACTIVATION = 'ACTIVATION',
  WELCOME = 'WELCOME',
  MAIN_MENU = 'MAIN_MENU',
  AVIATOR = 'AVIATOR',
  FOOTBALL = 'FOOTBALL',
  ROULETTE = 'ROULETTE',
  CHAT = 'CHAT',
  SCANNER = 'SCANNER',
  VEO = 'VEO',
  EDITOR = 'EDITOR'
}

export interface Sphere {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  vx: number;
  vy: number;
}

export interface AviatorSignal {
  cotes: string;
  heure: string;
}

export interface FootballMatch {
  home: string;
  away: string;
  prediction: string;
}

export interface FootballGroup {
  matches: FootballMatch[];
}
