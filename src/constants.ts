// NES Super Mario Bros. Constants & Physics Specifications

export const CANVAS_WIDTH = 256;
export const CANVAS_HEIGHT = 240;
export const TILE_SIZE = 16;

// Physics constants (tuned to match 60Hz NES Super Mario Bros 1)
export const GRAVITY = 0.44;              // Normal downward gravity
export const JUMP_GRAVITY = 0.22;         // Reduced gravity while holding jump button
export const TERMINAL_VELOCITY = 4.5;

// Horizontal speeds (pixels per frame)
export const WALK_ACCEL = 0.09;
export const RUN_ACCEL = 0.14;
export const WALK_MAX_SPEED = 1.5;
export const RUN_MAX_SPEED = 2.56;
export const FRICTION = 0.07;
export const SKID_DECEL = 0.18;

// Jump impulse
export const JUMP_IMPULSE_WALK = -4.2;
export const JUMP_IMPULSE_RUN = -4.8;
export const JUMP_HOLD_MAX_FRAMES = 16;
export const STOMP_BOUNCE_IMPULSE = -3.2;

// Shell physics
export const SHELL_SPEED = 3.2;

// Tile types
export enum TileType {
  EMPTY = 0,
  GROUND = 1,
  BRICK = 2,
  QUESTION_COIN = 3,
  QUESTION_MUSHROOM = 4,
  QUESTION_STAR = 5,
  SOLID_BLOCK = 6,
  PIPE_TOP_LEFT = 7,
  PIPE_TOP_RIGHT = 8,
  PIPE_BODY_LEFT = 9,
  PIPE_BODY_RIGHT = 10,
  PIPE_ENTER_TOP_LEFT = 11, // Leads underground
  PIPE_ENTER_TOP_RIGHT = 12,
  FLAG_POLE = 13,
  FLAG_TOP = 14,
  CASTLE_BRICK = 15,
  CASTLE_DOOR = 16,
  CASTLE_BATTLEMENT = 17,
  EMPTY_BLOCK = 18, // Hit question block
  HIDDEN_1UP = 19,
  COIN = 20,
  BRICK_MULTICOIN = 21,
}

// Game states
export enum GameState {
  TITLE = 0,
  START_SCREEN = 1,
  PLAYING = 2,
  MARIO_GROWING = 3,
  MARIO_SHRINKING = 4,
  MARIO_DYING = 5,
  FLAGPOLE_SLIDE = 6,
  CASTLE_WALK = 7,
  LEVEL_CLEAR = 8,
  GAME_OVER = 9,
  PAUSED = 10,
}

// Mario forms
export enum MarioForm {
  SMALL = 0,
  SUPER = 1,
  FIRE = 2,
}

// Playable character
export enum Character {
  MARIO = 0,
  LUIGI = 1,
}
