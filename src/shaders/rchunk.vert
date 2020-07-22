#version 100

/* ----------------------- */
/* src/shaders/rchunk.vert */
/* ----------------------- */

// for now.....
precision highp float;
precision highp int;

// TODO: Reduce precision where possible. We do a lot of work here!

attribute mediump vec2 position;
attribute vec2 subTileUV;
attribute vec2 tileXY;

uniform mat4 uProjMtx;
uniform vec4 uShove; // (base pos x, base pos y, depth, scale)
uniform vec4 uConstants;

uniform sampler2D uTileIDTex;

// VS -> FS
varying vec4 vsfsUVAndExtra; // (.rg := uv, .ba := whatever)

// must be kept in sync with HACK_MUL_TILE_ID in src/render/tiling.js
const float INV_HACK_MUL_TILE_ID = 0.25;

const vec4 DEAD = vec4(-2000.0, -2000.0, 0.0, 1.0);

void main() {
  // unpack uniform constants
  float uInvTileLengthDivSheetLength = uConstants.x;
  float uInvRChunkLengthInTiles = uConstants.y;  // 1/32

  vec2 tileIdUV = (
    (
      vec2(0.5, 0.5)
      + INV_HACK_MUL_TILE_ID * tileXY
    )
  ) * uInvRChunkLengthInTiles;

  // TODO: pack tile id x,y data into 2 bytes, TIGHTLY.
  // Right now b,a channels of RGBA tile id texture aren't very useful...

  // R channel: sprite sheet tile X coord
  // G channel: sprite sheet tile Y coord
  // B channel: ?? extra data for pixel shader
  // A channel: ?? extra data for pixel shader
  vec4 tidData = texture2D(uTileIDTex, tileIdUV);

  vec2 vsfsUV = (tidData.rg * 255.0 + subTileUV) * uInvTileLengthDivSheetLength;
  vsfsUVAndExtra = vec4(vsfsUV.x, vsfsUV.y, tidData.b, tidData.a);

  if (tidData.r + tidData.g > 2.0 * 254.5 / 255.0) {
    // X ~= 255, Y ~= 255... => 'this tile is empty'
    // force off-screen
    gl_Position = vec4(-2000.0, -2000.0, -1.0, 1.0);
  } else {
    vec2 p = position * uShove.w + uShove.xy;
    gl_Position = uProjMtx * vec4(p.xy, uShove.z, 1.0);
  }
}
