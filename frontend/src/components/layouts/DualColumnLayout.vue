<script setup lang="ts">
import Search from "@/components/elements/Search.vue";
import ThemeToggle from "@/components/elements/ThemeToggle.vue";
import ResponsiveContainerLayout from "@/components/layouts/ResponsiveContainerLayout.vue";
</script>

<template>
  <ResponsiveContainerLayout>
    <div class="flex">
      <!-- Dashboard -->
      <div class="flex-1 h-screen">
        <slot name="firstColumn" />
      </div>

      <!-- Segunda columna -->
      <div class="w-2/6 border-l hidden lg:block">
        <!-- Franja Cabecera (Searcher) -->
        <div>
          <div class="flex h-16 px-4 items-center justify-between">
            <Search />
            <div class="flex items-center pl-1">
              <!-- toogle button -->
              <ThemeToggle />
            </div>
          </div>
        </div>
        <!-- Contenido de debajo -->
        <div class="p-3 px-4"><slot name="secondColumn" /></div>
      </div>
    </div>
  </ResponsiveContainerLayout>
</template>
