<script setup lang="ts">
// @ts-ignore
import { useStore } from "vuex";
import { Check, ChevronsUpDown, LogOut } from "lucide-vue-next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircledIcon } from "@radix-icons/vue";

import { ref, computed, onBeforeMount, watchEffect } from "vue";
import { cn } from "@/lib/utils";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import NewCharacterForm from "@/components/elements/NewCharacterForm.vue";

const store = useStore();

const logout = async () => {
  await store.dispatch("AUTH/DISMISS_TOKEN"); // Realizar acciones necesarias para cerrar sesión
};

type Team = {
  id: string;
  label: string;
  value: string;
};

const username = computed(() => store.state["USERS"].user.username);
const userid = computed(() => store.state["USERS"].user._id);
const characters = ref(store.state["CHARACTERS"].characters);
const formatCharacters = computed(() =>
  Object.values(characters.value).map((character: any) => ({
    id: character._id,
    label: character.pjname,
    value: character.nickname,
  }))
);

const groups = ref([
  {
    label: "Personal Account",
    teams: [
      {
        id: userid.value,
        label: username.value || "���",
        value: "personal",
      },
    ],
  },
  {
    label: "Characters",
    teams: formatCharacters.value,
  },
]);

const open = ref(false);

const updateSocketAssociation = async () => {
  const data = store.getters["USERS/getTracker"];

  // Lógica para enviar los datos actualizados al servidor
  await store.dispatch("AUTH/UPDATE_SOCKET_ASSOCIATION", data);
};

const selectedPj = ref<Team>(
  store.state["CHARACTERS"].currentCharacter
    ? formatCharacters.value.find(
        (team) => team.id === store.state["CHARACTERS"].currentCharacter?._id
      ) || groups.value[0].teams[0]
    : groups.value[0].teams[0]
);

const showNewTeamDialog = ref(false);

const filterFunction = (list: Team[], search: string) =>
  list.filter((i) =>
    i.label ? i.label.toLowerCase().includes(search.toLowerCase()) : i
  );

const shouldShowSecondImage = computed(() => {
  // Check if the selected team belongs to group[1]
  return groups.value[1].teams.some(
    (team: any) => team.value === selectedPj.value?.value
  );
});

onBeforeMount(async () => {
  // Cuando el componente se monta, obtén los personajes asociados al usuario
  await store.dispatch("CHARACTERS/FETCH_CHARACTERS_BY_USER_ID", userid.value);
  if (store.state["CHARACTERS"].currentCharacter) {
    await store.dispatch(
      "MUTUALS/FETCH_MUTUALS",
      store.state["CHARACTERS"].currentCharacter._id
    );
  } else {
    await store.dispatch("MUTUALS/FETCH_MUTUALS", userid.value);
  }
});

const handleSubmit = async () => {
  showNewTeamDialog.value = !showNewTeamDialog.value;
  window.location.reload();
};

const selectCharacter = async (character: Team) => {
  if (character.value == "personal") {
    store.commit("CHARACTERS/setCurrentCharacter", null);
    await store.dispatch("MUTUALS/FETCH_MUTUALS", userid.value);
  } else {
    const finded = characters.value[character.id];
    await store.commit("CHARACTERS/setCurrentCharacter", finded);
    await store.dispatch("MUTUALS/FETCH_MUTUALS", character.id);
  }
  await updateSocketAssociation();
};

watchEffect(() => {
  // Lógica para observar cambios reactivamente
  characters.value = store.state["CHARACTERS"].characters;
  groups.value[1].teams = Object.values(characters.value).map((character: any) => ({
    id: character._id,
    label: character.pjname,
    value: character.nickname,
  }));
});
</script>

<template>
  <Dialog v-model:open="showNewTeamDialog">
    <Popover v-model:open="open">
      <PopoverTrigger as-child>
        <Button
          variant="outline"
          role="combobox"
          :aria-expanded="open"
          class="w-[100%] justify-between"
        >
          <!-- user/pj -->
          <div id="bi-profile" class="flex -space-x-3 rtl:space-x-reverse pr-4">
            <img
              class="w-7 h-6 border-2 border-white rounded-full dark:border-gray-800"
              :src="`https://avatar.vercel.sh/${groups[0].teams[0].label}.png`"
              alt=""
            />
            <img
              v-if="shouldShowSecondImage"
              class="w-6 h-6 border-2 border-white rounded-full dark:border-gray-800"
              :src="`https://avatar.vercel.sh/${selectedPj?.value}.png`"
              alt=""
            />
          </div>
          <span class="text-left pl-1 pr-4 truncate w-36">{{
            selectedPj ? selectedPj.label : "Username"
          }}</span>
          <ChevronsUpDown class="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent class="p-0 w-[237px]">
        <Command :filter-function="(filterFunction as any)">
          <CommandInput placeholder="Personaje" />
          <CommandEmpty>Sin coincidencias.</CommandEmpty>
          <CommandList>
            <CommandGroup
              v-for="group in groups"
              :key="group.label"
              :heading="group.label"
            >
              <CommandItem
                class="cursor-pointer"
                v-for="character in group.teams"
                :key="character.value"
                :value="character"
                @select="(ev: any) => {
                selectedPj = ev.detail.value;
                open = false;
                selectCharacter(character);
              }"
              >
                <Avatar class="mr-2 h-5 w-5">
                  <AvatarImage
                    :src="`https://avatar.vercel.sh/${character.value}.png`"
                    :alt="character.label"
                    class="grayscale"
                  />
                  <AvatarFallback>CH</AvatarFallback>
                </Avatar>
                {{ character.label }}
                <Check
                  :class="
                    cn(
                      'ml-auto h-4 w-4',
                      selectedPj?.value === character.value ? 'opacity-100' : 'opacity-0'
                    )
                  "
                />
              </CommandItem>
            </CommandGroup>
          </CommandList>
          <CommandSeparator />
          <!-- Create new character -->
          <CommandList>
            <CommandGroup>
              <DialogTrigger as-child>
                <CommandItem
                  class="cursor-pointer"
                  value="create-team"
                  @select="
                    () => {
                      open = false;
                      showNewTeamDialog = true;
                    }
                  "
                >
                  <PlusCircledIcon class="mr-2 h-5 w-5" />
                  Crear personaje
                </CommandItem>
              </DialogTrigger>
            </CommandGroup>
          </CommandList>
          <!-- End create new character -->
          <CommandSeparator />
          <!-- Log out -->
          <CommandList>
            <CommandGroup>
              <CommandItem
                id="logout"
                value="logout"
                class="cursor-pointer"
                @click="logout"
              >
                <LogOut class="mr-2 h-5 w-5" />
                <span>Cerrar sesión</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>

    <!-- Create character -->
    <form>
      <NewCharacterForm @submit="handleSubmit" />
    </form>
  </Dialog>
</template>

<style scoped lang="scss">
#logout:hover {
  background-color: #f23f42;
  color: #fff;
}
</style>
