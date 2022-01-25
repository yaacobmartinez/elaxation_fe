import {configureStore} from '@reduxjs/toolkit'
import bookingReducer from './bookingReducer'
export default configureStore({
    reducer: {
        booking: bookingReducer
    }
})