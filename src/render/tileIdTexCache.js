// Cache for uTileIdTex textures. (they're 32x32 pixels)
// Maintains a list available for grabbing at rendering time!
import { RCHUNK_LENGTH_IN_TILES } from './limits'
import * as twgl from 'twgl.js/dist/4.x/twgl-full.module.js'

const defaultEmpty = new Uint16Array(RCHUNK_LENGTH_IN_TILES * RCHUNK_LENGTH_IN_TILES)

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
    type: gl.UNSIGNED_SHORT_4_4_4_4,
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
  const u16a = new Uint16Array(RCHUNK_LENGTH_IN_TILES * RCHUNK_LENGTH_IN_TILES)
  fillEmptyTileIdArray(u16a)
  return u16a
}

export function fillEmptyTileIdArray (tileIdU16A) {
  const emptyId = ((127 << 8) | 127) | 0
  tileIdU16A.fill(emptyId)
  return tileIdU16A
}

export function getTexture (gl, tileIdU16A) {
  if (usedTextureIdx >= allTextures.length) {
    pushNewTexture(gl)
  }

  const tex = allTextures[usedTextureIdx]
  usedTextureIdx++
  twgl.setTextureFromArray(gl, tex, tileIdU16A, texOptions)
  return tex
}

export function resetUsedList () {
  usedTextureIdx = 0
}
