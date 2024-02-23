<script setup lang="ts">
import { defineProps } from "vue";
import Loading from "@/components/elements/Loading.vue"

// Prop to determine if all posts are loaded
const { allPostsLoaded } = defineProps(["allPostsLoaded"]);

// Emit an event to notify the parent component to load more posts
</script>

<template>
  <div
    v-if="!allPostsLoaded"
    role="status"
    class="flex justify-center items-center gap-2 pt-2"
  >
    <Loading/>
    <div>Cargando...</div>
  </div>
</template>
