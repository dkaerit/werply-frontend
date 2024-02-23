<template>
  <ol data-te-stepper-init class="flex">
    <li
      v-for="(_, index) in props.nodes"
      :key="index"
      class="relative"
      :class="{
        grow: index != nodes - 1,
      }"
    >
      <div class="flex items-center">
        <div
          data-te-stepper-head-icon-ref
          class="w-8 mx-2 h-8 font-medium rounded-full flex items-center justify-center"
          :class="{
            'bg-[#fff] text-[#000]': index + 1 <= props.current,
            'bg-[#1f201f] text-[#5c5c5c]': index + 1 > props.current,
          }"
        >
          {{ index + 1 }}
        </div>
        <div
          v-if="index !== props.nodes - 1"
          class="flex-grow border-t"
          :class="{
            'border-[#fff] border-1': index < props.current - 1,
            'border-[#2b2d2b] border-1': index == props.current - 1,
          }"
        ></div>
      </div>
    </li>
  </ol>
  <transition :name="direction + '-slide-fade'" mode="out-in">
    <div :key="'step' + props.current" class="step-content">
      <slot :name="'step' + props.current" />
    </div>
  </transition>
</template>

<script setup lang="ts">
import { defineProps } from "vue";

const props = defineProps<{
  nodes: number;
  current: number;
  direction: string;
}>();
</script>

<style scoped>
.left-slide-fade-enter-active,
.right-slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.left-slide-fade-enter-active,
.right-slide-fade-leave-active {
  transition: all 0.3s ease-out;
}

.left-slide-fade-leave-to,
.right-slide-fade-enter-from {
  transform: translateX(-30px);
  opacity: 0;
}

.left-slide-fade-enter-from,
.right-slide-fade-leave-to {
  transform: translateX(30px);
  opacity: 0;
}
</style>
