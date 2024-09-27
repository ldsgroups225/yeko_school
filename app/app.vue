<script lang="ts" setup>
import {appName} from '~/constants'

useHead({
  title: appName,
})
</script>


<template>
  <VitePwaManifest/>
  <UMain>
    <NuxtLayout>
      <NuxtPage/>
    </NuxtLayout>
  </UMain>
</template>

<style>
html,
body,
#__nuxt {
  height: 100vh;
  margin: 0;
  padding: 0;
}

html.dark {
  background: #222;
  color: white;
}
</style>