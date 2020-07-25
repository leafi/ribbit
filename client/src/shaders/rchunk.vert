#version 100

precision mediump float;

/* ----------------------- */
/* src/shaders/rchunk.vert */
/* ----------------------- */

attribute lowp vec4 tileXYUV; // (tileIdxX, tileIdxY, subTileU, subTileV)

uniform mediump mat4 uProjMtx;
uniform mediump vec4 uShove; // (base pos x, base pos y, depth, scale)
uniform mediump vec4 uConstants;

uniform lowp sampler2D uTileIdTex;

// VS -> FS
varying lowp vec4 fsIn; // (.rg := uv, .ba := whatever)

const vec4 DEAD = vec4(-2000.0, -2000.0, 0.0, 1.0);

void main() {
  // unpack uniform constants
  float uInvTileLengthDivSheetLength = uConstants.x;
  float uInvRChunkLengthInTiles = uConstants.y;  // 1/32
  float uTileLength = uConstants.z;

  // reconstruct position data from tile info
  vec2 position = uTileLength * (tileXYUV.xy + tileXYUV.zw);

  // packedTid is (tileX8 << 8 | tileY8) reinterpreted as 4x4bit normalized ints
  // (Top bit of tileX8, tileY8 may be used by fragment shader.)
  vec4 packedTid = 15.0 * texture2D(uTileIdTex, tileXYUV.xy * uInvRChunkLengthInTiles);

  // Reconstruct 7-bit tile X from low 3 bits of 4-bit .x, all of 4-bit .y
  // Reconstruct 7-bit tile Y from low 3 bits of 4-bit .z, all of 4-bit .w
  vec2 tileId = mod(packedTid.xz, 8.0) * 16.0 + packedTid.yw;

  vec2 vsfsUV = (tileId + tileXYUV.zw) * uInvTileLengthDivSheetLength;
  fsIn = vec4(vsfsUV.x, vsfsUV.y, step(packedTid.r, 8.0), step(packedTid.b, 8.0));

  if (tileId.x + tileId.y > 254.0) {
    // X ~= 255, Y ~= 255... => 'this tile is empty'
    // force off-screen
    gl_Position = vec4(-2000.0, -2000.0, -1.0, 1.0);
  } else {
    vec2 p = position * uShove.w + uShove.xy;
    // TODO: eliminate matrix multiply? with some screen size info, we don't need it, y'know!
    gl_Position = uProjMtx * vec4(p.xy, uShove.z, 1.0);
  }
}
