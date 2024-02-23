<template>
  <div>
    <svg
      class="squircle relative z-10"
      :width="size"
      :height="size"
      viewBox="0 0 200 200"
    >
      <defs>
        <pattern
          :id="id.toString()"
          patternUnits="userSpaceOnUse"
          width="200"
          height="200"
        >
          <image
            id="custom"
            v-if="props.src"
            :xlink:href="props.src"
            x="0"
            y="0"
            width="200"
            height="200"
          />
          <image
            id="default"
            v-else
            :xlink:href="image"
            x="0"
            y="0"
            width="200"
            height="200"
          />
        </pattern>
      </defs>

      <path
        d="M100,200c43.8,0,68.2,0,84.1-15.9C200,168.2,200,143.8,200,100s0-68.2-15.9-84.1C168.2,0,143.8,0,100,0S31.8,0,15.9,15.9C0,31.8,0,56.2,0,100s0,68.2,15.9,84.1C31.8,200,56.2,200,100,200z"
        :fill="`url(#${id})`"
      />
    </svg>
    <svg
      v-if="bg"
      class="absolute z-0 translate-y-[calc(-100%+5px)] translate-x-[-5px]"
      :width="bgsize"
      :height="bgsize"
      viewBox="0 0 200 200"
    >
      <path
        d="M100,200c43.8,0,68.2,0,84.1-15.9C200,168.2,200,143.8,200,100s0-68.2-15.9-84.1C168.2,0,143.8,0,100,0S31.8,0,15.9,15.9C0,31.8,0,56.2,0,100s0,68.2,15.9,84.1C31.8,200,56.2,200,100,200z"
        class="svgfill-background svgstroke-background"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, onBeforeMount, watch } from "vue";

const props = defineProps({
  size: {
    type: String,
    default: "45px",
  },
  src: String,
  name: String,
  bg: Boolean,
});

const id = ref("");
const image = ref("");
const bgsize = ref(parseInt(props.size) + 10 + "px");

function extractNameId(): string {
  return props.src?.match(/\/([^/]+)\.(png|jpg|webp)$/)?.[1] ?? "default"; // pe. dk.png -> dk
}

onBeforeMount(async () => {
  id.value = props.src ? extractNameId() : props.name || "werply";
  const werplypfp = await import("@/assets/avatares/pfp-traslucid.png");
  image.value = werplypfp.default; // or https://avatar.vercel.sh/${id.value}.png
});

watch(
  () => props.src,
  () => {
    id.value = props.src ? extractNameId() : props.name || "werply";
  }
);
</script>

<style lang="scss" scoped>
.squircle {
  height: v-bind("$props.size");
  width: v-bind("$props.size");
}
</style>
