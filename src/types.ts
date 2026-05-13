/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Color = 'yellow' | 'green' | 'red' | 'blue' | 'purple' | 'orange' | 'pink' | 'cyan' | 'white' | 'black' | 'silver';

export type VehicleType = 'matatu' | 'bus' | 'tuk-tuk' | 'boda-boda' | 'taxi' | 'truck' | 'bicycle' | 'lorry' | 'suv' | 'probox' | 'hilux' | 'canter' | 'ambulance';

export interface Highway {
  name: string;
  color: string;
  speedMultiplier: number;
}

export const HIGHWAYS: Highway[] = [
  { name: "Thika Superhighway", color: "#334155", speedMultiplier: 1 },
  { name: "Mombasa Road", color: "#475569", speedMultiplier: 1.1 },
  { name: "Ngong Road", color: "#1e293b", speedMultiplier: 1.2 },
  { name: "Waiyaki Way", color: "#334155", speedMultiplier: 1.3 },
  { name: "Nairobi Expressway", color: "#0f172a", speedMultiplier: 1.5 },
];

export interface Vehicle {
  id: string;
  lane: number;
  y: number; // percentage from top
  color: Color;
  type: VehicleType;
  speed: number;
}

export interface PowerUp {
  id: string;
  lane: number;
  y: number;
  type: 'nitro';
}

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export interface DifficultySettings {
  initialSpeed: number;
  speedIncrement: number;
  spawnRate: number;
  maxVehicles: number;
}

export const DIFFICULTY_CONFIG: Record<DifficultyLevel, DifficultySettings> = {
  Easy: {
    initialSpeed: 0.25,
    speedIncrement: 0.00005,
    spawnRate: 2000,
    maxVehicles: 4,
  },
  Medium: {
    initialSpeed: 0.35,
    speedIncrement: 0.0001,
    spawnRate: 1500,
    maxVehicles: 6,
  },
  Hard: {
    initialSpeed: 0.45,
    speedIncrement: 0.00015,
    spawnRate: 1000,
    maxVehicles: 8,
  },
};

export const LANES = 3;
export const ROAD_HEIGHT = 100; // 100%

export const COLORS: Record<Color, string> = {
  yellow: '#FFD700', // Taxi Yellow
  green: '#008751',  // Kenyan Flag Green
  red: '#BB0A1E',    // Kenyan Flag Red
  blue: '#005EB8',   // Matatu Blue
  purple: '#800080',
  orange: '#FF8C00',
  pink: '#FF69B4',
  cyan: '#00FFFF',
  white: '#FFFFFF',
  black: '#000000',
  silver: '#C0C0C0',
};
