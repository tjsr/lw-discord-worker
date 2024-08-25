export type ItemRarity = "UR" | "SSR" | "SR" | "R";
export type HeroType = "Tank" | "Aircraft" | "Missile";
export type HeroRole = "Damage" | "Tank" | "Support";

export interface Hero {
  name: string;
  type: HeroType;
  rarity: ItemRarity;
  role: HeroRole;
}

export const defaultHeroList: Hero[] = [
  { name: "Murphy", type: "Tank", rarity: "UR", role: "Tank" },
  { name: "Kimberly", type: "Tank", rarity: "UR", role: "Damage" },
  { name: "Marshall", type: "Tank", rarity: "UR", role: "Support" },
  { name: "Carlie", type: "Aircraft", rarity: "UR", role: "Tank" },
  { name: "Dva", type: "Aircraft", rarity: "UR", role: "Damage" },
  { name: "Schuyler", type: "Aircraft", rarity: "UR", role: "Damage" },
  { name: "Tesla", type: "Missile", rarity: "UR", role: "Damage" },
  { name: "Swift", type: "Missile", rarity: "UR", role: "Damage" },
  { name: "Williams", type: "Tank", rarity: "UR", role: "Tank" },
  { name: "Stetmann", type: "Tank", rarity: "UR", role: "Damage" },
  { name: "Morrison", type: "Aircraft", rarity: "UR", role: "Damage" },
  { name: "Lucius", type: "Aircraft", rarity: "UR", role: "Tank" },
  { name: "Fiona", type: "Missile", rarity: "UR", role: "Damage" },
  { name: "McGregor", type: "Missile", rarity: "UR", role: "Tank" },
  { name: "Adam", type: "Missile", rarity: "UR", role: "Tank" },

  { name: "Violet", type: "Tank", rarity: "SSR", role: "Tank" },
  { name: "Mason", type: "Tank", rarity: "SSR", role: "Damage" },
  { name: "Scarlett", type: "Tank", rarity: "SSR", role: "Tank" },
  { name: "Maxwell", type: "Aircraft", rarity: "SSR", role: "Damage" },
  { name: "Sarah", type: "Aircraft", rarity: "SSR", role: "Support" },
  { name: "Monica", type: "Tank", rarity: "SSR", role: "Support" },
  { name: "Elsa", type: "Missile", rarity: "SSR", role: "Tank" },
  { name: "Venom", type: "Missile", rarity: "SSR", role: "Damage" },
  { name: "Farhad", type: "Tank", rarity: "SSR", role: "Damage" },
  { name: "Braz", type: "Missile", rarity: "SSR", role: "Damage" },
  { name: "Cage", type: "Aircraft", rarity: "SSR", role: "Tank" },
  { name: "Richard", type: "Tank", rarity: "SSR", role: "Damage" },

  { name: "Loki", type: "Tank", rarity: "SR", role: "Tank" },
  { name: "Ambolt", type: "Aircraft", rarity: "SR", role: "Damage" },
  { name: "Gump", type: "Tank", rarity: "SR", role: "Tank" },
  { name: "Kane", type: "Missile", rarity: "SR", role: "Damage" }
];
