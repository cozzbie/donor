import { ActionReducer, Action } from '@ngrx/store';
import { User } from "../interfaces/user";

export const SET_USER = "SET_USER";
export const EDIT_USER = "EDIT_USER";
export const CLEAR_USER = "CLEAR_USER";

export interface UserState {
    user: User;
    isMessaging: boolean;
}

const initialState: UserState = { user: <User> {}, isMessaging: false};

export function userReducer (state: UserState = initialState, action: Action): UserState {
    switch (action.type) {
        case SET_USER:
            return {
                user: action.payload,
                isMessaging: state.isMessaging
            };
        case EDIT_USER:
            return {
                user: Object.assign({}, state.user, action.payload),
                isMessaging: state.isMessaging
            };
        case CLEAR_USER:
            return {
                user: <any>{},
                isMessaging: state.isMessaging
            };
        default:
            return state;
    }
}

export const UserReducer: ActionReducer<Object> = userReducer;
