<script setup lang="ts">
import { useAttrs } from "vue";
import { useVModel } from "@vueuse/core";
import { cn } from "@/lib/utils";

import SearchIcon from "@/assets/svg/search.svg";

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<{
  defaultValue?: string | number;
  modelValue?: string | number;
  type?: string;
  label?: string;
  valid?: boolean;
}>();

type EmitsType = (e: "update:modelValue", payload: typeof props.modelValue) => void;
const emits = defineEmits<EmitsType>();

const { class: className, ...rest } = useAttrs();

const modelValue = useVModel(props, "modelValue", emits, {
  passive: true,
  defaultValue: props.defaultValue,
});
</script>

<template>
  <div class="flex items-center">
    <SearchIcon
      v-if="props.type === 'search'"
      class="hugeicon absolute w-11 pl-[10px] mt-[2px]"
    />
    <div class="label-float w-full" :class="[{ 'pt-[4px]': props.type !== 'search' }]">
      <input
        v-model="modelValue"
        :type="type"
        :class="[
          cn(
            `
          flex h-9 w-full rounded-md border 
          border-input bg-transparent px-3 py-1 text-sm shadow-sm 
          transition-colors 
          
          file:border-0 file:bg-transparent file:text-sm file:font-medium 
          
          focus-visible:outline-none 
          focus-visible:ring-1 focus-visible:ring-ring 
          
          disabled:cursor-not-allowed disabled:opacity-50
          
          placeholder:text-muted-border`,
            className ?? ''
          ),
          { 'pl-[35px]': props.type === 'search' },
          { 'transparent-placeholder': label },
          {
            invalid:
              (rest['aria-invalid'] === props.valid) != undefined ? !props.valid : false,
          },
        ]"
        v-bind="rest"
        :placeholder="label ? '' : String(rest.placeholder)"
      />
      <label
        ><div class="bg" />
        <span>{{ label }}</span></label
      >
    </div>
  </div>
</template>

<style scoped lang="scss">
/* escalar hugeicon */
.hugeicon {
  transform: scale(0.52);
}

/* referido a l placeholder */
::placeholder {
  color: #3c403b;
  opacity: 1; /* Firefox */
}

.transparent-placeholder::placeholder {
  color: transparent;
}

/* Estilos para el efecto de etiqueta flotante en campos de entrada */
.label-float {
  position: relative;

  & input {
    border-radius: 5px;
    outline: none;
    min-width: 250px;
    font-size: 16px;
    transition: all 0.1s linear;

    /* Estilos para la etiqueta flotante al enfocar o cuando hay contenido en el campo */
    &:focus + label,
    &:not(:placeholder-shown) + label {
      color: hsl(var(--foreground));
    }

    /* Estilos al enfocar en el campo */
    &:focus {
      border: 1px solid #ccff55;
      --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 0px #ccff55;
    }

    /* Estilos para la etiqueta flotante al enfocar o cuando hay contenido en el campo */
    &:focus + label,
    &:not(:placeholder-shown) + label,
    &:-webkit-autofill ~ label {
      font-size: 13px;
      top: -7px;
      font-weight: 500;

      /* Estilo de fondo para la etiqueta flotante */
      .bg {
        background: hsl(var(--background));
        transition: 0.1s;
        width: 100%;
      }
    }

    &:focus + label {
      color: #ccff55;
    }

    /* Estilos para el autocompletado de navegadores */
    &:-webkit-autofill {
      -webkit-box-shadow: 0 0 0 30px #2c3b1d inset;
      -webkit-text-fill-color: #cce9af !important;
      color: #cce9af !important;
      border: 1px solid #ccff55;
    }

    /* Estilos para la etiqueta flotante en caso de autocompletado de navegadores */
    &:-webkit-autofill ~ label {
      color: #ccff55;
    }
  }

  /* Estilos para la etiqueta flotante */
  & label {
    pointer-events: none;
    position: absolute;
    top: calc(50% - 10px);
    left: 15px;
    transition: all 0.1s linear;
    color: #3c403b;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
    padding: 0px 4px;

    /* Estilo de fondo para la etiqueta flotante */
    .bg {
      margin-top: 3px;
      background-color: transparent;
      height: 1.9px;
      position: absolute;
      width: 90%;
      z-index: -1;
      transition: 0.1s;
    }
  }
}

.invalid {
  &:-webkit-autofill {
    -webkit-box-shadow: 0 0 0 30px #3b1d1d inset !important;
    -webkit-text-fill-color: #e9afaf !important;
  }

  &:not(:placeholder-shown) + label {
    color: red !important;
  }

  &:not(:placeholder-shown) {
    border-color: red !important;
  }

  &:focus {
    border-color: red !important;
    --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 0px red !important;
  }

  &:focus + label {
    color: red !important;
  }
}

input:focus {
  color: white;
}
</style>
