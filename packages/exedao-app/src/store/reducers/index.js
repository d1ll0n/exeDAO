import { combineReducers } from 'redux'
import web3 from './web3'
import exedao from './exedao'
import applications from './applications'
import proposals from './proposals'

export default combineReducers({
  applications,
  proposals,
  web3,
  exedao
})
