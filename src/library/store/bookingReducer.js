import { createSlice } from "@reduxjs/toolkit";

export const booking = createSlice({
    name: 'booking', 
    initialState: {
        appointment: {}
    }, 
    reducers: {
        updateAppointment: (state, action) => {
            const {payload} = action
            state.appointment = {...state.appointment, ...payload}
        }
    }
})

export const {updateAppointment} = booking.actions
export default booking.reducer