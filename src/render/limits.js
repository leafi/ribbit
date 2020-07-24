// tile spritesheet is TILE_SHEET_LENGTH x TILE_SHEET_LENGTH px
export const TILE_SHEET_LENGTH = 2048
// so, with 16-bit color, that's 8 MiB VRAM

// fixed tile size is 16 x 16 px
export const TILE_LENGTH = 16

// how many tiles fit in the spritesheet lengthways? (128)
export const TILES_PER_SHEET_LENGTH = (TILE_SHEET_LENGTH / TILE_LENGTH) | 0

// how many tiles fit in the spritesheet? (128*128 == 16,384)
export const MAX_TILES = 16384

// how many tiles fit in a tile id texture, lengthways? (32)
export const RCHUNK_LENGTH_IN_TILES = 32

export const TILE_WORLD_ROW_STRIDE = (1 << 24) | 0

export const TILE_WORLD_CHUNK_ROW_STRIDE = (TILE_WORLD_ROW_STRIDE / RCHUNK_LENGTH_IN_TILES) | 0

// 'x == 0' is actually half way through the row, so we have -ve space
export const TILE_WORLD_X_OFFSET = (1 << 23) | 0

export const TILE_WORLD_MIN_X = -TILE_WORLD_X_OFFSET
export const TILE_WORLD_MAX_X = TILE_WORLD_X_OFFSET - 1
