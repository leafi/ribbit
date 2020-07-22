import * as twgl from 'twgl.js/dist/4.x/twgl-full.module.js'
import { initShadersAsync } from './shaders'
import { _initTestRChunk, _rchunkRender, renderTilingInit } from './tiling'
import spritesheetTestPng from '@/data/spritesheet-test.png'

let _gfxCanvas
let _gl

export async function initRender (gfxCanvas) {
  // We only want WebGL 1.
  twgl.setDefaults({
    addExtensionsToContext: false,
    enableVertexArrayObjects: false
  })

  const gl = twgl.getWebGLContext(
    gfxCanvas,
    {
      alpha: false, // opaque
      desynchronized: true, // er... faster? might be bad
      antialias: false, // LOL no
      depth: true, // used a lot
      failIfMajorPerformanceCaveat: false, // have a go!
      powerPreference: 'default', // up 2 u
      premultipliedAlpha: false, // probably should... but I don't do premult
      preserveDrawingBuffer: false, // for now: always discard
      stencil: true // might come in handy
    }
  )

  if (!gl) {
    throw new Error('Failed to initialize WebGL. Even 1.0 should work!')
  }

  _gfxCanvas = gfxCanvas
  _gl = gl

  const result = await initShadersAsync(gl)

  if (result !== true) {
    console.error('Shader compilation failed.')
    throw new Error('Shader compilation failed.')
  }

  console.info(2)

  const rtiOk = renderTilingInit(gl)
  if (rtiOk !== true) {
    throw new Error(`Failed to init WebGL: renderTilingInit: ${rtiOk[1]}`)
  }

  console.info('png post-import:', spritesheetTestPng)

  console.info(3)

  const initTestOk = await _initTestRChunk(gl)
  if (initTestOk !== true) {
    throw new Error('_initTestRChunk returned false', initTestOk)
  }

  console.info(4)

  const rpaf = window.requestPostAnimationFrame || window.requestAnimationFrame

  const renderInside = t => {
    _rchunkRender(gl)
    rpaf(renderInside)
  }
  rpaf(renderInside)

  console.info(5)

  return true
}

export function getCanvasElem () {
  return _gfxCanvas
}

export function getGLContext () {
  return _gl
}
