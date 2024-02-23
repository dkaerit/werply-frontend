<script setup lang="ts">
// @ts-ignore
import { useStore } from "vuex";
import { computed } from "vue";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// shadcn
import { FormField, FormMessage } from "@/components/ui/form";

// vee-validate/zod
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import * as z from "zod";

// reactivas
const store = useStore();
const emit = defineEmits(["submit"]);

const schema = toTypedSchema(
  z.object({
    nickname: z
      .string({ required_error: "El nickname no puede estar en blanco" })
      .min(3, { message: "Demasiado corto (mínimo 3 carácteres)" }),
    pjname: z
      .string({ required_error: "El nombre de personaje no puede estar en blanco" })
      .min(3, { message: "Demasiado corto (mínimo 3 carácteres)" }),
  })
);

const currentSchema = computed(() => schema);

const form = useForm({
  validationSchema: currentSchema,
}) as any;

const isValid = (key: string) => !(key in form.errors.value);

const createCharacter = async () => {
  if (form.values) {
    // Verifica si el formulario es válido antes de hacer la llamada al backend
    const isValidForm = await form.validate();
    if (isValidForm) {
      // Realiza la acción solo si el formulario es válido
      try {
        await store.dispatch("CHARACTERS/CHECK_NICKNAME_EXISTENCE", form.values.nickname);
        await store.dispatch("CHARACTERS/CREATE_CHARACTER", {
          nickname: form.values.nickname,
          pjname: form.values.pjname,
          ownerId: store.state["USERS"].user._id,
        });
        emit("submit");
      } catch (error) {
        form.setErrors({ nickname: "El nickname ya está en uso" });
        console.log(form.errors.value);
      }
    }
  }
};
</script>

<template>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Crear persoanje</DialogTitle>
      <DialogDescription>
        <br />
        <ul>
          <li>El personaje que crees estará vinculado a tu cuenta.</li>
          <li>El nombre será con lo que te muesres públicamente.</li>
          <li>El nickname será tu identificador de personaje único.</li>
        </ul>
      </DialogDescription>
    </DialogHeader>
    <div>
      <div class="space-y-4 py-2 pb-4">
        <div class="grid gap-1.5">
          <FormField v-slot="{ componentField }" name="pjname">
            <Input
              label="Nombre"
              type="text"
              id="name"
              v-bind="componentField"
              :valid="isValid('pjname')"
              :modelValue="form.values['pjname']"
            />
            <FormMessage />
          </FormField>
          <FormField v-slot="{ componentField }" name="nickname">
            <Input
              label="Nickname"
              type="text"
              id="nickname"
              v-bind="componentField"
              :valid="isValid('nickname')"
              :modelValue="form.values['nickname']"
            />
            <FormMessage />
          </FormField>
        </div>
      </div>
    </div>
    <DialogFooter>
      <Button type="submit" @click="createCharacter"> Crear </Button>
    </DialogFooter>
  </DialogContent>
</template>

<style scoped lang="scss">
ul {
  list-style-type: disc; /* o circle, square, etc. */
  padding-left: 20px; /* o el valor que desees */
}
</style>
