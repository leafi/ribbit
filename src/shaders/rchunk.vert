#version 100

/* ----------------------- */
/* src/shaders/rchunk.vert */
/* ----------------------- */

// for now.....
precision highp float;
precision highp int;

// TODO: Reduce precision where possible. We do a lot of work here!

attribute vec2 position;
attribute vec2 subTileUV;
attribute vec2 tileXY;

// TODO: 2d tileID texture -> 1d tileID texture?
// (would ideally be 8 bytes/info, 16 bytes/info max (4096px@RGBA))

uniform mat4 uMVP;
uniform vec2 uTileXYBase; // premultiplied by e.g. 32
uniform float uDepth;
uniform float uTileLengthDivSheetLength;
uniform float uInvTileLengthDivSheetLength;
uniform int uRChunkLengthInTiles; // = 32;

uniform sampler2D uTileIDTex;

// VS -> FS
varying vec4 vsfsUVAndExtra; // (.rg := uv, .ba := whatever)

const vec4 DEAD = vec4(-2000.0, -2000.0, 0.0, 1.0);

void main() {
  vec2 tileIdUV = (
    (
      vec2(0.5, 0.5)
      + uTileXYBase
      + vec2(tileXY.x, tileXY.y)
    )
  ) * uInvTileLengthDivSheetLength;

  // TODO: pack tile id x,y data into 2 bytes, TIGHTLY.
  // Right now b,a channels of RGBA tile id texture aren't very useful...

  // R channel: sprite sheet tile X coord
  // G channel: sprite sheet tile Y coord
  // B channel: ?? extra data for pixel shader
  // A channel: ?? extra data for pixel shader
  vec4 tidData = texture2D(uTileIDTex, tileIdUV);

  vec2 vsfsUV = (tidData.rg * 255.0 + subTileUV) * uTileLengthDivSheetLength;
  vsfsUVAndExtra = vec4(vsfsUV.x, vsfsUV.y, tidData.b, tidData.a);

  if (tidData.r + tidData.g > 2.0 * 254.5 / 255.0) {
    // X ~= 255, Y ~= 255... => 'this tile is empty'
    // force off-screen
    gl_Position = vec4(-2000.0, -2000.0, 0.0, 1.0);
  } else {
    gl_Position = uMVP * vec4(position.x, position.y, uDepth, 1.0);
  }
}
