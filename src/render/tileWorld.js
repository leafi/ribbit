import {
  RCHUNK_LENGTH_IN_TILES,
  TILE_WORLD_CHUNK_ROW_STRIDE,
  TILE_WORLD_MIN_X,
  TILE_WORLD_MAX_X,
  TILE_WORLD_ROW_STRIDE,
  TILE_WORLD_X_OFFSET
} from './limits'
import { fillEmptyTileIdArray } from './tileIdTexCache'

const compareNumbers = (a, b) => a - b
const chunkCoord = (chunkX, chunkY) => chunkY * TILE_WORLD_CHUNK_ROW_STRIDE + TILE_WORLD_X_OFFSET + chunkX

export default class TileWorld {
  constructor () {
    this.world = new Map()
  }

  ensureChunk (chunkX, chunkY) {
    const cidx = chunkCoord(chunkX | 0, chunkY | 0) | 0
    if (!this.world.has(cidx)) {
      const ch = {
        chunkX: chunkX | 0,
        chunkY: chunkY | 0,
        layers: new Map(),
        sortedKeys: []
      }
      this.world.set(cidx, ch)
      return ch
    }
    return this.world.get(cidx)
  }

  ensureChunkLayer (chunkX, chunkY, layer) {
    const ch = this.ensureChunk(chunkX, chunkY)

    if (!ch.layers.has(layer)) {
      ch.sortedKeys.push(layer)
      ch.sortedKeys.sort(compareNumbers)

      const layerData = {
        chunkX: chunkX | 0,
        chunkY: chunkY | 0,
        data: new Uint32Array(RCHUNK_LENGTH_IN_TILES * RCHUNK_LENGTH_IN_TILES),
        depth: layer,
        type: 'opaque'
      }
      fillEmptyTileIdArray(layerData.data)
      ch.layers.set(layer, layerData)
      return layerData
    }

    return ch.layers.get(layer)
  }
}
