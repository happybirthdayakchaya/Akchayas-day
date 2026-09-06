import { mediaUrl } from './media'

/**
 * ─────────────────────────────────────────────────────────────────────
 *  THE ONLY FILE YOU NEED TO EDIT FOR CONTENT.
 *  Names, messages, dates, media paths, toggles — all here.
 *  UI components read from this; they never hardcode copy.
 * ─────────────────────────────────────────────────────────────────────
 */

export interface Chapter {
  /** e.g. "Chapter One" */
  label: string
  /** e.g. "A little surprise" */
  title: string
}

export interface Content {
  person: {
    name: string
    /** Optional pet name; falls back to `name` wherever it is used. */
    nickname: string
    milestoneAge: number
  }
  /** Midnight, in the birthday person's timezone (ISO with offset). */
  birthdayISO: string
  /**
   * The moment she was actually born — drives the live "you've been here for
   * X days, hours, minutes" counter. Set the real time of birth if you know
   * it; otherwise midnight is fine.
   */
  birthDateISO: string
  signature: string

  flags: {
    /** Auto-advance from one wish to the next. */
    autoAdvanceWishes: boolean
    /** Gap (ms) between wishes when auto-advancing. */
    wishGapMs: number
    /** Let the viewer skip the special video / individual wishes. */
    allowSkip: boolean
    /** Persist the current scene across refreshes (per browser session). */
    resume: boolean
    /** Show a discreet share control on the finale. */
    shareEnabled: boolean
    /** How long a chapter title card stays on screen (ms). */
    chapterDurationMs: number
    /**
     * true  → music fully stops while a video plays (voices stay crystal clear)
     * false → music merely dips underneath the video
     */
    pauseMusicDuringVideo: boolean
    /** Little synthesised sounds on the interactive moments. */
    soundEffects: boolean
  }

  media: {
    landscapeImage: string
    music: string
    specialVideo: string
  }

  copy: {
    /** The "3 · 2 · 1" pre-roll. `skip` shows only on a repeat visit. */
    countIn: { skip: string }
    opening: { whisper: string; button: string }
    photo: { caption: string; cta: string }
    reveal: { headline: string; message: string; cute: string; cta: string }
    numbers: { line: string; sub: string; cta: string }
    cake: {
      line: string
      hint: string
      wish: string
      cutHint: string
      cutDone: string
      cta: string
    }
    gift: { line: string; hint: string; opened: string; cta: string }
    special: { afterVideo: string; afterCta: string }
    wishesIntro: { line: string; cta: string }
    wishes: { counterOf: string }
    scratch: { line: string; hint: string; message: string; cta: string }
    letter: { greeting: string; body: string; signOff: string; signedBy: string; cta: string }
    finale: {
      headline: string
      message: string
      replay: string
      shareText: string
      tapHint: string
    }
    /** Full-screen story beats shown between the big scenes. */
    chapters: Chapter[]
  }

  /** Easter egg: a private note revealed by the hidden rose in the finale. */
  secretNote: string
}

