<script setup lang="ts">
// @ts-ignore
import { useStore } from "vuex";
import { ref } from "vue";

import Loading from "@/components/elements/Loading.vue";
import GoogleIcon from "@/assets/svg/fill/google.svg";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast/use-toast";
import Toaster from "@/components/ui/toast/Toaster.vue";

import { Form, FormField, FormMessage } from "@/components/ui/form";

// Proceso de autenticación
const store = useStore();
const { toast } = useToast();
const isLoading = ref(false);
const identifier = ref("");
const password = ref("");

const loginActions = {
  email: "AUTH/AUTHENTICATION_ACTION_EMAIL",
  username: "AUTH/AUTHENTICATION_ACTION_USERNAME",
};

const actionsMap = {
  [loginActions.email]: {
    regex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    errorMessage: "Ingresa un correo electrónico válido.",
  },
  [loginActions.username]: {
    regex: /^\w{3,15}$/,
    errorMessage: "Ingresa un nombre de usuario válido.",
  },
};

const getLoginAction = (identifier: string) => {
  for (const [action, config] of Object.entries(actionsMap))
    if (config.regex.test(identifier)) return action;
  return loginActions.email; // Por defecto email
};

const login = async () => {
  try {
    // Lógica de inicio de sesión con correo electrónico/usuario y contraseña
    // Llama a la acción de autenticación del módulo de Vuex
    const action = getLoginAction(identifier.value);
    await store.dispatch(action, {
      identifier: identifier.value, // email o username
      password: password.value,
    });
  } catch (error) {
    if (error instanceof Error) {
      // Manejo de errores y muestra de Toast
      if (error.message) {
        // Si el error proviene del servidor, muestra el mensaje del servidor
        toast({
          title: "Error de autenticación",
          description: error.message,
        });
      } else {
        // Manejo de otros errores
        toast({
          title: "Error de autenticación",
          description: "Ocurrió un error durante la autenticación.",
        });
      }
    }
  }
};

const onSubmit = async (event: Event) => {
  event.preventDefault();
  isLoading.value = true;

  try {
    await login();
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div :class="cn('grid gap-6', $attrs.class ?? '')">
    <form @submit="onSubmit">
      <div class="grid gap-2">
        <div class="grid gap-1 mb-1">
          <!-- Email or username -->
          <FormField name="username">
            <Input
              label="Email o Usuario"
              id="identifier"
              type="text"
              v-model="identifier"
              :disabled="isLoading"
              :valid="true"
            />
            <FormMessage />
          </FormField>

          <FormField name="password">
            <Input
              label="Password"
              id="password"
              type="password"
              :disabled="isLoading"
              v-model="password"
              :valid="true"
            />
          </FormField>
        </div>
        <Button :disabled="isLoading">
          <Loading v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
          Siguiente
        </Button>
        <a href="/forgot-password" class="text-center text-sm"
          >¿Olvidaste tu contraseña?</a
        >
      </div>
    </form>
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
      Inicia sesión con Google
    </Button>
  </div>
  <div class="absolute"><Toaster /></div>
</template>
