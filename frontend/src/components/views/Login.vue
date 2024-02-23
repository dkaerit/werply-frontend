<script setup lang="ts">
import UserAuthForm from "@/components/elements/UserAuthForm.vue";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import LogoMiniIcon from "@/assets/svg/fill/logo-mini.svg";

const quotes = [
  {
    text:
      "La imaginación es la llave que abre la puerta a mundos inexplorados de posibilidad.",
    author: "J.R.R. Tolkien",
  },
  {
    text: "El acto de escribir es el acto de descubrir lo que uno piensa.",
    author: "David Hare",
  },
  {
    text:
      "La imaginación es más importante que el conocimiento. Porque el conocimiento está limitado, mientras que la imaginación abraza el mundo entero.",
    author: "Albert Einstein",
  },
  {
    text: "La imaginación es la única arma en la guerra contra la realidad.",
    author: "Lewis Carroll",
  },
  {
    text: "El escritor es un mundo atrapado en una persona.",
    author: "Victor Hugo",
  },
  {
    text: "Un lector vive mil vidas antes de morir… Aquel que no lee sólo vive una",
    author: "George R.R. Martin",
  },
  {
    text:
      "Los juegos de rol son concursos en los que los jugadores suelen cooperar como grupo para lograr un objetivo común en lugar de competir para eliminarse unos a otros.",
    author: "Gary Gaygax",
  },
  {
    text:
      "Representar el género es asumir un papel, siendo nuestra actuación la clave para expresar y presentar al mundo quiénes somos.",
    author: "Judith Butler",
  },
];

const crypto = window.crypto;
const array = new Uint32Array(1);
crypto.getRandomValues(array);
const randomIndex = array[0] % quotes.length;
const randomQuote = quotes[randomIndex];
</script>

<template>
  <div
    class="container relative hidden h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0"
  >
    <router-link
      to="/register"
      :class="
        cn(
          buttonVariants({ variant: 'ghost' }),
          'absolute right-4 top-4 md:right-8 md:top-8'
        )
      "
    >
      ¡Registrate!
    </router-link>
    <div
      class="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex"
    >
      <div class="bg-lat absolute inset-0 bg-zinc-900" />
      <div class="relative z-20 flex items-center text-lg font-medium">
        <LogoMiniIcon class="svgfill-foreground mr-2" />
        <!-- Icon -->
        Werply
      </div>
      <div class="relative z-20 mt-auto">
        <blockquote class="space-y-2">
          <p class="text-lg">&ldquo;{{ randomQuote.text }}&rdquo;</p>
          <footer class="text-sm">
            {{ randomQuote.author }}
          </footer>
        </blockquote>
      </div>
    </div>
    <div class="lg:p-8">
      <div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div class="flex flex-col space-y-2 text-center">
          <h1 class="text-2xl font-semibold tracking-tight">¡Inicia sesión en Werply!</h1>
          <p class="text-sm text-muted-foreground">
            Ingrese su email y contraseña a continuación
          </p>
        </div>
        <UserAuthForm />
        <p class="px-8 text-center text-sm text-muted-foreground">
          Al hacer clic en continuar, aceptas nuestra
          <a href="/terms" class="underline underline-offset-4 hover:text-primary">
            Términos de servicio
          </a>
          y
          <a href="/privacy" class="underline underline-offset-4 hover:text-primary">
            Políticas de privacidad
          </a>
          .
        </p>
      </div>
    </div>
  </div>
</template>
