import { mkdir, copyFile, readdir, stat, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Script } from 'node:vm';

const root = process.cwd();
const out = path.join(root, 'dist');
await mkdir(path.join(out, 'src'), { recursive: true });
await mkdir(path.join(out, 'art'), { recursive: true });
await copyFile(path.join(root, 'index.html'), path.join(out, 'index.html'));
for (const file of await readdir(path.join(root, 'src'))) {
  if (/\.(js|css)$/.test(file)) await copyFile(path.join(root, 'src', file), path.join(out, 'src', file));
}
await copyFile(path.join(root, 'public/art/room-scene.jpg'), path.join(out, 'art/room-scene.jpg'));
const pageAssets=['story-page.png','story-wall.png','story-nail.png','laptop-front.png','laptop-sofa-patch.png','cat-front.png','cat-front-talking.png','cat-sofa-patch.png','book-front.png','book-open.png','book-floor-patch.png','wispr-flow-icon-light.png'];
for(const file of pageAssets) await copyFile(path.join(root,'public/art',file),path.join(out,'art',file));
const image = await stat(path.join(out, 'art/room-scene.jpg'));
// A portable preview uses the exact same sources, with assets embedded so a
// browser can open it directly without a server or file-origin fetches.
const sources = await Promise.all(['scene-config.js', 'scene-math.js', 'gaze-map.js', 'page-motion.js', 'page-magic.js', 'story-content.js', 'story-page.js', 'object-section.js', 'renderer.js', 'room.js']
  .map(file => readFile(path.join(root, 'src', file), 'utf8')));
const inlineScript = sources.map(source => source
  .replace(/^import .*;\n/gm, '')
  .replace(/^export /gm, '')).join('\n');
new Script(inlineScript,{filename:'preview-inline.js'});
const css = await readFile(path.join(root, 'src/room.css'), 'utf8');
const artwork = await readFile(path.join(out, 'art/room-scene.jpg'));
let preview = (await readFile(path.join(root, 'index.html'), 'utf8'))
  .replace(/    <link rel="preload"[^>]+>\n/, '')
  .replace('<link rel="stylesheet" href="./src/room.css" />', () => `<style>${css}</style>`)
  .replace('src="./art/room-scene.jpg"', () => `src="data:image/jpeg;base64,${artwork.toString('base64')}"`)
  .replace('<script type="module" src="./src/room.js"></script>', () => `<script>(() => {\n${inlineScript}\n})();</script>`);
for(const file of pageAssets) {
  const asset=await readFile(path.join(root,'public/art',file));
  preview=preview.replaceAll(`./art/${file}`,`data:image/png;base64,${asset.toString('base64')}`);
}
await writeFile(path.join(out, 'preview.html'), preview);
// Keep the previous calibration URL usable, with the same clean room preview.
await writeFile(path.join(out, 'gaze-grid.html'), preview);
console.log(`Built dist/ — no runtime dependencies; room artwork ${(image.size / 1024).toFixed(0)} KB.`);
