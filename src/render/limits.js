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

// Tile worlds should largely be sparse.
// They're made of multiple 32x32 chunks, which may or may not be resident.

// Safe bit ops in JavaScript operate on numbers cast as 32-bit integers (probs signed!)
// So, let's say there's 31 really, really safe bits.
// - 1 sign bit (ignore?)
// - 1 unused bit
// - 8 top(ish) bits for selecting a layer (256 layers)
// - 11 bits to indicate chunk X (so 2048 chunks per row, or 65536 tiles)
// - 11 bits to indicate chunk Y (so 2048 chunks/64k tiles per column)

// Per tile world row, 2048 32-tile lengths (65536 tiles)
export const TILE_WORLD_ROW_STRIDE = (1 << 11) | 0
export const TILE_WORLD_ROW_MASK = ((1 << 11) - 1) | 0

// Per tile world layer, 4M 32x32 chunks (2^32-1 tiles)
export const TILE_WORLD_LAYER_STRIDE = (1 << 22) | 0

// 'x == 0' is actually half way through the row, so we have -ve space
export const TILE_WORLD_X_OFFSET = (1 << 10) | 0

export const TILE_WORLD_MIN_X = -TILE_WORLD_X_OFFSET
export const TILE_WORLD_MAX_X = TILE_WORLD_X_OFFSET - 1

// tile world is square
export const TILE_WORLD_MIN_Y = TILE_WORLD_MIN_X
export const TILE_WORLD_MAX_Y = TILE_WORLD_MAX_X

export const TILE_WORLD_MAX_LAYERS = 8
