import {
  RCHUNK_LENGTH_IN_TILES,
  TILE_WORLD_ROW_STRIDE,
  TILE_WORLD_MIN_X,
  TILE_WORLD_MAX_X,
  TILE_WORLD_MIN_Y,
  TILE_WORLD_MAX_Y,
  TILE_WORLD_MAX_LAYERS,
  TILE_WORLD_LAYER_STRIDE,
  TILE_WORLD_X_OFFSET,
  TILE_WORLD_Y_OFFSET
} from './limits'
import { createEmptyTileIdArray } from './tileIdTexCache'

const compareNumbers = (a, b) => a - b

export const chunkXYToTileXY = (chunkX, chunkY) => {
  return [Math.imul(chunkX, RCHUNK_LENGTH_IN_TILES), Math.imul(chunkY, RCHUNK_LENGTH_IN_TILES)]
}

if (RCHUNK_LENGTH_IN_TILES !== 32) {
  throw new Error('must adjust tileXYToChunkXY')
}

export const tileXYToChunkXY = (tileX, tileY) => {
  return [
    tileX >>> 5, // div
    tileY >>> 5, // div
    (tileX | 0) % RCHUNK_LENGTH_IN_TILES, // rem
    (tileY | 0) % RCHUNK_LENGTH_IN_TILES // rem
  ]
}

export const getChunkId = (layer, chunkX, chunkY) => {
  const layerPart = (layer | 0) * TILE_WORLD_LAYER_STRIDE
  const yPart = ((chunkY | 0) + TILE_WORLD_Y_OFFSET) * TILE_WORLD_ROW_STRIDE
  const xPart = (chunkX | 0) + TILE_WORLD_X_OFFSET
  return layerPart | yPart | xPart
}

export const isChunkInRange = (layer, chunkX, chunkY) => {
  if ((layer | 0) !== layer) {
    throw new Error(`Floating point layer ${layer} id!`)
  }
  if ((chunkX | 0) !== chunkX) {
    throw new Error(`chunkX ${chunkX} is floating point!`)
  }
  if ((chunkY | 0) !== chunkY) {
    throw new Error(`chunkY ${chunkY} is floating point!`)
  }
  return (layer >= 0 && layer < TILE_WORLD_MAX_LAYERS) && (chunkX >= TILE_WORLD_MIN_X && chunkX <= TILE_WORLD_MAX_X) && (chunkY >= TILE_WORLD_MIN_Y && chunkY <= TILE_WORLD_MAX_Y)
}

const createChunkMeta = () => {
  return {
    lruScore: 99999,
    nonEmpty: 0
  }
}

export default class TileWorld {
  constructor () {
    this.chunks = new Map()
    this._layerInfo = new Map()
    this._layerIds = []
    this.estimatedMem = 0
    this.meta = new Map()
  }

  addLayer (layer, depth, transparent, zSort) {
    if (layer < 0 || layer >= TILE_WORLD_MAX_LAYERS) {
      throw new Error(`layer with layer id ${layer | 0} cannot be created, as it is out of range!`)
    }
    if (this._layerInfo.has(layer | 0)) {
      throw new Error(`layer ${layer | 0} already exists`)
    }
    this._layerInfo.set(layer | 0, {
      layer: layer | 0,
      depth,
      transparent: !!transparent,
      zSort: !!zSort
    })
    this._layerIds.push(layer | 0)
    this._layerIds.sort(compareNumbers)
    this.estimatedMem += 1024
  }

  getLayerInfo (layer) {
    return this._layerInfo.get(layer | 0)
  }

  getLayerIds () {
    return this._layerIds
  }

  ensureChunk (layer, chunkX, chunkY) {
    if (!this.layerInfo.has(layer | 0)) {
      throw new Error(`no such layer ${layer | 0}`)
    }

    const cid = getChunkId(layer, chunkX, chunkY)

    if (!this.chunks.has(cid)) {
      if (!isChunkInRange(layer, chunkX, chunkY)) {
        throw new Error(`Chunk layer:${layer} chunkX:${chunkX} chunkY:${chunkY} is OUT OF RANGE!`)
      }
      this.chunks.set(cid, createEmptyTileIdArray())
      this.meta.set(cid, createChunkMeta())
      this.estimatedMem += RCHUNK_LENGTH_IN_TILES * RCHUNK_LENGTH_IN_TILES * 2 + 128
    }

    return cid
  }

  getChunkDataCXY (layer, chunkX, chunkY) {
    return this.chunks.get(getChunkId(layer, chunkX, chunkY))
  }

  getChunkMetaCXY (layer, chunkX, chunkY) {
    return this.meta.get(getChunkId(layer, chunkX, chunkY))
  }

  getChunkById (layer, cid) {
    const chk = this.chunks.get(cid)
    if (!chk) {
      return null
    }
    return [chk, this.meta.get(cid)]
  }

  getChunkCXY (layer, chunkX, chunkY) {
    const cid = getChunkId(layer, chunkX, chunkY)
    const chk = this.chunks.get(cid)
    if (!chk) {
      return null
    }
    return [chk, this.meta.get(cid)]
  }

  getChunkTXY (layer, tileX, tileY) {
    const [chunkX, chunkY, offsetX, offsetY] = tileXYToChunkXY(tileX, tileY)
    const cid = getChunkId(layer, chunkX, chunkY)
    const chk = this.chunks.get(cid)
    if (!chk) {
      return null
    }
    return [chk, this.meta.get(cid), offsetX, offsetY]
  }
}
