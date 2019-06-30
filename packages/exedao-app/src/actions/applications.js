import {ADD_APPLICATIONS, SET_APPLICATION_DETAILS} from '../store/reducers/applications';

export const submitApplication = ({name, description, tokenTributes, shares, weiTribute}) => {
  return async (dispatch, getState) => {
    const exedao = getState().exedao.exedao;
    await exedao.submitApplication({shares, weiTribute, tokenTributes, name, description}, 350000);
    const hash = await exedao.api.putApplication({name, description});
    console.log(`Application hash submitted to server -- ${hash}`)
  }
}

export const acceptApplication = (applicant) => {
  return (dispatch, getState) => {
    const exedao = getState().exedao.exedao;
    return exedao.acceptApplication(applicant, 250000);
  }
}

export const getApplicationDetails = (applicant, metaHash) => {
  return async (dispatch, getState) => {
    const exedao = getState().exedao.exedao;
    const metadata = await exedao.getMetaData(metaHash);
    dispatch({type: SET_APPLICATION_DETAILS, application: {...metadata, applicant}}) 
  }
}

export const getOpenApplications = () => {
  return async (dispatch, getState) => {
    const exedao = getState().exedao.exedao;
    const applications = await exedao.getOpenApplications()
    dispatch({type: ADD_APPLICATIONS, applications}) 
  }
}