<script setup lang="ts">
// @ts-ignore
import { useStore } from "vuex";
import { ref, watch, onMounted, computed } from "vue";

// otros
import GoogleIcon from "@/assets/svg/fill/google.svg";

import { useToast } from "@/components/ui/toast/use-toast";

// shadcn
import { FormField, FormMessage } from "@/components/ui/form";
import Toaster from "@/components/ui/toast/Toaster.vue";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Componentes .vue
import Stepper from "@/components/elements/Stepper.vue";
import Loading from "@/components/elements/Loading.vue";

// zod y vee-validate
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import * as z from "zod";

const currentStep = ref(0);
const isLoading = ref(false);
const slideSide = ref("right");
const store = useStore();
const { toast } = useToast();

// zod
const schemas = [
  toTypedSchema(
    z.object({
      email: z
        .string({ required_error: "El email no puede estar en blanco" })
        .email({ message: "Debe ser un email válido" })
        .refine(
          async () =>
            !(await store.dispatch("AUTH/CHECK_EMAIL_EXISTENCE", form.values.email)),
          { message: "El email ya está en uso" }
        ),
      username: z
        .string({ required_error: "El nombre de usuario no puede estar en blanco" })
        .min(4, { message: "Demasiado corto (mínimo 4 carácteres)" })
        .refine(
          async () =>
            !(await store.dispatch(
              "AUTH/CHECK_USERNAME_EXISTENCE",
              form.values.username
            )),
          { message: "El nombre de usuario ya está en uso" }
        ),
    })
  ),
  toTypedSchema(
    z.object({
      password1: z
        .string({ required_error: "El campo de la contraseña no puede estar vacío" })
        .refine((password) => /\d/.test(password), {
          message: "Debe incluir al menos un número",
        })
        .refine((password) => /[a-z]/.test(password), {
          message: "Debe incluir al menos una letra minúscula",
        })
        .refine((password) => !/(qwerty)|\d{4}/i.test(password), {
          message: "No puede utilizar patrones de teclado o números en secuencia",
        })
        .refine(
          (password) =>
            /^(?!^\d+$)(?!^[A-Z]+$)(?!^[a-z]+$)(?!^.*([A-Za-z0-9])\1{2,}).*$/.test(
              password
            ),
          {
            message:
              "La contraseña no puede consistir únicamente en números, mayúsculas o minúsculas, ni contener caracteres repetidos",
          }
        ),
      password2: z
        .string({ required_error: "El campo de la contraseña no puede estar vacío" })
        .refine(() => form.values.password1 === form.values.password2, {
          message: "La contraseña no coincide",
        }),
    })
  ),
];

const currentSchema = computed(() => schemas[currentStep.value]);

const form = useForm({
  validationSchema: currentSchema,
  keepValuesOnUnmount: true,
}) as any;

const nextStep = async (event: Event) => {
  event.preventDefault();
  await form.validate();

  // Si no hubo errores en la validación (form.errors == {})
  if (Object.keys(form.errors.value).length === 0) currentStep.value++;
  else {
    toast({
      title: `Error en el formulario`,
      description: `Los siguientes errores fueron encontrados: ${Object.values(
        form.errors.value
      ).join(", ")}`,
    });
  }
};

