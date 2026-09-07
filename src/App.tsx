import { ExperienceProvider } from '@/context/ExperienceProvider'
import { AudioProvider } from '@/context/AudioProvider'
import { Background } from '@/components/ambient/Background'
import { PetalCanvas } from '@/components/ambient/PetalCanvas'
import { TouchTrail } from '@/components/ambient/TouchTrail'
import { SceneManager } from '@/components/SceneManager'
import { MusicToggle } from '@/components/ui/MusicToggle'

export default function App() {
  return (
    <ExperienceProvider>
      <AudioProvider>
        <div className="relative w-full">
          <Background />
          <PetalCanvas />
          <main className="relative" style={{ zIndex: 10 }}>
            <SceneManager />
          </main>
          <MusicToggle />
          {/* Petals following her finger, everywhere in the story. */}
          <TouchTrail />
        </div>
      </AudioProvider>
    </ExperienceProvider>
  )
}
