import * as twgl from 'twgl.js/dist/4.x/twgl-full.module.js'
import { TILE_SHEET_LENGTH } from './limits'
import * as ortho from './ortho'
import * as renderRChunk from './renderRChunk'
import { initShadersAsync } from './shaders'
import * as spritesheet from './spritesheet'

let _gfxCanvas
let _gl

export async function initRender (gfxCanvas) {
  // We only want WebGL 1.
  twgl.setDefaults({
    addExtensionsToContext: false,
    enableVertexArrayObjects: false
  })

  const gl = twgl.getWebGLContext(gfxCanvas, {
    alpha: false, // opaque
    desynchronized: true, // er... faster? might be bad
    antialias: false, // LOL no
    depth: true, // used a lot
    failIfMajorPerformanceCaveat: false, // have a go!
    powerPreference: 'default', // up 2 u
    premultipliedAlpha: false, // probably should... but I don't do premult
    preserveDrawingBuffer: false, // for now: always discard
    stencil: true // might come in handy
  })

  if (!gl) {
    throw new Error('Failed to initialize WebGL. Even 1.0 should work!')
  }

  _gfxCanvas = gfxCanvas
  _gl = gl

  if (gl.MAX_TEXTURE_SIZE < TILE_SHEET_LENGTH) {
    throw new Error(
      `Max supported texture size too low: needed ${TILE_SHEET_LENGTH} but only ${gl.MAX_TEXTURE_SIZE} is available`
    )
  }

  const result = await initShadersAsync(gl)

  if (result !== true) {
    console.error('Shader compilation failed.')
    throw new Error('Shader compilation failed.')
  }

  const sheetOk = await spritesheet.createAsync(gl)
  if (!sheetOk) {
    throw new Error('Failed to load spritesheet')
  }

  renderRChunk.init(gl)

  const testTileIdTex = renderRChunk.createTestTileIdTex(gl)

  const rpaf = window.requestPostAnimationFrame || window.requestAnimationFrame

  const renderInside = t => {
    ortho.viewport(gl)

    gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.clearColor(0.0, 0.5, 0.5, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    renderRChunk.renderOpaque(gl, testTileIdTex, 0.0, 0.0, 1.0, 2.0)

    rpaf(renderInside)
  }
  rpaf(renderInside)

  return true
}

export function getCanvasElem () {
  return _gfxCanvas
}

export function getGLContext () {
  return _gl
}
