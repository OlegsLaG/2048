export interface Grid { coordinate: { x: number, y: number } }

export interface ActiveCellType {
  id: string
  coordinate: {
    x: number,
    y: number,
  },
  value: number,
  style?: {
    transform: string,
  },
  prev_coordinate?: {
    x: number,
    y: number,
  },
  grid_size?: number,
  grid_gap?: number,
  is_merged?: boolean,
}

export const Direction = {
  ArrowUp: 'MOVE_UP',
  ArrowRight: 'MOVE_RIGHT',
  ArrowDown: 'MOVE_DOWN',
  ArrowLeft: 'MOVE_LEFT',
} as const;
