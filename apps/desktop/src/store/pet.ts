import { atom, computed } from 'nanostores'

import { $awaitingResponse, $busy } from '@/store/session'

/**
 * Petdex mascot state for the desktop floating pet.
 *
 * The spritesheet payload comes from the gateway `pet.info` RPC (shared with
 * the TUI). The animation *state* is derived here from the same activity
 * signals the chat already tracks, mirroring the priority order documented in
 * `agent/pet/state.py` so the Python and TS surfaces never drift.
 */

export type PetState = 'idle' | 'wave' | 'run' | 'failed' | 'review' | 'jump'

export interface PetInfo {
  enabled: boolean
  slug?: string
  displayName?: string
  mime?: string
  spritesheetBase64?: string
  frameW?: number
  frameH?: number
  framesPerState?: number
  loopMs?: number
  scale?: number
  stateRows?: string[]
}

export interface PetActivity {
  busy?: boolean
  awaitingInput?: boolean
  toolRunning?: boolean
  reasoning?: boolean
  error?: boolean
  justCompleted?: boolean
  celebrate?: boolean
}

/**
 * Resolve the animation state from coarse activity signals.
 *
 * Priority (highest first) mirrors `agent.pet.state.derive_pet_state`:
 * error → celebrate → justCompleted → toolRunning → reasoning → busy → idle.
 */
export function derivePetState(activity: PetActivity): PetState {
  if (activity.error) {
    return 'failed'
  }

  if (activity.celebrate) {
    return 'jump'
  }

  if (activity.justCompleted) {
    return 'wave'
  }

  if (activity.toolRunning) {
    return 'run'
  }

  if (activity.reasoning) {
    return 'review'
  }

  if (activity.busy) {
    return 'run'
  }

  return 'idle'
}

export const $petInfo = atom<PetInfo>({ enabled: false })
export const $petActivity = atom<PetActivity>({})

/** Steady activity flags (toolRunning / reasoning) set + cleared by the stream. */
export const setPetActivity = (next: Partial<PetActivity>) =>
  $petActivity.set({ ...$petActivity.get(), ...next })

let flashTimer: ReturnType<typeof setTimeout> | undefined

/** Fire a transient reaction beat (error / celebrate / justCompleted) that
 *  decays back to the steady state after `ms`. */
export const flashPetActivity = (next: Partial<PetActivity>, ms = 1600) => {
  setPetActivity(next)
  clearTimeout(flashTimer)
  flashTimer = setTimeout(
    () => setPetActivity({ celebrate: false, error: false, justCompleted: false }),
    ms
  )
}

export const setPetInfo = (info: PetInfo) => $petInfo.set(info)

/**
 * The live pet state. Derives from the dedicated activity atom when any of its
 * richer flags are set, otherwise falls back to the always-present chat
 * signals (`$busy` / `$awaitingResponse`) so the pet reacts out of the box
 * even before deeper tool/error wiring is added.
 */
export const $petState = computed(
  [$petActivity, $busy, $awaitingResponse],
  (activity, busy, awaiting): PetState => {
    const live = activity.busy ?? busy

    return derivePetState({
      busy: live,
      awaitingInput: activity.awaitingInput ?? awaiting,
      // Steady flags only count mid-turn — ignore stale ones once at rest so an
      // interrupted turn can't pin the pet on `run`/`review`.
      toolRunning: live && activity.toolRunning,
      reasoning: live && activity.reasoning,
      error: activity.error,
      justCompleted: activity.justCompleted,
      celebrate: activity.celebrate
    })
  }
)
