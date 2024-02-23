<script setup lang="ts">
import { useVModel } from "@vueuse/core";
import { cn } from "@/lib/utils";

const props = defineProps<{
  defaultValue?: string | number;
  modelValue?: string | number;
}>();

type EmitsType = (e: "update:modelValue", payload: typeof props.modelValue) => void;
const emits = defineEmits<EmitsType>();

const modelValue = useVModel(props, "modelValue", emits, {
  passive: true,
  defaultValue: props.defaultValue,
});
</script>

<template>
  <textarea
    v-model="modelValue"
    :class="
      cn(
        'resize-none flex min-h-[60px] w-full rounded-md  bg-transparent px-3 py-2 text-sm placeholder:text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
        $attrs.class ?? ''
      )
    "
  />
</template>

<style scoped lang="scss">
::placeholder {
  color: hsl(var(--foreground));
  opacity: 0.35; /* Firefox */
}
</style>
