import {
  TILE_SHEET_LENGTH,
  TILE_LENGTH
  // TILES_PER_SHEET_LENGTH,
  // MAX_TILES
} from './limits'
// import shaders from './shaders'
import * as twgl from 'twgl.js'

// 1. opaque tile layers
//    TOP *DOWN* (min overdraw) -- but, must get depth result right!!! e.g. z ABOVE same translucent layer z
//    put triangles at e.g. -100,-100 (in vertex shader) if 1 particular tile is not to be drawn
// 2. (TODO) object layer, 1 row at a time, to get depth right... ugh....
// 3. translucent tile layers
//    BOTTOM *UP* (for correct draw order) -- get depth correct (opaque should block)
//    again put triangles at -100,-100 if no draw data for this tile

// XXXXXXXXXXXXXXX not possible in webgl 1 XXXXXXXXXXXXXXXXXXXXXXX
// XXX We use 1 vertex per tile.
// XXX How? Simple - use glVertexID or whatever it is in vshader to reconstruct quad vertex from single tile vertex
// XXX Index buffer has first vertex 6 times, then second vertex 6 times, etc.
// XXXXXXXXXXXXXXX not possible in webgl 1 XXXXXXXXXXXXXXXXXXXXXXX

// per-tile rendering approach:
// 1. Indices buffer: 0,1,2, 2,1,3,
//                    4,5,6, 6,5,7, ...
// 2. Vertex data stream:
//                    pos   for each vertex     (will be transformed by uniform matrix)
//                    tu    0.0..1.0 for U coordinate of tile (will be transformed in vert/frag shader)
//                    tv    0.0..1.0 for V coordinate of tile (will be transformed in vert/frag shader)
//                    addx  tile id texture x offset (added to base x uniform)
//                    addy  tile id texture y offset (added to base y uniform)
// (^ for a block of 32x32 tiles, that all adds up to like 24 KiB of info at most. it's nothing!)
// 3. Tile id texture
//       Texture read in vshader. Pixel's value corresponds to a tile id, & texture is sampled from spritesheet in frag shader
//       If tile id == 0, then vshader should force vertex output to e.g. -100,-100 (forming off-screen, degenerate triangles)

// ... ^^^ but this all requires MAX_VERTEX_TEXTURE_IMAGE_UNITS to be > 0 ...
// ... it usually is. Screw those for whom it isn't.
// MAX_TEXTURE_SIZE is at least 2048 says webglstats.com, and in 99.9% cases is at least 4096 --
// and ~94% have MAX_VERTEX_TEXTURE_IMAGE_UNITS > 0. So, we could go to 4096 if we wanted to.

export const RCHUNK_LENGTH_IN_TILES = 32
export const RCHUNK_LENGTH_IN_PX = RCHUNK_LENGTH_IN_TILES * TILE_LENGTH

// ^ So we'll (for opaque non-object layers) cover 512x512px of 1 layer per draw call.

// num indices is 6/4ths of num verts
export const RCHUNK_NUM_INDICES = 6 * RCHUNK_LENGTH_IN_TILES * RCHUNK_LENGTH_IN_TILES
export const RCHUNK_NUM_VERTS = 4 * RCHUNK_LENGTH_IN_TILES * RCHUNK_LENGTH_IN_TILES

const glData = {}

const testRChunk = {}

function _createTestRChunkBasics (gl) {

}

function _createRChunkIndices (gl) {
  // index buffer (for repeated chunk)
  const indicesArr = new Uint16Array(RCHUNK_NUM_INDICES)
  let v = 0
  for (let i = 0; i < RCHUNK_NUM_INDICES; i += 6) {
    indicesArr[i] = v
    indicesArr[i + 1] = v + 1
    indicesArr[i + 2] = v + 2

    indicesArr[i + 3] = v + 2
    indicesArr[i + 4] = v + 1
    indicesArr[i + 5] = v + 3

    v += 4
  }

  const indicesBuf = twgl.createBufferFromTypedArray(
    gl,
    indicesArr,
    gl.ELEMENT_ARRAY_BUFFER,
    gl.STATIC_DRAW
  )

  glData.staticIndices = indicesBuf
}

