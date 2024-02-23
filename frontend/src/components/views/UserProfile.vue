<script setup lang="ts">
// @ts-ignore
import { useStore } from "vuex";
import { ref, onBeforeMount, watch, computed } from "vue";
import { useRouter } from "vue-router";
import ResponsiveContainerLayout from "@/components/layouts/ResponsiveContainerLayout.vue";
import SquircleAvatar from "@/components/elements/SquircleAvatar.vue";
import { Button } from "@/components/ui/button";
import { MutualData } from "@/store/mutuals/mutuals.interface.ts";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { XOctagon, Camera } from "lucide-vue-next";
import { Input } from "@/components/ui/input";
import Squircle from "@/assets/svg/squircle.svg";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface User {
  _id: string;
  nickname: string;
  header: string;
  avatar: string;
}

const store = useStore();
const userParam = ref<User | null>(null);
const router = useRouter();
const currentUser = ref(store.getters["USERS/getSelected"]);
const currentType = ref(store.getters["USERS/getTypeSelected"]);

const headerUrl = ref<string | undefined>(undefined);
const avatarUrl = ref<string | undefined>(undefined);
const tempHeaderUrl = ref<string | undefined>(undefined);
const tempAvatarUrl = ref<string | undefined>(undefined);
const isEditing = ref<boolean>(false);

const switchEditMode = () => {
  isEditing.value = true;
  tempHeaderUrl.value = headerUrl.value;
  tempAvatarUrl.value = avatarUrl.value;
};

const cancelEdit = () => {
  isEditing.value = false;
  // Descartar los cambios y revertir a las imágenes originales al cancelar
  tempHeaderUrl.value = headerUrl.value;
  tempAvatarUrl.value = avatarUrl.value;
};

const confirmEdit = async () => {
  isEditing.value = false;
  // Traspasar las imágenes temporales a las versiones originales al confirmar
  headerUrl.value = tempHeaderUrl.value;
  avatarUrl.value = tempAvatarUrl.value;
  console.log(currentUser.value._id, avatarUrl.value, headerUrl.value);
  await store.dispatch("USERS/UPDATE_USER", {
    userId: currentUser.value._id,
    update: {
      avatar: avatarUrl.value,
      header: headerUrl.value,
    },
  });
  // Aquí deberías enviar la información actualizada a la base de datos
};

/**
 * Hook de ciclo de vida que se ejecuta antes de montar el componente.
 * Obtiene y asigna los datos del usuario actual.
 */
onBeforeMount(async () => {
  const username = router.currentRoute.value.params.username as string;
  userParam.value = await store.dispatch("USERS/GET_USER", username);
  headerUrl.value = userParam.value?.header; // Asignar imagen del header obtenida de la base de datos
  avatarUrl.value = userParam.value?.avatar; // Asignar avatar obtenido de la base de datos
});

/**
 * Watcher que se ejecuta cuando cambia el parámetro de la ruta.
 * Actualiza los datos del usuario basándose en el nuevo nombre de usuario.
 */
watch(
  () => router.currentRoute.value.params.username,
  // @ts-ignore
  async (newUsername: string) => {
    if (newUsername !== undefined)
      userParam.value = await store.dispatch("USERS/GET_USER", newUsername);
  }
);

/**
 * Función para seguir a un usuario.
 * #throws {Error} - Error al seguir al usuario.
 */
const followUser = async () => {
  try {
    await store.dispatch("MUTUALS/CREATE_MUTUAL", {
      id1: store.state["USERS"].user._id,
      id2: userParam.value?._id,
      relationshipType: "user",
      status: "pending",
    });
  } catch (error) {
    console.error("Error al seguir al usuario:", error);
    throw error;
  }
};

/**
 * Función para dejar de seguir a un usuario.
 * #throws {Error} - Error al dejar de seguir al usuario.
 */
const unfollowUser = async () => {
  try {
    const params = {
      id1: store.state["USERS"].user._id,
      id2: userParam.value?._id,
    };

    const mutualRes = await store.dispatch("MUTUALS/DELETE_MUTUAL", params);
    console.log("Unfollow exitoso:", mutualRes);
  } catch (error) {
    console.error("Error al dejar de seguir al usuario:", error);
    throw error;
  }
};

