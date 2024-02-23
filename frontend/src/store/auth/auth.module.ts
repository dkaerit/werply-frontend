// @ts-ignore
import { Commit, Dispatch } from 'vuex'
import axios, { AxiosError } from 'axios'
import { uri, store } from '../index';
import { LoginPayload, EndpointWithPayload, RegistrationData, UserData } from "./auth.interfaces"
interface Triggers { commit: Commit, dispatch: Dispatch }

interface TrackingInformation {
    id: string;
    alias: string;
    type: string;
}

const fieldMapping: { [key: string]: string } = {
    '/auth/login/email': 'email',
    '/auth/login/tlfn': 'tlfn',
    '/auth/login/username': 'username',
};

export default {
    namespaced: true,

    /////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                             //
    //                                           STATE                                             //
    //                                                                                             //
    /////////////////////////////////////////////////////////////////////////////////////////////////

    state: () => ({ // variables globales de la aplicación
        //token: undefined,
    }),

    /////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                             //
    //                                         MUTATIONS                                           //
    //                                                                                             //
    /////////////////////////////////////////////////////////////////////////////////////////////////

    mutations: {

        /**
         * Mutación para establecer el token en el estado de la store.
         * #param state - Estado de la store
         * #param token - Token de autenticación
         */

        setToken: (_: {}, token: string) => {
            //state.token = token
            localStorage.setItem("TokenSession", token);
            location.reload();
        },

        /**
         * Mutación para desautenticar al usuario.
         * #param commit - Función de commit de Vuex
         */

        dismissToken: () => {
            localStorage.removeItem("TokenSession");
            location.reload();
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                             //
    //                                         ACTIONS                                             //
    //                                                                                             //
    /////////////////////////////////////////////////////////////////////////////////////////////////

    actions: {

        async DISMISS_TOKEN({ commit }: Triggers): Promise<void> {
            store.state["USERS"].user = undefined;
            store.state["CHARACTERS"].characters = {};
            store.state["CHARACTERS"].currentCharacter = null;
            await commit('dismissToken');
        },

        async CHECK_TOKEN_EXPIRATION({ commit }: Triggers): Promise<void> {
            try {
                const token = localStorage.TokenSession;
                const response = await axios.get(`${uri}/auth/expiration`, { headers: { authorization: `${token}` } });
                if (response.data.expired) commit('dismissToken'); // if expired dismiss token
                if (!token) return;
            } catch (err) {
                throw new Error("Hubo un error verificando la sesión")
            }
        },

        /**
         * Acción para autenticar al usuario.
         * #param commit - Función de commit de Vuex
         * #param endpoint - Endpoint para la autenticación
         * #param payload - Carga útil para la autenticación
         */

        async AUTHENTICATE({ commit, dispatch }: Triggers, { endpoint, payload }: EndpointWithPayload): Promise<void | { error: string }> {
            const field = fieldMapping[endpoint];

            try {
                const response = await axios.post(`${uri}${endpoint}`, { [field]: payload.identifier, "passwd": payload.password });
                const token = response.data.token;

                if (token)
                    await dispatch('USERS/FETCH_USER', payload.identifier, { root: true });

                await commit('setToken', token);
            } catch (error) {

                if (axios.isAxiosError(error)) {
                    const axiosError = error as AxiosError;
                    if (error.code == "ERR_NETWORK") throw new Error('Servidor no disponible');
                    if (axiosError.response?.status === 401 || axiosError.response?.status === 404) throw new Error('Usuario o contraseña incorrectos');
                }

                throw new Error('Error desconocido al autenticar');
            }
        },

        async REGISTER_USER({ dispatch }: Triggers, user: RegistrationData): Promise<void | { error: string }> {
            try {
                // Lógica de registro de usuario
                if (await dispatch('CHECK_EMAIL_EXISTENCE', user.email))
                    throw new Error('El correo electrónico ya está registrado');

                if (await dispatch('CHECK_USERNAME_EXISTENCE', user.username))
                    throw new Error('El nombre de usuario ya está registrado');

                await axios.post(`${uri}/users/create`, user, {
                    headers: { 'Content-Type': 'application/json' } // Asegúrate de enviar el tipo de contenido correcto
                });

            } catch (error) {
                if (axios.isAxiosError(error)) {
                    if (error.code == "ERR_NETWORK") throw new Error('Servidor no disponible');
                    if (error.code == "ERR_BAD_RESPONSE") throw new Error('El servidor encontró una condición inesperada que le impidió cumplir con la solicitud (Posible mal formato).');
                    // Puedes manejar más casos específicos de errores aquí si es necesario
                    throw new Error('Error desconocido');

                }

                throw new Error('Error desconocido durante el registro de usuario');
            }
        },

        /**
         * Acción de autenticación con email.
         * #param dispatch - Función de dispatch de Vuex
         * #param payload - Carga útil para la autenticación
         */

        async AUTHENTICATION_ACTION_EMAIL({ dispatch }: Triggers, payload: LoginPayload): Promise<void> {
            await dispatch('AUTHENTICATE', { endpoint: '/auth/login/email', payload });
        },

        /**
         * Acción de autenticación con teléfono.
         * #param dispatch - Función de dispatch de Vuex
         * #param payload - Carga útil para la autenticación
         */

        async AUTHENTICATION_ACTION_TELEFONO({ dispatch }: Triggers, payload: LoginPayload): Promise<void> {
            await dispatch('AUTHENTICATE', { endpoint: '/auth/login/tlfn', payload });
        },

        /**
         * Acción de autenticación con nombre de usuario.
         * #param dispatch - Función de dispatch de Vuex
         * #param payload - Carga útil para la autenticación
         */

        async AUTHENTICATION_ACTION_USERNAME({ dispatch }: Triggers, payload: LoginPayload): Promise<void> {
            await dispatch('AUTHENTICATE', { endpoint: '/auth/login/username', payload });
        },

        /**
         * Acción para verificar si un usuario ya existe en la base de datos.
         * #param dispatch - Función de dispatch de Vuex
         * #param username - Carga útil para la verificación
         * #returns {Promise<boolean>} - Devuelve true si el usuario existe, false en caso contrario.
         */
        async CHECK_USERNAME_EXISTENCE(_: Triggers, username: string): Promise<boolean> {
            try {
                const response = await axios.get(`${uri}/users/checkuser:${username}`);
                return response.data;
            } catch (error) {
                throw new Error('Error al verificar la existencia del usuario');
            }
        },

        /**
         * Acción para verificar si un correo electrónico ya existe en la base de datos.
         * #param dispatch - Función de dispatch de Vuex
         * #param email - Carga útil para la verificación
         * #returns {Promise<boolean>} - Devuelve true si el correo electrónico existe, false en caso contrario.
         */
        async CHECK_EMAIL_EXISTENCE(_: Triggers, email: any): Promise<boolean> {
            try {
                const response = await axios.get(`${uri}/users/checkmail:${email}`);
                return response.data;
            } catch (error) {
                throw new Error('Error al verificar la existencia del correo electrónico');
            }
        },

        /**
         * Acció para obtener la información de usuario dado un token
         * #returns 
         */

        async GET_USER_INFO(_: Triggers): Promise<UserData | {}> {
            try {
                const token = localStorage.getItem("TokenSession");
                if (token) {
                    const response = await axios.get(`${uri}/auth/user-info`, { headers: { authorization: `${token}` } });
                    return response.data;
                } else return {}

            } catch (error) {
                throw new Error("Error al obtener la información del usuario");
            }
        },


        /**
         * Acción para actualizar la asociación entre los datos del seleccionado y el ID del socket en el servidor.
         * #param data - data tracking.
         */

        async UPDATE_SOCKET_ASSOCIATION(_: Triggers, data: TrackingInformation): Promise<void> {
            try {
                await axios.post(`${uri}/auth/updateSocketAssociation`, data);
                // Si necesitas realizar alguna acción adicional después de la actualización, puedes hacerlo aquí.
            } catch (error) {
                throw new Error('Error al actualizar la asociación del socket en el servidor');
            }
        },

    }
}