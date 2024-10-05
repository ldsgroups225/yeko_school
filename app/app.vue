<script lang="ts" setup>
import { appName } from '~/constants'

useHead({
  title: appName,
})
</script>

<template>
  <VitePwaManifest />
  <Main>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </Main>
</template>

<style>
html,
body,
#__nuxt {
  height: 100vh;
  margin: 0;
  padding: 0;
}

/* Base styles */
* {
  border-color: hsl(21, 30%, 50%);
}

body {
  background-image: linear-gradient(to bottom, hsl(21, 100%, 95%), white);
  color: hsl(21, 5%, 3%);
}

/* Light theme */
:root {
  --radius: 0.3rem;
}

/* Dark theme */
@media (prefers-color-scheme: dark) {
  body {
    background-image: linear-gradient(to bottom, hsla(21, 100%, 30%, 0.3), hsla(220, 17%, 17%, 0.3));
    color: hsl(21, 5%, 90%);
  }

  :root {
    --radius: 0.3rem;
  }
}
</style>
