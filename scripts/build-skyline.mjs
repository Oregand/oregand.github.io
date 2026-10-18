import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, meshopt, weld } from '@gltf-transform/functions';
import { MeshoptEncoder } from 'meshoptimizer';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';

const source = process.argv[2];
if (!source) throw new Error('Usage: npm run build:skyline -- /path/to/skyline.stl');

const data = await readFile(source);
const geometry = new STLLoader().parse(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));
const colors = new Float32Array(geometry.attributes.position.array.length);
for (let i = 0; i < geometry.attributes.position.count; i++) {
  const height = geometry.attributes.position.getZ(i);
  const t = Math.max(0, Math.min(1, height / 25));
  colors.set(height > 0 ? [0.04 + t * 0.04, 0.28 + t * 0.25, 0.12 + t * 0.12] : [0.025, 0.045, 0.065], i * 3);
}
// STL is Z-up; glTF and the viewer use Y-up.
geometry.rotateX(-Math.PI / 2);
geometry.center();

const document = new Document();
const buffer = document.createBuffer();
const position = document.createAccessor()
  .setType('VEC3').setArray(geometry.attributes.position.array).setBuffer(buffer);
const normal = document.createAccessor()
  .setType('VEC3').setArray(geometry.attributes.normal.array).setBuffer(buffer);
const color = document.createAccessor()
  .setType('VEC3').setArray(colors).setBuffer(buffer);
const material = document.createMaterial('Skyline')
  .setMetallicFactor(0.15).setRoughnessFactor(0.6);
const primitive = document.createPrimitive()
  .setAttribute('POSITION', position).setAttribute('NORMAL', normal)
  .setAttribute('COLOR_0', color).setMaterial(material);
const mesh = document.createMesh('Oregand 2008-2026 GitHub Skyline').addPrimitive(primitive);
document.createScene().addChild(document.createNode().setMesh(mesh));

await MeshoptEncoder.ready;
await document.transform(dedup(), weld(), meshopt({ encoder: MeshoptEncoder, level: 'high' }));
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
await mkdir('assets/models', { recursive: true });
await writeFile('assets/models/oregand-skyline.glb', await io.writeBinary(document));
