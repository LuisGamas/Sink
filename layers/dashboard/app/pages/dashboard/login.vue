<script setup lang="ts">
import { GitHubIcon, XIcon } from 'vue3-simple-icons'

definePageMeta({
  layout: false,
})

const { title, github, twitter } = useAppConfig()
</script>

<template>
  <div class="relative flex min-h-svh flex-col bg-background">
    <div
      class="pointer-events-none absolute inset-0"
      :style="{
        backgroundImage: 'linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)',
        backgroundSize: '2rem 2rem',
        maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
      }"
    />

    <header class="relative z-10 flex items-center justify-between px-6 py-4">
      <NuxtLink
        to="/"
        :title="title"
        aria-label="home"
        class="flex items-center gap-2"
      >
        <img
          src="/sink.png"
          :alt="`${title} Logo`"
          class="size-7 rounded-full"
        >
        <span class="text-lg font-bold">{{ title }}</span>
      </NuxtLink>

      <div class="flex items-center gap-1">
        <SwitchLanguage />
        <SwitchTheme />
      </div>
    </header>

    <main class="relative z-10 flex flex-1 items-center justify-center px-4">
      <Login />
    </main>

    <footer class="relative z-10 flex items-center justify-between px-6 py-4">
      <div class="flex items-center gap-2">
        <img
          src="/sink.png"
          :alt="`${title} Logo`"
          class="size-5 rounded-full opacity-60"
        >
        <small class="text-xs text-muted-foreground">
          &copy; {{ new Date().getFullYear() }}
          <a
            href="https://sink.gamas.workers.dev/gamas-website"
            target="_blank"
            title="Gamas"
            class="hover:text-primary"
          >
            Gamas
          </a>
        </small>
      </div>

      <div class="flex items-center gap-1">
        <Button
          v-if="twitter"
          variant="ghost"
          size="icon"
          as="a"
          :href="twitter"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Twitter"
        >
          <XIcon class="size-4" />
        </Button>
        <Button
          v-if="github"
          variant="ghost"
          size="icon"
          as="a"
          :href="github"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
        >
          <GitHubIcon class="size-4" />
        </Button>
      </div>
    </footer>
  </div>
</template>
