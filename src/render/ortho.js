import * as twgl from 'twgl.js/dist/4.x/twgl-full.module.js'

const projMtx = twgl.m4.identity()
const reverseZMatrix = twgl.m4.scaling([1.0, 1.0, -1.0])

export const NEAR_Z = 0.0
export const FAR_Z = 100.0

let lastWidth = 256
let lastHeight = 256

export function viewport (gl) {
  // TODO: window.devicePixelRatio ??
  twgl.resizeCanvasToDisplaySize(gl.canvas)
  lastWidth = gl.canvas.width
  lastHeight = gl.canvas.height

  twgl.m4.ortho(0, gl.canvas.width, gl.canvas.height, 0, NEAR_Z, FAR_Z, projMtx)
  // RHS (-Z) -> LHS (+Z)
  twgl.m4.multiply(projMtx, reverseZMatrix, projMtx)

  gl.viewport(0, 0, lastWidth, lastHeight)
}

// returns Float32Array whose contents is updated each frame
export function getMatrix () {
  return projMtx
}

export function getWidth () {
  return lastWidth
}
export function getHeight () {
  return lastHeight
}