function _createRChunkBufferInfo (gl) {
  // const POSITION_NUM_FLOATS = RCHUNK_NUM_VERTS * 2
  // const SUBTILE_UV_NUM_BYTES = RCHUNK_NUM_VERTS * 2
  // const TILE_XY_NUM_BYTES = RCHUNK_NUM_VERTS * 2
  // new ArrayBuffer(
  const positionData = new Float32Array(RCHUNK_NUM_VERTS * 2)

  // 1. fill in position X coords
  for (let i = 0; i * 8 < RCHUNK_NUM_VERTS * 2; i++) {
    // x of TL, x of BL, x of BR, x of TR
    const tileIdxX = i % RCHUNK_LENGTH_IN_TILES
    positionData[8 * i] = TILE_LENGTH * tileIdxX
    positionData[8 * i + 2] = TILE_LENGTH * tileIdxX
    positionData[8 * i + 4] = TILE_LENGTH * tileIdxX + TILE_LENGTH
    positionData[8 * i + 6] = TILE_LENGTH * tileIdxX + TILE_LENGTH
  }

  // fill in position Y coords
  for (let i = 0; i * 8 < RCHUNK_NUM_VERTS * 2; i++) {
    // y of TL, y of BL, y of BR, y of TR
    const tileIdxY = i / RCHUNK_LENGTH_IN_TILES
    positionData[8 * i + 1] = TILE_LENGTH * tileIdxY
    positionData[8 * i + 3] = TILE_LENGTH * tileIdxY + TILE_LENGTH
    positionData[8 * i + 5] = TILE_LENGTH * tileIdxY + TILE_LENGTH
    positionData[8 * i + 7] = TILE_LENGTH * tileIdxY
  }

  /*
  const subTileUVData = new Float32Array(RCHUNK_NUM_VERTS * 2)

  for (let i = 0; i < RCHUNK_NUM_VERTS * 2; i += 8) {
    // TL
    subTileUVData[i] = 0
    subTileUVData[i + 1] = 0
    // BL
    subTileUVData[i + 2] = 0
    subTileUVData[i + 3] = 1
    // BR
    subTileUVData[i + 4] = 1
    subTileUVData[i + 5] = 1
    // TR
    subTileUVData[i + 6] = 1
    subTileUVData[i + 7] = 0
  }
  */
  const subTileUVData = new Uint8Array(RCHUNK_NUM_VERTS * 2)

  // TL, BL, BR, TR
  const subTileUVPattern = [0, 0, 0, 255, 255, 255, 255, 0]
  for (let i = 0; i < RCHUNK_NUM_VERTS * 2; i += 8) {
    subTileUVData.set(subTileUVPattern, i)
  }

  const tileXYData = new Uint8Array(RCHUNK_NUM_VERTS * 2)

  for (let i = 0; i < RCHUNK_NUM_VERTS * 2; i += 2) {
    // x
    tileXYData[i] = i % RCHUNK_LENGTH_IN_TILES
    // y
    tileXYData[i + 1] = i / RCHUNK_LENGTH_IN_TILES
  }

  glData.staticBufferInfo = twgl.createBufferInfoFromArrays(
    gl,
    {
      position: {
        data: positionData,
        numComponents: 2
      },
      subTileUV: {
        data: subTileUVData,
        normalize: true,
        numComponents: 2
      },
      tileXY: {
        data: tileXYData,
        normalize: false,
        numComponents: 2
      }
    },
    {
      numElements: RCHUNK_NUM_INDICES,
      indices: glData.staticIndices,
      elementType: gl.UNSIGNED_SHORT
    }
  )
}

export function renderTilingInit (gl) {
  if (gl.MAX_TEXTURE_SIZE < TILE_SHEET_LENGTH) {
    return [false, `max texture size ${gl.MAX_TEXTURE_SIZE} must be at least ${TILE_SHEET_LENGTH}`]
  }
  if (gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS < 1) {
    return [false, 'tile renderer requires at least 1 vertex texture image unit']
  }

  _createRChunkIndices(gl)
  _createRChunkBufferInfo(gl)

  return true
}
