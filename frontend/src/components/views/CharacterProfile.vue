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

interface Character {
  _id: string;
  nickname: string;
  pjname: string;
  header: string;
  avatar: string;
}

const store = useStore();
const pjParam = ref<Character | null>(null);
const router = useRouter();
const currentCharacter = ref(store.state["CHARACTERS"].currentCharacter);

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
  await store.dispatch("CHARACTERS/UPDATE_CHARACTER", {
    characterId: currentCharacter.value._id,
    update: {
      avatar: avatarUrl.value,
      header: headerUrl.value,
    },
  });
  // Aquí deberías enviar la información actualizada a la base de datos
};

// Función para cargar el personaje actual
const loadCharacter = async (charactername: string) => {
  try {
    pjParam.value = await store.dispatch("CHARACTERS/GET_CHARACTER", charactername);
    headerUrl.value = pjParam.value?.header; // Asignar imagen del header obtenida de la base de datos
    avatarUrl.value = pjParam.value?.avatar; // Asignar avatar obtenido de la base de datos
  } catch (error) {
    throw new Error("Error al obtener el personaje por ID");
  }
};

/**
 * Hook de ciclo de vida que se ejecuta antes de montar el componente.
 * Obtiene y asigna los datos del personaje actual.
 */
onBeforeMount(async () => {
  const charactername = router.currentRoute.value.params.nickname as string;
  loadCharacter(charactername);
});

/**
 * Watcher que se ejecuta cuando cambia el parámetro de la ruta.
 * Actualiza los datos del personaje basándose en el nuevo nombre de usuario.
 */
watch(
  () => router.currentRoute.value.params.nickname,
  // @ts-ignore
  async (newCharactername: string) => {
    await loadCharacter(newCharactername);
  }
);

/**
 * Función para seguir a un personaje.
 * #throws {Error} - Error al seguir al personaje.
 */
const followCharacter = async () => {
  try {
    await store.dispatch("MUTUALS/CREATE_MUTUAL", {
      id1: store.state["CHARACTERS"].currentCharacter._id,
      id2: pjParam.value?._id,
      relationshipType: "pj",
      status: "pending",
    });
  } catch (error) {
    console.error("Error al seguir al personaje:", error);
    throw error;
  }
};

/**
 * Función para dejar de seguir a un personaje.
 * #throws {Error} - Error al dejar de seguir al personaje.
 */
const unfollowCharacter = async () => {
  try {
    const params = {
      id1: store.state["CHARACTERS"].currentCharacter._id,
      id2: pjParam.value?._id,
    };

    await store.dispatch("MUTUALS/DELETE_MUTUAL", params);
  } catch (error) {
    console.log("Error al dejar de seguir al personaje", error);
    throw error;
  }
};

const isMutual = computed(() => {
  return (
    pjParam.value &&
    (store.state["MUTUALS"].mutuals?.some(
      (mutual: MutualData) =>
        mutual.id2 === pjParam.value?._id && mutual.status === "active"
    ) ||
      store.state["MUTUALS"].mutuals.some(
        (mutual: MutualData) =>
          mutual.id1 === pjParam.value?._id && mutual.status === "active"
      ))
  );
});

const isPending = computed(() => {
  return (
    pjParam.value &&
    store.state["MUTUALS"].mutuals?.some(
      (mutual: MutualData) =>
        mutual.id2 === pjParam.value?._id && mutual.status === "pending"
    )
  );
});

const status = computed(() => {
  const currentCharacter = store.state["CHARACTERS"].currentCharacter;

  return {
    pending: pjParam.value?._id !== currentCharacter?._id && isPending.value,
    active: pjParam.value?._id !== currentCharacter?._id && isMutual.value,
    current: pjParam.value?._id === currentCharacter?._id,
    default:
      !isPending.value &&
      !isMutual.value &&
      !(currentCharacter && pjParam.value && pjParam.value._id === currentCharacter?._id),
  };
});
</script>

<template>
  <!--Character Profile: {{ $route.params.nickname }} -->
  <ResponsiveContainerLayout>
    <div class="h-screen">
      <div class="flex flex-col">
        <!-- PARTE DE ARRIBA -->
        <!-- header imagen like twitter header -->
        <Dialog>
          <div class="relative">
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
            <div
              v-if="pjParam?.header"
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

          <!-- ///////// FORMULARIO HEADER -->
          <DialogContent>
            <form>
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
          <div class="relative grid grid-cols-[auto_auto_1fr] gap-3" v-if="pjParam">
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
                    v-if="pjParam?.avatar"
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
                <!-- ///////// FORMULARIO AVATAR -->
                <DialogContent>
                  <form>
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
              <div class="font-extrabold text-xl">{{ pjParam?.pjname }}</div>
              <div class="text-zinc-600 mt-[-2px] ml-[-2px]">
                @{{ $route.params.nickname }}
              </div>
            </div>
            <div class="col-start-3 row-start-2 flex items-center justify-end">
              <!--Button editar perfil -->
              <div v-if="currentCharacter != null">
                <div
                  v-if="isEditing && currentCharacter.nickname == pjParam.nickname"
                  class="flex gap-x-2"
                >
                  <Button variant="outline" @click="cancelEdit">Cancelar</Button>
                  <Button @click="confirmEdit">Confirmar</Button>
                </div>
                <div v-else-if="currentCharacter.nickname == pjParam.nickname">
                  <Button variant="outline" @click="switchEditMode">Editar</Button>
                </div>
                <Button v-if="status.active" @click="unfollowCharacter" variant="outline"
                  >Mutual</Button
                >
                <Button v-if="status.pending" variant="outline" disabled
                  >Pendiente</Button
                >
                <Button v-if="status.default" @click="followCharacter">Seguir</Button>
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
