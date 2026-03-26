export const EventList = {
  GAME_OVER: 'game_over',
  GAME_WON: 'game_won',
  NEW_GAME: 'new_game',
  MOVE_UP: 'move_up',
  MOVE_DOWN: 'move_down',
  MOVE_LEFT: 'move_left',
  MOVE_RIGHT: 'move_right',
} as const;

export type phases = 'idle' | 'moving' | 'merging';
