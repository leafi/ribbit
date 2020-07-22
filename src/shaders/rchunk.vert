#version 100

precision mediump float;

/* ----------------------- */
/* src/shaders/rchunk.vert */
/* ----------------------- */

attribute mediump vec4 tileXYUV; // (tileIdxX, tileIdxY, subTileU, subTileV)

uniform mat4 uProjMtx;
uniform vec4 uShove; // (base pos x, base pos y, depth, scale)
uniform vec4 uConstants;

uniform sampler2D uTileIdTex;

// VS -> FS
varying mediump vec4 fsIn; // (.rg := uv, .ba := whatever)

const vec4 DEAD = vec4(-2000.0, -2000.0, 0.0, 1.0);

void main() {
  // unpack uniform constants
  float uInvTileLengthDivSheetLength = uConstants.x;
  float uInvRChunkLengthInTiles = uConstants.y;  // 1/32
  float uTileLength = uConstants.z;

  // reconstruct position data from tile info
  vec2 position = uTileLength * (tileXYUV.xy + tileXYUV.zw);

  // R channel: sprite sheet tile X coord
  // G channel: sprite sheet tile Y coord
  // B channel: ?? extra data for pixel shader
  // A channel: ?? extra data for pixel shader
  vec4 tidData = texture2D(uTileIdTex, tileXYUV.xy * uInvRChunkLengthInTiles);

  vec2 vsfsUV = (tidData.rg * 255.0 + tileXYUV.zw) * uInvTileLengthDivSheetLength;
  fsIn = vec4(vsfsUV.x, vsfsUV.y, tidData.b, tidData.a);

  if (tidData.r + tidData.g > 2.0 * 254.5 / 255.0) {
    // X ~= 255, Y ~= 255... => 'this tile is empty'
    // force off-screen
    gl_Position = vec4(-2000.0, -2000.0, -1.0, 1.0);
  } else {
    vec2 p = position * uShove.w + uShove.xy;
    gl_Position = uProjMtx * vec4(p.xy, uShove.z, 1.0);
  }
}
