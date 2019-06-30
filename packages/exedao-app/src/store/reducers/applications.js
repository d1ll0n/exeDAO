import {updateItem} from './util';

export const ADD_APPLICATION = 'APPLICATIONS/ADD_APPLICATION';
export const ADD_APPLICATIONS = 'APPLICATIONS/ADD_APPLICATIONS';
export const SET_APPLICATION_DETAILS = 'APPLICATIONS/SET_APPLICATION_DETAILS';

const initialState = {
  applications: []
}

export default (state = initialState, action) => {
  const {type, applications = [], application = {}} = action
  switch (type) {
    case ADD_APPLICATION:
      return {applications: [...state.applications, application]}

    case ADD_APPLICATIONS:
      return {applications: [...state.applications, ...applications]}

    case SET_APPLICATION_DETAILS:
      return {applications: updateItem(state.applications, application, 'applicant')}
        
    default:
      return state
  }
}