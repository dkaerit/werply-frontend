// @ts-ignore
import { Commit, Dispatch } from 'vuex'
import axios from 'axios'

import { uri } from '../index';
interface Triggers { commit: Commit, dispatch: Dispatch }
import { Character, RootCharacterState } from "./characters.interfaces"

export default {
  namespaced: true,
  state: () => ({
    characters: {} as Record<string, Character>,
    currentCharacter: null as Character | null,
  } as RootCharacterState),

  mutations: {
    /**
     * Setea la lista completa de personajes en el estado de la tienda.
     * #param state RootCharacterState del módulo de personajes.
     * #param characters Lista de personajes.
     */
    setCharacters(state: RootCharacterState, characters: Record<string, Character>): void {
      state.characters = characters;
    },

    /**
     * Actualiza un personaje en el estado de la tienda.
     * #param state RootCharacterState del módulo de personajes.
     * #param updatedCharacter Personaje actualizado.
     */
    updateCharacter(state: RootCharacterState, updatedCharacter: Character): void {
      const character = state.characters[updatedCharacter._id];
      if (character !== undefined) {
        state.characters[updatedCharacter._id] = updatedCharacter;
      }
    },

    /**
     * Elimina un personaje del estado de la tienda.
     * #param state RootCharacterState del módulo de personajes.
     * #param characterId Identificador del personaje a eliminar.
     */
    deleteCharacter(state: RootCharacterState, characterId: string): void {
      delete state.characters[characterId];
    },

    /**
     * 
     * 
     * 
     */
    setCurrentCharacter(state: RootCharacterState, character: Character) {
      state.currentCharacter = character;
    },
  },

  actions: {
    /**
     * Crea un nuevo personaje en el servidor y lo añade al estado de la tienda.
     * #param triggers Objeto conteniendo commit y dispatch de Vuex.
     * #param character Personaje a crear.
     */
    async CREATE_CHARACTER({ dispatch }: Triggers, character: Character): Promise<void> {
      try {
        await axios.post(`${uri}/characters/create`, character);
        await dispatch('FETCH_CHARACTERS_BY_USER_ID', character.ownerId);
      } catch (error) {
        throw new Error('Error creating character:');
      }
    },

    /**
     * Actualiza un personaje en el servidor y en el estado de la tienda.
     * #param triggers Objeto conteniendo commit y dispatch de Vuex.
     * #param payload Objeto con characterId (identificador del personaje) y update (datos a actualizar).
     */
    async UPDATE_CHARACTER({ commit }: Triggers, { characterId, update }: { characterId: string, update: Character }): Promise<void> {
      try {
        console.log("update-characterId", characterId)
        const response = await axios.put(`${uri}/characters/update:${characterId}`, update);
        await commit('updateCharacter', response.data);
      } catch (error) {
        throw new Error('Error updating character:');
      }
    },

    /**
     * Elimina un personaje en el servidor y en el estado de la tienda.
     * #param triggers Objeto conteniendo commit y dispatch de Vuex.
     * #param characterId Identificador del personaje a eliminar.
     */
    async DELETE_CHARACTER({ commit }: Triggers, characterId: string): Promise<void> {
      try {
        await axios.delete(`${uri}/characters/delete/${characterId}`);
        await commit('deleteCharacter', characterId);
      } catch (error) {
        throw new Error('Error deleting character:');
      }
    },

    /**
     * Verifica la existencia de un nickname para un personaje.
     * #param {Triggers} triggers Objeto que contiene commit y dispatch para gestionar las acciones en Vuex.
     * #param {string} pjname El nickname del personaje a verificar.
     * #throws {Error} Lanza un error si el nickname ya está en uso.
     * #returns {Promise<boolean>} Devuelve true si el nickname no está en uso, de lo contrario, lanza un error.
     */
    async CHECK_NICKNAME_EXISTENCE(_: Triggers, pjname: string): Promise<boolean> {
      try {
        // Realiza una llamada al backend para verificar la existencia del nickname
        const response = await axios.get(`${uri}/characters/check:${pjname}`);

        // Si el nickname ya está en uso, lanza un error
        if (response.data)
          throw new Error("El nickname ya está en uso");

        // Si no hay problemas, devuelve true indicando que el nickname no está en uso
        return false;
      } catch (error) {
        // Captura y relanza el error
        throw new Error("Error inesperado");
      }
    },

    /**
    * Obtiene todos los personajes de un usuario por su userId.
    * #param {Triggers} triggers Objeto que contiene commit y dispatch para gestionar las acciones en Vuex.
    * #param {string} userId El _id del usuario.
    * #throws {Error} Lanza un error si la obtención de personajes falla.
    */
    async FETCH_CHARACTERS_BY_USER_ID({ commit }: Triggers, userId: string): Promise<Character[]> {
      try {
        // Realiza la solicitud para obtener los personajes por userId
        const response = await axios.get(`${uri}/characters/fetch:${userId}`);
        const characters = response.data.reduce((acc: Record<string, Character>, character: Character) => {
          acc[character._id] = character; // Utiliza el id del personaje como clave en el objeto
          return acc;
        }, {});

        // Actualiza el estado de la store con los personajes obtenidos
        await commit('setCharacters', characters);
        return characters;

      } catch (error) {
        // Maneja cualquier error que pueda ocurrir durante la obtención de personajes por userId
        throw new Error('Error al obtener los personajes por userId');
      }
    },

    /**
     * Obtiene un personaje por su name.
     * #param triggers Objeto que contiene commit y dispatch de Vuex.
     * #param characterId Identificador del personaje a obtener.
     */
    async GET_CHARACTER(_: Triggers, charactername: string): Promise<void> {
      try {
        //console.log("GET_CHARACTER-charactername", charactername)
        const response = await axios.get(`${uri}/characters/read:${charactername}`);
        return response.data;
      } catch (error) {
        // Maneja cualquier error que pueda ocurrir durante la obtención del personaje por ID
        throw new Error('Error al obtener el personaje por ID');
      }
    },

    /**
     * Obtiene un personaje por su ID.
     * #param triggers Objeto que contiene commit y dispatch de Vuex.
     * #param characterId Identificador del personaje a obtener.
     */
    async GET_CHARACTER_BY_ID(_: Triggers, id: string): Promise<void> {
      try {
        //console.log("GET_CHARACTER-charactername", charactername)
        const response = await axios.get(`${uri}/characters/id:${id}`);
        return response.data;
      } catch (error) {
        // Maneja cualquier error que pueda ocurrir durante la obtención del personaje por ID
        throw new Error('Error al obtener el personaje por ID');
      }
    },

  },

  /////////////////////////////////////////////////////////////////////////////////////////////////
  //                                                                                             //
  //                                         GETTERS                                             //
  //                                                                                             //
  /////////////////////////////////////////////////////////////////////////////////////////////////

  getters: {
    getCurrentCharacterId: (state:RootCharacterState) => {
      return state.currentCharacter ? state.currentCharacter._id : null;
    },
  }



};