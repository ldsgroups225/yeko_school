<template>
  <main class="flex flex-col w-full">
    <div class="shadow-sm sticky top-0 z-10">
      <div class="bg-primary h-1" />
      <div class="bg-blue-600 h-3 mx-12 rounded-b-lg" />
    </div>
    <div class="flex flex-col h-full overflow-y-auto p-6">
      <slot />
    </div>
  </main>
</template>
