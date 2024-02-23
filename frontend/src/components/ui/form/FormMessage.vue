<script lang="ts" setup>
import { ErrorMessage } from "vee-validate";
import { toValue } from "vue";
import { useFormField } from "./useFormField";

const { name, formMessageId } = useFormField();
</script>

<template>
  <div class="mt-[2px!important]">
    <ErrorMessage
      :id="formMessageId"
      as="p"
      :name="toValue(name)"
      class="text-[0.725rem] font-medium text-destructive"
    />
  </div>
</template>