const backStep = () => {
  slideSide.value = "left";
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

const registerUser = async () => {
  try {
    // Realiza la acción de registro llamando a la nueva acción en la store
    isLoading.value = true;
    await store.dispatch("AUTH/REGISTER_USER", {
      avatar: "",
      email: form.values.email,
      nickname: form.values.username,
      username: form.values.username,
      passwd: form.values.password2,
    });
    await store.dispatch("AUTH/AUTHENTICATION_ACTION_EMAIL", {
      identifier: form.values.email,
      password: form.values.password2,
    });
    isLoading.value = false;
  } catch (error) {
    isLoading.value = false;
    if (error instanceof Error) {
      // Manejo de errores y muestra de Toast
      if (error.message) {
        toast({
          title: "Error en el registro",
          description: error.message,
        });
      } else {
        // Manejo de otros errores
        toast({
          title: "Error en el registro",
          description: "Ocurrió un error durante el registro.",
        });
      }
    }
  }
};

onMounted(async () => {
  currentStep.value = 0;
});

watch(
  () => form.errors.value,
  async () => {}
);

const isValid = (key: string) => !(key in form.errors.value);
</script>

<template>
  <div class="h-[350px] flex flex-col gap-5">
    <Stepper :nodes="3" :current="currentStep + 1" :direction="slideSide">
      <!-- BEGIN STEP 1 -->
      <template #step1>
        <div :class="cn('grid gap-6', $attrs.class ?? '')">
          <div class="grid gap-3">
            <div class="grid gap-1">
              <FormField v-slot="{ componentField }" name="email">
                <Input
                  label="Email"
                  id="email"
                  type="email"
                  v-bind="componentField"
                  :valid="isValid('email')"
                  :modelValue="form.values['email']"
                />
                <FormMessage />
              </FormField>

              <FormField v-slot="{ componentField }" name="username">
                <Input
                  label="Username"
                  id="username"
                  type="text"
                  v-bind="componentField"
                  :valid="isValid('username')"
                  :modelValue="form.values['username']"
                />
                <FormMessage />
              </FormField>
            </div>
            <Button :disabled="isLoading" @click="nextStep">
              <Loading v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
              Siguiente
            </Button>
          </div>
          <!-- parte de abajo: Google, etc -->
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <span class="w-full border-t" />
            </div>
            <div class="relative flex justify-center text-xs uppercase">
              <span class="bg-background px-2 text-muted-foreground"> o </span>
            </div>
          </div>

          <Button variant="outline" type="button" :disabled="isLoading">
            <GoogleIcon class="svgfill-foreground mr-2 h-[0.875rem] w-[0.875rem]" />
            Regístrate con Google
          </Button>
        </div>
      </template>
      <!-- END STEP 1 -->
      <!-- BEGIN STEP 2 -->
      <template #step2>
        <div class="flex flex-col gap-1">
          <FormField v-slot="{ componentField }" name="password1">
            <Input
              label="Contraseña"
              id="password1"
              type="password"
              :disabled="isLoading"
              v-bind="componentField"
              :valid="isValid('password1')"
              :modelValue="form.values['password1']"
            />
            <FormMessage />
          </FormField>

          <FormField v-slot="{ componentField }" name="password2">
            <Input
              label="Confirmar contraseña"
              id="password2"
              type="password"
              :disabled="isLoading"
              v-bind="componentField"
              :valid="isValid('password2')"
              :modelValue="form.values['password2']"
            />
            <FormMessage />
          </FormField>
        </div>
        <br />
        <div class="flex gap-x-2">
          <Button @click="backStep" variant="outline" type="button" :disabled="isLoading">
            Volver
          </Button>
          <Button @click="nextStep" variant="outline" :disabled="isLoading">
            <Loading v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
            Siguiente
          </Button>
        </div>
      </template>
      <!-- END STEP 2 -->
      <!-- BEGIN STEP 3 -->
      <template #step3>
        <ul>
          <li><strong>Email:</strong> {{ form.values["email"] }}</li>
          <li><strong>Usuario:</strong> {{ form.values["username"] }}</li>
          <!-- No muestres las contraseñas por razones de seguridad -->
        </ul>
        <br />
        <div class="flex gap-x-2">
          <Button @click="backStep" variant="outline" type="button" :disabled="isLoading">
            Volver
          </Button>
          <Button @click="registerUser" :disabled="isLoading" type="submit">
            <Loading v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
            Confirmar
          </Button>
        </div>
      </template>
      <!-- BEGIN STEP 3 -->
    </Stepper>
  </div>
  <div class="absolute"><Toaster /></div>
</template>
