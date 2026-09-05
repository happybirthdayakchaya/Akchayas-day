/**
 * Shrinks the photos in public/assets/images for the web.
 *
 *   npm run optimize:images
 *
 * Your original file is never lost — the first run copies it to
 * `<name>.original.<ext>` and every run re-encodes *from that backup*, so it
 * is safe to run repeatedly without compounding compression artefacts.
 *
 * The `.original.*` files are only kept locally as a safety net; they are
 * git-ignored and are not part of the deployed site.
 */
import sharp from 'sharp'
import { readdir, copyFile, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const DIR = 'public/assets/images'
const MAX_WIDTH = 2200 // plenty for retina phones and desktops
const QUALITY = 82

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`

const files = (await readdir(DIR)).filter(
  (f) => /\.(jpe?g|png)$/i.test(f) && !f.includes('.original.'),
)

if (files.length === 0) {
  console.log(`No images found in ${DIR}`)
  process.exit(0)
}

for (const file of files) {
  const ext = path.extname(file)
  const base = path.basename(file, ext)
  const target = path.join(DIR, file)
  const backup = path.join(DIR, `${base}.original${ext}`)

  // Keep the untouched original once, then always encode from it.
  if (!existsSync(backup)) await copyFile(target, backup)

  const before = (await stat(backup)).size
  const meta = await sharp(backup).metadata()

  const pipeline = sharp(backup).resize({
    width: Math.min(MAX_WIDTH, meta.width ?? MAX_WIDTH),
    withoutEnlargement: true,
  })

  const out =
    ext.toLowerCase() === '.png'
      ? await pipeline.png({ compressionLevel: 9, palette: true }).toBuffer()
      : await pipeline.jpeg({ quality: QUALITY, mozjpeg: true, progressive: true }).toBuffer()

  await sharp(out).toFile(target)
  const after = (await stat(target)).size

  console.log(
    `${file}  ${meta.width}px → ${Math.min(MAX_WIDTH, meta.width ?? 0)}px   ` +
      `${kb(before)} → ${kb(after)}  (−${Math.round((1 - after / before) * 100)}%)`,
  )
}
