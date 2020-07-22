/* eslint-env browser */
import '@exampledev/new.css'
import './variables.css'
import './global.css'
// import { h, render } from 'preact'
import { recreateStore } from './store'
// import App from './components/App'
// import Minim from '@/Minim'
import { initRender } from '@/render'

console.log('Hi there!')

const bodyTag = document.getElementsByTagName('body').item(0)
// #app already exists in <body />
const appDiv = document.getElementById('app')
const gfxCanvas = document.createElement('canvas')
gfxCanvas.id = 'gfx'
bodyTag.insertBefore(gfxCanvas, appDiv)

// existing #app div will be made a layer on top of #gfx by css

recreateStore()

// const divEl = document.getElementById('_mount_target')
// console.info(divEl)

// install 'Minim' non-default story
// Minim()

// render(<App />, appDiv)

initRender(gfxCanvas)
