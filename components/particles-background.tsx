'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTheme } from 'next-themes'
import type { ISourceOptions } from '@tsparticles/engine'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'

export function ParticlesBackground() {
  const { resolvedTheme } = useTheme()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => setReady(true))
  }, [])

  const options: ISourceOptions = useMemo(() => {
    const isDark = resolvedTheme === 'dark'

    // 颜色随主题变化（更柔和，避免抢 UI）
    const particle = isDark ? '#94a3b8' : '#64748b' // slate-400 / slate-500
    const link = isDark ? 'rgba(148, 163, 184, 0.25)' : 'rgba(100, 116, 139, 0.25)'

    return {
      fullScreen: { enable: false },
      fpsLimit: 60,
      detectRetina: true,
      background: {
        color: { value: 'transparent' },
      },
      interactivity: {
        // 让粒子监听 window 的鼠标事件，这样即使粒子层在内容下方也能交互
        detectsOn: 'window',
        events: {
          onHover: { enable: true, mode: 'grab' },
          onClick: { enable: true, mode: 'push' },
          resize: true,
        },
        modes: {
          grab: {
            distance: 140,
            links: { opacity: 0.35 },
          },
          push: { quantity: 2 },
        },
      },
      particles: {
        number: {
          value: 55,
          density: { enable: true, area: 900 },
        },
        color: { value: particle },
        links: {
          enable: true,
          color: link,
          distance: 150,
          opacity: 0.35,
          width: 1,
        },
        move: {
          enable: true,
          speed: 0.6,
          direction: 'none',
          outModes: { default: 'out' },
        },
        opacity: { value: 0.45 },
        size: { value: { min: 1, max: 2 } },
      },
    }
  }, [resolvedTheme])

  if (!ready) return null

  return <Particles id="tsparticles" options={options} className="h-full w-full" />
}

