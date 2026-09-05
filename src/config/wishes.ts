import { mediaUrl } from './media'

export type Orientation = 'portrait' | 'landscape'

export interface Wish {
  id: number
  /** Video source — portrait or landscape, both are handled. */
  src: string
  /** Person giving the wish — shown on screen. */
  name: string
  /** Optional one-line caption (relationship, place, a short note). */
  caption?: string
  /** Optional poster frame shown while the clip loads. */
  poster?: string
  /**
   * Optional. The player measures each clip and reshapes its frame
   * automatically, so you normally leave this alone. Set it only to declare
   * the shape up front and avoid the frame adjusting as the clip loads.
   */
  orientation?: Orientation
}

/** Shown until you fill in the real name for that slot. */
const LOVED_ONE = 'From someone who loves you'

/**
 * ─────────────────────────────────────────────────────────────────────
 *  ✏️  EDIT THIS LIST — the only thing you need to change here.
 *
 *  One entry per wish, in the order they should play. Entry 1 plays the
 *  clip at videos/wishes/01.mp4, entry 2 plays 02.mp4, and so on — through
 *  36.mp4. Add or remove entries freely; everything else follows this list.
 *
 *  Replace `LOVED_ONE` with the person's real name as you get each clip.
 *  `caption` is optional: "college roommate", "from Chennai", …
 *
 *  Mixed portrait and landscape clips are fine — the player measures each
 *  one and reshapes its frame to fit, so nothing is ever cropped. You can
 *  optionally add `orientation: 'landscape'` to declare it up front.
 * ─────────────────────────────────────────────────────────────────────
 */
const PEOPLE: { name: string; caption?: string; orientation?: Orientation }[] = [
  { name: LOVED_ONE }, // 01
  { name: LOVED_ONE }, // 02
  { name: LOVED_ONE }, // 03
  { name: LOVED_ONE }, // 04
  { name: LOVED_ONE }, // 05
  { name: LOVED_ONE }, // 06
  { name: LOVED_ONE }, // 07
  { name: LOVED_ONE }, // 08
  { name: LOVED_ONE }, // 09
  { name: LOVED_ONE }, // 10
  { name: LOVED_ONE }, // 11
  { name: LOVED_ONE }, // 12
  { name: LOVED_ONE }, // 13
  { name: LOVED_ONE }, // 14
  { name: LOVED_ONE }, // 15
  { name: LOVED_ONE }, // 16
  { name: LOVED_ONE }, // 17
  { name: LOVED_ONE }, // 18
  { name: LOVED_ONE }, // 19
  { name: LOVED_ONE }, // 20
  { name: LOVED_ONE }, // 21
  { name: LOVED_ONE }, // 22
  { name: LOVED_ONE }, // 23
  { name: LOVED_ONE }, // 24
  { name: LOVED_ONE }, // 25
  { name: LOVED_ONE }, // 26
  { name: LOVED_ONE }, // 27
  { name: LOVED_ONE }, // 28
  { name: LOVED_ONE }, // 29
  { name: LOVED_ONE }, // 30
  { name: LOVED_ONE }, // 31
  { name: LOVED_ONE }, // 32
  { name: LOVED_ONE }, // 33
  { name: LOVED_ONE }, // 34
  { name: LOVED_ONE }, // 35
  { name: LOVED_ONE }, // 36
]

/** Built from the list above — no need to touch this. */
export const wishes: Wish[] = PEOPLE.map((person, i) => {
  const nn = String(i + 1).padStart(2, '0')
  return {
    id: i + 1,
    src: mediaUrl(`videos/wishes/${nn}.mp4`),
    name: person.name,
    caption: person.caption ?? '',
    orientation: person.orientation,
  }
})
