<script setup lang="ts">
import SidebarNav from "./partials/SidebarNav.vue";
</script>

<template>
  <div class="flex">
    <!-- Primera columna -->
    <div class="hidden md:block border-r">
      <SidebarNav />
    </div>

    <!-- Segunda columna -->
    <div class="flex-auto">
      <router-view />
    </div>
  </div>
</template>
