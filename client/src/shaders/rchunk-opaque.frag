#version 100

/* ------------------------------ */
/* src/shaders/rchunk-opaque.frag */
/* ------------------------------ */

precision mediump float;

// ?? lowp ??
uniform sampler2D uSpreadsheetTex;

varying lowp vec4 fsIn;  // 'extra' (.z,.w) usage TBD

void main() {
  // TODO: Switch to 16-bit image decoding! (32bit 'cutout' rgba for now...)
  // Then we could use the other 2 bytes for something more useful. Or omit them...!

  vec4 texel = texture2D(uSpreadsheetTex, fsIn.xy);

  gl_FragColor = vec4(
    texel.rgb,
    step(0.5, texel.a)
  );
}
