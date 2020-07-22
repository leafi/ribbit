#version 100

/* ------------------------------ */
/* src/shaders/rchunk-opaque.frag */
/* ------------------------------ */

precision mediump float;
precision lowp int;

// ?? lowp ??
uniform sampler2D uTileSheetTex;

varying vec4 vsfsUVAndExtra;  // 'extra' (.b,.a) usage TBD

void main() {
  // TODO: Switch to 16-bit image decoding! (32bit 'cutout' rgba for now...)
  // Then we could use the other 2 bytes for something more useful. Or omit them...!

  vec2 uv = vsfsUVAndExtra.rg;

  vec4 texel = texture2D(uTileSheetTex, uv);

  gl_FragColor = vec4(
    texel.rgb,
    step(0.5, texel.a)
  );
}
