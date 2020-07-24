// Cache for uTileIdTex textures. (they're 32x32 pixels)
// Maintains a list available for grabbing at rendering time!
import { RCHUNK_LENGTH_IN_TILES } from './limits'
import * as twgl from 'twgl.js/dist/4.x/twgl-full.module.js'

const defaultEmpty = new Uint32Array(RCHUNK_LENGTH_IN_TILES * RCHUNK_LENGTH_IN_TILES)

const allTextures = []
let newTexOptions = null
let texOptions = null
let usedTextureIdx = 0

// For now, we'll just reupload every used texture, every frame,
// and see how things go from there.

function pushNewTexture (gl) {
  allTextures.push(
    twgl.createTexture(gl, newTexOptions)
  )
}

export function init (gl) {
  texOptions = {
    auto: false,
    format: gl.RGBA,
    height: RCHUNK_LENGTH_IN_TILES,
    level: 0,
    minMag: gl.NEAREST,
    premultiplyAlpha: false,
    target: gl.TEXTURE_2D,
    unpackAlignment: 1,
    width: RCHUNK_LENGTH_IN_TILES
  }

  fillEmptyTileIdArray(defaultEmpty)

  newTexOptions = {
    ...texOptions,
    src: defaultEmpty
  }

  for (let i = 0; i < 16; i++) {
    pushNewTexture(gl)
  }
}

export function createEmptyTileIdArray () {
  const u32a = new Uint32Array(RCHUNK_LENGTH_IN_TILES * RCHUNK_LENGTH_IN_TILES)
  fillEmptyTileIdArray(u32a)
  return u32a
}

export function fillEmptyTileIdArray (tileIdU32A) {
  const emptyId = (255 << 24) | (255 << 16)
  tileIdU32A.fill(emptyId)
  return tileIdU32A
}

export function getTexture (gl, tileIdU32A) {
  if (usedTextureIdx >= allTextures.length) {
    pushNewTexture(gl)
  }

  const tex = allTextures[usedTextureIdx]
  usedTextureIdx++
  twgl.setTextureFromArray(gl, tex, tileIdU32A, texOptions)
  return tex
}

export function resetUsedList () {
  usedTextureIdx = 0
}