export const content: Content = {
  person: {
    name: 'Akchaya',
    nickname: '', // ← add her pet name here; blank = use the real name
    milestoneAge: 30,
  },
  // 12 September 2026, 00:00 IST.
  birthdayISO: '2026-09-12T00:00:00+05:30',
  // Turning 30 on 12 Sep 2026 → born 12 Sep 1996.
  // ← put her real time of birth here if you know it, e.g. T04:15:00+05:30
  birthDateISO: '1996-09-12T00:00:00+05:30',
  signature: 'From all of us',

  flags: {
    autoAdvanceWishes: true,
    // 0 = the next wish starts the instant the previous one ends.
    wishGapMs: 0,
    allowSkip: true,
    resume: true,
    shareEnabled: true,
    chapterDurationMs: 3200,
    pauseMusicDuringVideo: true,
    soundEffects: true,
  },

  media: {
    landscapeImage: mediaUrl('images/landscape-collage.jpg'),
    music: mediaUrl('audio/birthday-music.mp3'),
    specialVideo: mediaUrl('videos/special-video.mp4'),
  },

  copy: {
    countIn: { skip: 'skip intro' },

    opening: {
      whisper: 'for someone truly special',
      button: 'Open Your Surprise ❤️',
    },

    photo: {
      caption: 'Some moments deserve to be remembered.',
      cta: 'Keep going ❤️',
    },

    reveal: {
      headline: 'Happy Birthday Akchaya KP❤️',
      message:
        "Thirty years of being wonderfully you and today the whole world feels a little softer, a little brighter, simply because it's yours.",
      cute: 'Yes… All of this is for you.',
      cta: 'Do you know how long? ❤️',
    },

    numbers: {
      line: 'You’ve been here for',
      sub: 'Thirty years of mornings and the world has been a kinder place in every single one of them.',
      cta: 'Now, the cake 🎂',
    },

    cake: {
      line: 'Thirty candles, all for you.',
      hint: 'Tap the cake to blow them out',
      wish: 'Wish made. ✨',
      cutHint: 'Now cut the cake 🔪',
      cutDone: 'Happy Birthday Akchayaa! 🎉',
      cta: 'What’s next? ❤️',
    },

    gift: {
      line: 'This one has your name on it.',
      hint: 'Tap to unwrap',
      opened: 'It’s something we made for you.',
      cta: 'Play it ❤️',
    },

    special: {
      afterVideo: 'That was only the beginning.',
      afterCta: 'Ready for 36 more wishes? ❤️',
    },

    wishesIntro: {
      line: '36 loving wishes from those far away.',
      cta: 'Play the wishes ❤️',
    },

    wishes: {
      counterOf: 'of',
    },

    scratch: {
      line: 'One last thing…',
      hint: 'Scratch to reveal 🌹',
      // ← Replace with your own private message to her.
      message:
        'Of all the thirty years the world got to enjoy you, ' +
        'the best ones have been the ones I got to spend beside you.',
      cta: 'I’m ready ❤️',
    },

    letter: {
      greeting: 'My dearest Akchaya,',
      // ← Replace this with your own words. It writes itself out on screen,
      //   so shorter, warmer sentences land better than long paragraphs.
      body:
        'I have watched you turn ordinary days into something worth remembering, ' +
        'again and again, without ever seeming to try.\n\n' +
        '30 years ago the world got you and somewhere along the way I got ' +
        'unreasonably lucky. Every quiet morning, every terrible joke, every time ' +
        'you laugh before the sentence is finished that is the life I wanted, ' +
        'and I get to have it with you.\n\n' +
        'Happy birthday, my love. Here is to every year still coming..',
      signOff: 'Always yours,',
      signedBy: 'Karthik', // ← your name (blank hides this line)
      cta: 'One last thing ❤️',
    },

    finale: {
      headline: 'Happy Birthday Once Again, Akchaya (Panda😂❤️)',
      message:
        'You make ordinary days feel like celebrations.. So today, we are simply returning the favour. ' +
        'Here is to thirty years of your laugh, your kindness, and the way you love everyone around you. ' +
        'May this year be even half as beautiful as you make everyone else’s.',
      replay: 'Experience It Again ❤️',
      shareText: 'Happy Birthday Akchaya KP! ❤️',
      tapHint: 'tap anywhere for fireworks ✨',
    },

    // One card per chapter, in story order.
    chapters: [
      { label: 'Chapter One', title: 'A little surprise' },
      { label: 'Chapter Two', title: 'The day the world got luckier' },
      { label: 'Chapter Three', title: 'Something just for you' },
      { label: 'Chapter Four', title: 'Everyone who loves you' },
      { label: 'The Last Chapter', title: 'And always, you' },
    ],
  },

  secretNote:
    'You found the hidden rose. 🌹 Of everything I could ever wish for, ' +
    'I already have it — it’s you. Happy 30th, my love.',
}

/** Convenience: the display name used in warm, personal copy. */
export const displayName = content.person.nickname || content.person.name
