import {
  RCHUNK_LENGTH_IN_TILES,
  TILE_LENGTH,
  TILES_PER_SHEET_LENGTH
} from './limits'
import * as ortho from './ortho'
import shaders from './shaders'
import * as twgl from 'twgl.js/dist/4.x/twgl-full.module.js'
import * as spritesheet from './spritesheet'

const RCHUNK_NUM_INDICES = 6 * RCHUNK_LENGTH_IN_TILES * RCHUNK_LENGTH_IN_TILES
const RCHUNK_NUM_VERTS = 4 * RCHUNK_LENGTH_IN_TILES * RCHUNK_LENGTH_IN_TILES

let staticBufferInfo = null

const globalUniforms = {
  // VS
  uProjMtx: twgl.m4.identity(),
  uConstants: new Float32Array([
    1.0 / TILES_PER_SHEET_LENGTH, // uInvTileLengthDivSheetLength
    1.0 / RCHUNK_LENGTH_IN_TILES, // uInvRChunkLengthInTiles
    TILE_LENGTH,
    0.0
  ]),
  // FS
  uSpreadsheetTex: null
}

const perChunkUniforms = {
  // VS
  uShove: new Float32Array(4), // (chunk pos x, chunk pos y, depth, scale)
  uTileIdTex: null
}

function createStaticBufferInfo (gl) {
  const createIndicesBuffer = () => {
    // index buffer (for repeated chunk)
    const indicesArr = new Uint16Array(RCHUNK_NUM_INDICES)
    let v = 0
    for (let i = 0; i < RCHUNK_NUM_INDICES; i += 6) {
      indicesArr[i] = v
      indicesArr[i + 1] = v + 1
      indicesArr[i + 2] = v + 2

      indicesArr[i + 3] = v + 2
      indicesArr[i + 4] = v + 3
      indicesArr[i + 5] = v

      v += 4
    }

    return twgl.createBufferFromTypedArray(
      gl,
      indicesArr,
      gl.ELEMENT_ARRAY_BUFFER,
      gl.STATIC_DRAW
    )
  }

  const createTileXYUVData = () => {
    // construct combined stream data
    const tileXYUVData = new Uint8Array(RCHUNK_NUM_VERTS * 4)

    // .x and .y are tile coords data; which tile does this vertex belong to?
    // .z and .w are sub-tile UV data - is this the start or end of a tile, horz or vert?
    for (let i = 0; 16 * i < RCHUNK_NUM_VERTS * 4; i++) {
      const tileIdxX = i % RCHUNK_LENGTH_IN_TILES | 0
      const tileIdxY = (i / RCHUNK_LENGTH_IN_TILES) | 0
      const iBase = (16 * i) | 0

      // vertex order: TL, BL, BR, TR

      // basic x tile coord
      tileXYUVData[iBase] = tileIdxX
      tileXYUVData[iBase + 4] = tileIdxX
      tileXYUVData[iBase + 8] = tileIdxX
      tileXYUVData[iBase + 12] = tileIdxX
      // basic y tile coord
      tileXYUVData[iBase + 1] = tileIdxY
      tileXYUVData[iBase + 5] = tileIdxY
      tileXYUVData[iBase + 9] = tileIdxY
      tileXYUVData[iBase + 13] = tileIdxY
      // sub-tile U tex coord
      tileXYUVData[iBase + 2] = 0
      tileXYUVData[iBase + 6] = 0
      tileXYUVData[iBase + 10] = 1
      tileXYUVData[iBase + 14] = 1
      // sub-tile V tex coord
      tileXYUVData[iBase + 3] = 0
      tileXYUVData[iBase + 7] = 1
      tileXYUVData[iBase + 11] = 1
      tileXYUVData[iBase + 15] = 0
    }

    return tileXYUVData
  }

  staticBufferInfo = twgl.createBufferInfoFromArrays(
    gl,
    {
      tileXYUV: {
        data: createTileXYUVData(),
        normalize: false,
        numComponents: 4
      }
    },
    {
      numElements: RCHUNK_NUM_INDICES,
      indices: createIndicesBuffer(),
      elementType: gl.UNSIGNED_SHORT
    }
  )
}

export function init (gl) {
  if (gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS < 1) {
    throw new Error(
      'tile renderer requires at least 1 vertex texture image unit'
    )
  }

  createStaticBufferInfo(gl)

  globalUniforms.uProjMtx = ortho.getMatrix() // by reference
  globalUniforms.uSpreadsheetTex = spritesheet.getTexture()
}

export function createTestTileIdTex (gl) {
  // fake tile id texture
  const tileIdArr = new Uint16Array(
    RCHUNK_LENGTH_IN_TILES * RCHUNK_LENGTH_IN_TILES
  )
  for (let i = 0; i < RCHUNK_LENGTH_IN_TILES * RCHUNK_LENGTH_IN_TILES; i++) {
    const tileIdX = i % 2
    const tileIdY = (i / RCHUNK_LENGTH_IN_TILES) % 2
    tileIdArr[i] = tileIdX << 8 | tileIdY
  }
  return twgl.createTexture(gl, {
    auto: false,
    minMag: gl.NEAREST,
    internalformat: gl.RGBA,
    format: gl.RGBA,
    type: gl.UNSIGNED_SHORT_4_4_4_4,
    height: RCHUNK_LENGTH_IN_TILES,
    src: tileIdArr,
    width: RCHUNK_LENGTH_IN_TILES,
    target: gl.TEXTURE_2D,
    level: 0,
    unpackAlignment: 1,
    premultiplyAlpha: false
  })
}

export function renderOpaque (
  gl,
  tileIdTex,
  chunkPosX,
  chunkPosY,
  depth,
  scale
) {
  perChunkUniforms.uTileIdTex = tileIdTex
  perChunkUniforms.uShove[0] = chunkPosX
  perChunkUniforms.uShove[1] = chunkPosY
  perChunkUniforms.uShove[2] = depth
  perChunkUniforms.uShove[3] = scale

  gl.useProgram(shaders.rchunkOpaque.program)
  twgl.setBuffersAndAttributes(gl, shaders.rchunkOpaque, staticBufferInfo)
  twgl.setUniforms(shaders.rchunkOpaque, globalUniforms)
  twgl.setUniforms(shaders.rchunkOpaque, perChunkUniforms)
  twgl.drawBufferInfo(gl, staticBufferInfo)
}

export function destroy (gl) {}