const isMutual = computed(() => {
  return (
    userParam.value &&
    (store.state["MUTUALS"].mutuals?.some(
      (mutual: MutualData) =>
        mutual.id2 === userParam.value?._id && mutual.status === "active"
    ) ||
      store.state["MUTUALS"].mutuals.some(
        (mutual: MutualData) =>
          mutual.id1 === userParam.value?._id && mutual.status === "active"
      ))
  );
});

const isPending = computed(() => {
  return (
    userParam.value &&
    store.state["MUTUALS"].mutuals?.some(
      (mutual: MutualData) =>
        mutual.id2 === userParam.value?._id && mutual.status === "pending"
    )
  );
});

const status = computed(() => {
  const currentUser = store.state["USERS"].user;

  return {
    pending: userParam.value?._id !== currentUser._id && isPending.value,
    active: userParam.value?._id !== currentUser._id && isMutual.value,
    current: userParam.value?._id === currentUser._id,
    default:
      !isPending.value &&
      !isMutual.value &&
      !(currentUser && userParam.value && userParam.value._id === currentUser._id),
  };
});
</script>

<template>
  <!--User Profile: {{ $route.params.username }} -->
  <ResponsiveContainerLayout>
    <div class="h-screen">
      <div class="flex flex-col">
        <!-- PARTE DE ARRIBA -->

        <!-- header imagen like twitter header -->
        <Dialog>
          <div class="relative">
            <!-- OVERLAY HEADER -->
            <div v-if="isEditing">
              <DialogTrigger asChild>
                <Button
                  variant="link"
                  class="absolute z-20 bg-black inset-0 opacity-50 cursor-pointer h-full"
                >
                  <transition
                    enter-from-class="opacity-0"
                    enter-active-class="transition duration-500"
                    leave-to-class="opacity-0"
                    leave-active-class="transition duration-100"
                  >
                    <div id="header-overlay" />
                  </transition>
                </Button>
              </DialogTrigger>
            </div>

            <!-- CAMERA -->
            <div v-if="isEditing">
              <DialogTrigger asChild>
                <Button
                  variant="link"
                  class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer"
                >
                  <transition
                    enter-from-class="opacity-0"
                    enter-active-class="transition duration-500"
                    leave-to-class="opacity-0"
                    leave-active-class="transition duration-100"
                  >
                    <Camera class="h-5 w-5 duration-300 hover:h-6 hover:w-6 text-white" />
                  </transition>
                </Button>
              </DialogTrigger>
            </div>

            <div>
              <div
                v-if="userParam?.header"
                id="header"
                :style="{ backgroundImage: `url('${headerUrl}')` }"
                class="w-full h-[240px] overflow-hidden flex items-center bg-center bg-cover"
              />
              <div
                v-else-if="tempHeaderUrl"
                id="header"
                :style="{ backgroundImage: `url('${tempHeaderUrl}')` }"
                class="w-full h-[240px] bg-center bg-cover"
              />
              <div
                v-else
                id="header"
                class="w-full h-[240px] dark:bg-[#161618] bg-[#dbdbdb] bg-center bg-cover"
              />
            </div>
          </div>
          <!-- ///////// FORMULARIO HEADER -->
          <DialogContent>
            <form @submit.prevent="">
              <DialogHeader class="mb-4">
                <DialogTitle>Encabezado</DialogTitle>
              </DialogHeader>
              <Input
                id="url-header"
                label="Url (.png, .jpg, etc)"
                type="text"
                :valid="true"
                v-model="tempHeaderUrl"
              />
              <DialogClose asChild>
                <Button variant="outline" class="mt-4" type="submit"> Guardar </Button>
              </DialogClose>
            </form>
          </DialogContent>
        </Dialog>

        <!-- PARTE DE ABAJO -->
        <div class="px-10 mt-[-80px]">
          <!-- avatar y editar perfil -->
          <div class="relative grid grid-cols-[auto_auto_1fr] gap-3" v-if="userParam">
            <div class="row-span-2">
              <Dialog>
                <div class="relative w-[145px] h-[145px]">
                  <!-- Overlay -->
                  <div v-if="isEditing">
                    <DialogTrigger asChild>
                      <Button
                        variant="link"
                        class="absolute z-40 inset-0 opacity-50 cursor-pointer p-0 h-full"
                      >
                        <transition
                          enter-from-class="opacity-0"
                          enter-active-class="transition duration-500"
                          leave-to-class="opacity-0"
                          leave-active-class="transition duration-100"
                        >
                          <Squircle />
                        </transition>
                      </Button>
                    </DialogTrigger>
                  </div>

                  <!-- Camera -->
                  <div v-if="isEditing">
                    <DialogTrigger asChild>
                      <Button
                        variant="link"
                        class="absolute z-40 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer"
                      >
                        <transition
                          enter-from-class="opacity-0"
                          enter-active-class="transition duration-500"
                          leave-to-class="opacity-0"
                          leave-active-class="transition duration-100"
                        >
                          <Camera
                            class="h-5 w-5 hover:h-6 hover:w-6 duration-300 text-white"
                          />
                        </transition>
                      </Button>
                    </DialogTrigger>
                  </div>

                  <SquircleAvatar
                    v-if="userParam?.avatar"
                    size="145px"
                    class="relative z-30"
                    :src="avatarUrl"
                    :name="($route.params.nickname as string)"
                  />
                  <SquircleAvatar
                    v-else-if="tempAvatarUrl"
                    size="145px"
                    class="relative z-30"
                    :src="tempAvatarUrl"
                    :name="($route.params.nickname as string)"
                  />
                  <SquircleAvatar
                    v-else
                    size="145px"
                    class="relative z-30"
                    :name="($route.params.nickname as string)"
                    :bg="true"
                  />
                </div>
                <DialogContent>
                  <form @submit.prevent="">
                    <DialogHeader class="mb-4">
                      <DialogTitle>Avatar</DialogTitle>
                    </DialogHeader>
                    <Input
                      id="url-avatar"
                      label="Url (.png, .jpg, etc)"
                      type="text"
                      :valid="true"
                      v-model="tempAvatarUrl"
                    />
                    <DialogClose asChild>
                      <Button variant="outline" class="mt-4"> Guardar </Button>
                    </DialogClose>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div class="col-start-2 row-start-2 h-[65px] flex flex-col justify-center">
              <div class="font-extrabold text-xl">{{ userParam?.nickname }}</div>
              <div class="text-zinc-600 mt-[-2px] ml-[-2px]">
                @{{ $route.params.username }}
              </div>
            </div>
            <div class="col-start-3 row-start-2 flex items-center justify-end">
              <!--Button editar perfil -->
              <div v-if="currentType == 'user'">
                <div
                  v-if="isEditing && currentUser._id == userParam._id"
                  class="flex gap-x-2"
                >
                  <Button variant="outline" @click="cancelEdit">Cancelar</Button>
                  <Button @click="confirmEdit">Confirmar</Button>
                </div>
                <div v-else-if="currentUser._id == userParam._id">
                  <Button variant="outline" @click="switchEditMode">Editar</Button>
                </div>
                <Button v-if="status.active" @click="unfollowUser" variant="outline">
                  Mutual
                </Button>
                <Button v-if="status.pending" variant="outline" disabled>
                  Pendiente
                </Button>
                <Button v-if="status.default" @click="followUser">Seguir</Button>
              </div>
              <div v-else>
                <Alert class="alert p-2 w-auto bg-traslucent-red border-red-400">
                  <div class="flex items-center gap-x-2">
                    <XOctagon class="h-4 w-4 text-red-300" />
                    <AlertDescription>
                      No puedes seguir un personaje desde una cuenta de usuario.
                    </AlertDescription>
                  </div>
                </Alert>
              </div>
            </div>
          </div>
          <div><!-- Bio --></div>
          <div><!-- Otros datos --></div>
          <div><!-- Cantidad de mutuals --></div>
        </div>
      </div>
    </div>
  </ResponsiveContainerLayout>
</template>
