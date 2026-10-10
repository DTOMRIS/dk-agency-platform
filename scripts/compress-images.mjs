import sharp from 'sharp';
import { readdir, stat, writeFile } from 'fs/promises';
import { join, extname } from 'path';

const PUBLIC_DIR = 'public/images';
const MAX_WIDTH = 1920;
const MIN_SIZE = 100 * 1024;

async function getFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) files.push(...await getFiles(full));
    else files.push(full);
  }
  return files;
}

async function run() {
  const files = await getFiles(PUBLIC_DIR);
  const images = files.filter(f => /\.(png|jpg|jpeg)$/i.test(f));
  
  let totalBefore = 0, totalAfter = 0, count = 0;

  for (const file of images) {
    const s = await stat(file);
    if (s.size < MIN_SIZE) continue;
    
    totalBefore += s.size;
    const ext = extname(file).toLowerCase();
    
    try {
      const meta = await sharp(file).metadata();
      
      let pipeline = sharp(file).resize({ 
        width: Math.min(meta.width || MAX_WIDTH, MAX_WIDTH), 
        withoutEnlargement: true 
      });
      
      if (ext === '.png') {
        pipeline = pipeline.png({ quality: 80, compressionLevel: 9 });
      } else {
        pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true });
      }
      
      const buf = await pipeline.toBuffer();
      
      if (buf.length < s.size) {
        await writeFile(file, buf);
        totalAfter += buf.length;
        count++;
        const pct = ((1 - buf.length / s.size) * 100).toFixed(0);
        console.log(`OK ${file} ${(s.size/1024).toFixed(0)}KB > ${(buf.length/1024).toFixed(0)}KB (-${pct}%)`);
      } else {
        totalAfter += s.size;
      }
    } catch (err) {
      totalAfter += s.size;
      console.error(`ERR ${file} ${err.message}`);
    }
  }
  
  console.log(`\n=== TOPLAM ===`);
  console.log(`${count} dosya sikistirildi`);
  console.log(`Once: ${(totalBefore/1024/1024).toFixed(1)} MB`);
  console.log(`Sonra: ${(totalAfter/1024/1024).toFixed(1)} MB`);
  console.log(`Tasarruf: ${((totalBefore-totalAfter)/1024/1024).toFixed(1)} MB (-${((1-totalAfter/totalBefore)*100).toFixed(0)}%)`);
}

run().catch(console.error);
