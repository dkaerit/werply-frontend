<script setup lang="ts">
// @ts-ignore
import { useStore } from "vuex";
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";

// shadcn y componentes
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import CharacterSwitcher from "@/components/elements/CharacterSwitcher.vue";

//assets
import HomeIcon from "@/assets/svg/home.svg";
import NotificationIcon from "@/assets/svg/notification.svg";
import UserIcon from "@/assets/svg/user.svg";
import MessageIcon from "@/assets/svg/message.svg";
import SettingIcon from "@/assets/svg/setting.svg";
import SquaresIcon from "@/assets/svg/squares.svg";

const store = useStore();
const router = useRouter();
const username = ref(store.state["USERS"].user?.username);
const pjname = ref(store.state["CHARACTERS"].currentCharacter?.nickname);
const dynamicProfile = computed(() =>
  store.state["CHARACTERS"].currentCharacter == null
    ? "/profile/user/" + username.value
    : "/profile/pj/" + pjname.value
);

const sidebarNavItems = computed(() => [
  { title: "Inicio", href: "/home", svg: HomeIcon },
  { title: "Notificaciones", href: "#", svg: NotificationIcon },
  { title: "Perfil", href: dynamicProfile.value, svg: UserIcon },
  { title: "Mensajes", href: "#", svg: MessageIcon },
  { title: "Werplaces", href: "#", svg: SquaresIcon },
  { title: "Configuración", href: "#", svg: SettingIcon },
]);

watch(
  () => store.state["CHARACTERS"].currentCharacter,
  (newCharacter) => {
    pjname.value = newCharacter?.nickname || "";
    router.replace("/home");
  }
);
</script>

<template>
  <!-- Franja superior -->
  <aside class="w-16 lg:w-auto">
    <div class="border-none">
      <div class="flex h-16 items-center px-4">
        <div class="hidden lg:block tracking-tight font-bold w-[238px]">
          <CharacterSwitcher />
        </div>
      </div>
    </div>

    <nav class="flex flex-col lg:space-x-0 lg:space-y-1 pr-2 lg:pl-5">
      <router-link v-for="item in sidebarNavItems" :to="{ path: item.href }">
        <Button
          variant="ghost"
          :key="item.title"
          :class="
            cn(
              'w-full text-left justify-start',
              $route.path === `${item.href}.html` && 'bg-muted hover:bg-muted'
            )
          "
        >
          <component :is="item.svg" class="navicon"></component>
          <span class="hidden lg:block pl-4">{{ item.title }}</span>
        </Button>
      </router-link>
    </nav>
  </aside>
</template>

<style scoped lang="scss">
.navicon {
  stroke: hsl(var(--foreground));
}
</style>
