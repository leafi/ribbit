import * as twgl from 'twgl.js/dist/4.x/twgl-full.module.js'
import spritesheetTestPng from '@/data/spritesheet-test.png'

let texture = null

export async function createAsync (gl) {
  // just load the test spritesheet for now...
  const imgElem = document.createElement('img')
  imgElem.src = spritesheetTestPng
  await imgElem.decode()

  texture = twgl.createTexture(gl, {
    auto: false,
    minMag: gl.NEAREST,
    format: gl.RGBA,
    src: imgElem,
    target: gl.TEXTURE_2D,
    level: 0,
    unpackAlignment: 1,
    premultiplyAlpha: false
  })

  return true
}

export function getTexture () {
  if (!texture) {
    throw new Error('spritesheet texture does not exist!')
  }
  return texture
}

export function destroy (gl) {}
