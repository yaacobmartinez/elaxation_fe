import { CheckCircle, DateRange, Logout, Menu, Today, WarningAmber } from '@mui/icons-material';
import { LocalizationProvider, MobileDateTimePicker } from '@mui/lab';
import { Alert, AppBar, Box, Button, Card, CardActionArea, CardContent, CardMedia, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Drawer, FormControl, FormControlLabel, FormLabel, Grid, IconButton, InputAdornment, InputLabel, List, ListItem, ListItemIcon, ListItemText, MenuItem, Paper, Radio, RadioGroup, Select, Snackbar, TextField, Toolbar, Typography } from '@mui/material';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { clearStorage, fetchFromStorage } from '../library/utils/Storage';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axiosInstance from '../library/axios';
import { format } from 'date-fns';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateAppointment } from '../library/store/bookingReducer';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';

function CustomerApp() {
    const [open, setOpen] = useState(true)
    const [selectedSection, setSelectedSection] = useState('new_appointment')
    const {push} = useHistory() 
    const toggleDrawer = () => {
        setOpen(!open)
    }
  return (
    <Box>
        <AppBar position="fixed" open={open} sx={{background: '#f8eae7', zIndex: (theme) => theme.zIndex.drawer + 1}} color="transparent">
            <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="end"
                    onClick={toggleDrawer}
                >
                    <Menu />
                </IconButton>
                <Typography variant="h6" component="div" sx={{ml: 2}}>
                    E-laxation Spa and Appointment
                </Typography>
            </Toolbar>
        </AppBar>
        <Drawer sx={{width: 240, flexShrink: 0, '& .MuiDrawer-paper': {width: 240}}}
            variant='persistent'
            ModalProps={{
                keepMounted: true,
            }}
            open={open}
        >
            <Toolbar />
            <Box sx={{ overflow: 'auto' }}>
                <List>
                    <ListItem button onClick={() => setSelectedSection('new_appointment')}>
                        <ListItemIcon>
                            <Today />
                        </ListItemIcon>
                        <ListItemText primary={'New Appointment'} />
                    </ListItem>
                    <ListItem button onClick={() => setSelectedSection('all_appointments')}>
                        <ListItemIcon>
                            <DateRange />
                        </ListItemIcon>
                        <ListItemText primary={'My Appoinments'} />
                    </ListItem> 
                    <ListItem button onClick={ () => {
                        clearStorage()
                        push('/')
                    }}>
                        <ListItemIcon>
                            <Logout />
                        </ListItemIcon>
                        <ListItemText primary={'Logout'} />
                    </ListItem>
                </List>
            </Box>
        </Drawer>
        <Box sx={{ml: 32, mt: 2}}>
            <Toolbar />
            {selectedSection === 'new_appointment' && (
                <BookingInformation setSelectedSection={setSelectedSection} />
            )}
            {selectedSection === 'all_appointments' && (
                <MyAppointments />
            )}
        </Box>
    </Box>
  );
}

const MyAppointments = () => {
    const user = fetchFromStorage('user')
    const [appointments, setAppointments] = useState(null)
    const [selectedAppointment, setSelectedAppointment] = useState(null)
    const getMyAppointments = useCallback(async () =>{
        const {data} = await axiosInstance.get(`/bookings/${user._id}`)
        console.log(data)
        setAppointments(data.bookings)
    }, [])
    useEffect(() => {
        getMyAppointments()
    }, [getMyAppointments])
    return (
        <div style={{marginRight: 20}}>
            {selectedAppointment && (
                <AppointmentDetailsModal 
                    open={Boolean(selectedAppointment)} 
                    onClose={() => setSelectedAppointment(null)}
                    appointment={selectedAppointment}
                    onChange={getMyAppointments}
                />
            )}
            <Typography variant="h6" sx={{mb: 2}}>My Appointments</Typography> 
            {appointments && (
                <DataGrid
                    rows={appointments}
                    autoHeight
                    rowHeight={35}
                    getRowId={(row) => row._id}
                    components={{
                        Toolbar: GridToolbar
                    }}
                    onRowClick={(row) => setSelectedAppointment(row.row)}
                    columns={[
                        // {
                        //     field: 'user', 
                        //     headerName: 'Client Name', 
                        //     flex: 1, 
                        //     minWidth: 250, 
                        //     valueFormatter: (params) => params.value.firstName + ' ' + params.value.lastName
                        // }, 
                        {
                            field: 'service', 
                            headerName: 'Service',
                            flex: 1, 
                            minWidth: 250, 
                            valueFormatter: (params) => params.value.name
                        },
                        {
                            field: 'bookedTime', 
                            headerName: 'Appointment Schedule',
                            flex: 1, 
                            minWidth: 350, 
                            valueFormatter: (params) => format(new Date(params.value), 'PPPP, p')
                        },
                        {
                            field: 'user_data', 
                            headerName: 'Cost',
                            flex: 1, 
                            minWidth: 100, 
                            valueFormatter: (params) => parseFloat(params.value.service_details.cost).toFixed(2)
                        },
                        {
                            field: 'isPaid', 
                            headerName: 'Payment Status',
                            flex: 1, 
                            minWidth: 250, 
                            valueFormatter: (params) => params.value ? 'Paid' : 'Pending'
                        },
                        {
                            field: 'isCancelled', 
                            headerName: 'Status',
                            flex: 1, 
                            minWidth: 250, 
                            valueFormatter: (params) => params.value ? 'Cancelled' : 'Scheduled'
                        }
                    ]}
                />
            )}
        </div>
    )
}

export const AppointmentDetailsModal = ({open, onClose, appointment, onChange}) => {

    const [cancel, setCancel] = useState(false)
    const handleCancel = async () => {
        const {data} = await axiosInstance.put(`/bookings/${appointment._id}`, {isCancelled: true})
        console.log(data)
        setCancel(false)
        onClose()
        onChange()
    }
    return(
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <Dialog open={cancel} onClose={() => setCancel(false)}>
                <DialogTitle>Cancel Appointment?</DialogTitle>
                <DialogContent>
                    <DialogContentText>Are you sure you want to cancel your appointment?</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button variant="outlined" onClick={() => setCancel(false)}>No</Button>
                    <Button variant="contained" onClick={handleCancel} color="error">Yes, Cancel Appointment</Button>
                </DialogActions>
            </Dialog>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogContent>
                    <Paper variant='outlined' sx={{p:2}}>
                        <Typography variant="body1">Client Details</Typography>
                        <Box sx={{py: 2}}>
                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                <Typography variant="body2" component="span" sx={{fontWeight: 'bold'}}>
                                    Name: {" "}
                                </Typography>
                                <Typography variant="body2" component="span">
                                {appointment.user.firstName} {appointment.user.lastName} 
                                </Typography>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                <Typography variant="body2" component="span" sx={{fontWeight: 'bold'}}>
                                    Gender: {" "}
                                </Typography>
                                <Typography variant="body2" component="span">
                                {appointment.user_data.gender}
                                </Typography>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                <Typography variant="body2" component="span" sx={{fontWeight: 'bold'}}>
                                    Age: {" "}
                                </Typography>
                                <Typography variant="body2" component="span">
                                    {appointment.user_data.age}
                                </Typography>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 20}}>
                                <Typography variant="body2" component="span" sx={{fontWeight: 'bold'}}>
                                    Email: {" "}
                                </Typography>
                                <Typography variant="body2" component="span">
                                {appointment.user.email}
                                </Typography>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                <Typography variant="body2" component="span" sx={{fontWeight: 'bold'}}>
                                    Mobile: {" "}
                                </Typography>
                                <Typography variant="body2" component="span">
                                +63{appointment.user_data.mobile}
                                </Typography>
                            </div>
                        </Box>
                    </Paper>
                    <Paper variant='outlined' sx={{p:2, my: 2}}>
                        <Typography variant="body1">Schedule Details</Typography>
                        <Box sx={{py: 2}}>
                            <Typography variant="h5">
                                {format(new Date(appointment.bookedTime), 'eeee')}
                            </Typography>

                            <Typography variant="h6" color="GrayText">
                                {format(new Date(appointment.bookedTime), 'd LLLL, yyyy')}
                            </Typography>

                            <Typography variant="h6">
                                {format(new Date(appointment.bookedTime), 'p')}
                            </Typography>
                        </Box>
                        <CardActionArea sx={{mt: 2}}>
                            <Card elevation={0} variant='outlined' sx={{display: 'flex', py:1, px:2, alignItems: 'center' }}>
                                <CardMedia 
                                    component="img"
                                    sx={{width: 50, height: 50,}}
                                    image={appointment.service.type === 'foot massage' ? './foot.png' : 'massage.png'}
                                    alt="massage"
                                />
                                <CardContent>
                                    <Typography component="div" variant="h6">
                                        {appointment.service.name}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </CardActionArea>
                    </Paper>
                    <Paper variant='outlined' sx={{p:2}}>
                        <Typography variant="body1">Billing Details</Typography>
                        <Box sx={{py:2}}>
                            <Typography variant="h4">₱ {parseFloat(appointment.service.cost).toFixed(2)}</Typography>
                            <Typography variant='body1' color="GrayText">
                                {appointment.isPaid 
                                    ? 'Booking Payment Settled' 
                                    : appointment.isCancelled 
                                        ? 'Appointment Cancelled' 
                                        : 'Please pay this amount on the day of your appointment'
                                }
                            </Typography>
                        </Box>
                    </Paper>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" onClick={onClose}>Close</Button>
                <Button 
                    disabled={appointment.isCancelled}
                    variant="contained" color="warning" startIcon={<WarningAmber />} onClick={() => setCancel(true)}>Cancel Appointment</Button>
            </DialogActions>
        </Dialog>
    )
}
const BookingInformation = ({setSelectedSection}) => {
    const [currentStep, setCurrentStep] = useState(1)
    const nextStep = () => {
        setCurrentStep(currentStep + 1)
    }
    const handleBack = () => {
        if (currentStep === 1) return 
        setCurrentStep(currentStep - 1)
    }
    return (
        <Paper elevation={5} sx={{width: 'calc(93vw - 240px)', p:5}}>
            <Typography variant="h6" gutterBottom sx={{mb: 2}}>New Appointment Details</Typography>
            <Divider sx={{mb: 5}}/>
            <Grid container spacing={2}>
                {currentStep === 1 && (
                    <Step1 nextStep={nextStep} handleBack={handleBack} />
                )}
                {currentStep === 2 && (
                    <Step2 nextStep={nextStep} handleBack={handleBack} />
                )}
                {currentStep === 3 && (
                    <Step3 handleBack={handleBack} setSelectedSection={setSelectedSection} />
                )}
            </Grid>
        </Paper>
    )
}

const Step1 = ({nextStep}) => {
    const {appointment} = useSelector((state) => state.booking)
    const dispatch = useDispatch()
    console.log(appointment)
    const [form, setForm] = useState({
        haveVisited: 'no',
        service_details: null
    })
    const [services, setServices] = useState(null)
    const getServices = useCallback(async () =>{
        const {data} = await axiosInstance.get(`/services`)
        setServices(data.services)
    }, [])
    useEffect(() => {
        getServices()
    }, [getServices])
    const handleNext = () => {
        if(!form.service_details) return 
        dispatch(updateAppointment({...form, service: form.service_details._id}))
        nextStep()
    }
    return (
        <Fragment>
            <Grid item xs={12}>
                <FormControl>
                    <FormLabel id="haveVisited">Have you visited our Spa before?</FormLabel>
                    <RadioGroup
                        row
                        aria-labelledby="haveVisited"
                        name="haveVisited"
                        value={form.haveVisited}
                        onChange={(e) => setForm({...form, haveVisited: e.target.value})}
                    >
                        <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                        <FormControlLabel value="no" control={<Radio />} label="No" />
                    </RadioGroup>
                </FormControl>
            </Grid>

            <Grid item xs={12}>
                <FormLabel id="service">What service are you looking for?</FormLabel>
            </Grid>
            {services?.map((service, index) => (
                <Grid item xs={12} sm={4} key={index}>
                    <CardActionArea sx={{mt: 2}} onClick={() => setForm({...form, service_details: service})}>
                        <Card elevation={form.service_details?._id === service._id ? 10 : 1} sx={{display: 'flex', py:1, px:2, alignItems: 'center', minHeight: 125 }}>
                            <CardMedia 
                                component="img"
                                sx={{width: 50, height: 50,}}
                                image={service.type === 'body massage' ? './massage.png' : './foot.png'}
                                alt="massage"
                            />
                            <CardContent>
                                <Typography component="div" variant="h6">
                                    {service.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" component="div">
                                    {service.cost}{service.charge_type ? `/${service.charge_type}` : null}
                                </Typography>
                            </CardContent>
                        </Card>
                    </CardActionArea>
                </Grid>
            ))}
            <Grid item xs={12} sx={{display: 'flex', justifyContent: 'center'}}>
                <Button size="large" variant='contained' sx={{borderRadius: 20 , width: 200}} onClick={handleNext}>Next</Button>
            </Grid>
        </Fragment>
    )
}

const Step2 = ({nextStep, handleBack}) => {
    const {appointment} = useSelector((state) => state.booking)
    const dispatch = useDispatch()
    console.log(appointment)
    const user = fetchFromStorage('user')
    const {values, handleChange, errors, handleSubmit, setFieldValue} = useFormik({
        initialValues: {...user, gender: 'Male', age: 18, mobile: '', appointment_date: new Date()}, 
        validationSchema: Yup.object({
            gender: Yup.string(), 
            age: Yup.number().required('Age is required'), 
            email: Yup.string().email('We need a valid email address').required('Email is required'), 
            mobile: Yup.string().required('We need a way to contact you.'), 
            appointment_date: Yup.string().required('We need a valid date and time for you appointment.')
        }), 
        onSubmit: async (values, {setErrors, setSubmitting}) => {
            dispatch(updateAppointment({...appointment, ...values, user: user._id, bookedTime: values.appointment_date}))
            nextStep()
        }
    })
    return (
        <Fragment>
            <Grid item xs={12} sm={6} container spacing={2}>
                <Grid item xs={6}>
                    <TextField size="small" fullWidth variant="outlined" label="First Name" value={user.firstName} InputProps={{readOnly: true}} />
                </Grid>
                <Grid item xs={6}>
                    <TextField size="small" fullWidth variant="outlined" label="Last Name" value={user.lastName} InputProps={{readOnly: true}} />
                </Grid>
                <Grid item xs={6}>
                    <FormControl fullWidth size='small'>
                        <InputLabel>Gender</InputLabel>
                        <Select
                            value={values.gender}
                            onChange={handleChange}
                            name="gender"
                            label="Gender"
                        >
                            <MenuItem value={`Female`}>Female</MenuItem>
                            <MenuItem value={`Male`}>Male</MenuItem>
                            <MenuItem value={`Others`}>Others</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={6}/>
                <Grid item xs={6}>
                    <TextField 
                        InputLabelProps={{shrink: true}}
                        size="small" 
                        fullWidth 
                        variant="outlined" 
                        label="Age" 
                        value={values.age} 
                        name="age" 
                        onChange={handleChange}
                        error={Boolean(errors.age)}
                        helperText={errors.age}
                    />
                </Grid>
                <Grid item xs={6}/>
                <Grid item xs={6}>
                    <TextField 
                        InputLabelProps={{shrink: true}}
                        size="small" 
                        fullWidth 
                        variant="outlined" 
                        label="Email" 
                        value={values.email} 
                        name="email" 
                        onChange={handleChange}
                        error={Boolean(errors.email)}
                        helperText={errors.email}
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField 
                        InputProps={{startAdornment: <InputAdornment position="start">+63</InputAdornment>}}
                        size="small" 
                        fullWidth 
                        variant="outlined" 
                        label="Mobile" 
                        value={values.mobile} 
                        name="mobile" 
                        onChange={handleChange}
                        error={Boolean(errors.mobile)}
                        helperText={errors.mobile}
                    />
                </Grid>
            </Grid>
            <Grid item xs={12} sm={6} container spacing={2}>
                <Grid item xs={12}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <MobileDateTimePicker
                            value={values.appointment_date}
                            onChange={(n) => setFieldValue('appointment_date', n)}
                            minDateTime={new Date()}
                            label="Appoinment Date and Time"
                            renderInput={(params) => <TextField 
                                size="small" 
                                fullWidth
                                error={errors.appointment_date} 
                                {...params} 
                                />}
                            DialogProps={{
                                maxWidth: 'sm', 
                                fullWidth: true
                            }}

                        />
                    </LocalizationProvider>
                </Grid>
                <Grid item xs={12}>
                    <Paper variant='outlined' sx={{py:5, textAlign: 'center'}}>
                        <Typography variant="body2">Scheduled for: </Typography>
                        <Typography variant="h5">{format(values.appointment_date, 'eeee')} </Typography>
                        <Typography variant="h6" color="GrayText">{format(values.appointment_date, 'd LLLL, yyyy')} </Typography>
                        <Typography variant="h6" color="GrayText">{format(values.appointment_date, 'p')} </Typography>
                    </Paper>
                </Grid>
            </Grid>
            <Grid item xs={12} sx={{display: 'flex', justifyContent: 'center'}}>
                <Button size="large" variant='outlined' sx={{borderRadius: 20 , width: 200, mr: 2}} onClick={handleBack}>Back</Button>
                <Button size="large" variant='contained' sx={{borderRadius: 20 , width: 200}} onClick={handleSubmit}>Next</Button>
            </Grid>
        </Fragment>
    )
}

const Step3 = ({handleBack, setSelectedSection}) => {
    const {appointment} = useSelector((state) => state.booking)
    const user = fetchFromStorage('user')
    const [isSubmitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState(null)
    console.log(appointment)
    const handleSubmit = async () => {
        const form = {...appointment, isConfirmed: true}
        setSubmitting(true)
        const {data} = await axiosInstance.post(`/bookings`, form)
        console.log(data)
        if (!data.success){
            return setError(data.message)
        }
        setSuccess(true)
    }
    return (
        <Fragment>
            {!success && (
            <Fragment>
                {error && (
                    <Snackbar open={Boolean(error)} autoHideDuration={6000} onClose={() => setError(null)}>
                        <Alert onClose={() => setError(null)} severity='error'>
                            {error}
                        </Alert>
                    </Snackbar>
                )}
                <Grid item xs={12} container spacing={2}>
                    <Grid item xs={12} sm={4}>
                        <Paper variant='outlined' sx={{p:2, minHeight: 265}}>
                            <Typography variant="body1">Client Details</Typography>
                            <Box sx={{py: 2}}>
                                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                    <Typography variant="body2" component="span" sx={{fontWeight: 'bold'}}>
                                        Name: {" "}
                                    </Typography>
                                    <Typography variant="body2" component="span">
                                    {user.firstName} {user.lastName} 
                                    </Typography>
                                </div>
                                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                    <Typography variant="body2" component="span" sx={{fontWeight: 'bold'}}>
                                        Gender: {" "}
                                    </Typography>
                                    <Typography variant="body2" component="span">
                                    {appointment.gender}
                                    </Typography>
                                </div>
                                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                    <Typography variant="body2" component="span" sx={{fontWeight: 'bold'}}>
                                        Age: {" "}
                                    </Typography>
                                    <Typography variant="body2" component="span">
                                        {appointment.age}
                                    </Typography>
                                </div>
                                <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 20}}>
                                    <Typography variant="body2" component="span" sx={{fontWeight: 'bold'}}>
                                        Email: {" "}
                                    </Typography>
                                    <Typography variant="body2" component="span">
                                    {user.email}
                                    </Typography>
                                </div>
                                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                    <Typography variant="body2" component="span" sx={{fontWeight: 'bold'}}>
                                        Mobile: {" "}
                                    </Typography>
                                    <Typography variant="body2" component="span">
                                    +63{appointment.mobile}
                                    </Typography>
                                </div>
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Paper variant='outlined' sx={{p:2, minHeight: 265}}>
                            <Typography variant="body1">Schedule Details</Typography>
                            <Box sx={{py: 2}}>
                                <Typography variant="h5">
                                    {format(appointment.bookedTime, 'eeee')}
                                </Typography>

                                <Typography variant="h6" color="GrayText">
                                    {format(appointment.bookedTime, 'd LLLL, yyyy')}
                                </Typography>

                                <Typography variant="h6">
                                    {format(appointment.bookedTime, 'p')}
                                </Typography>
                            </Box>
                            <CardActionArea sx={{mt: 2}}>
                                <Card elevation={0} variant='outlined' sx={{display: 'flex', py:1, px:2, alignItems: 'center' }}>
                                    <CardMedia 
                                        component="img"
                                        sx={{width: 50, height: 50,}}
                                        image={appointment.service_details.type === 'foot massage' ? './foot.png' : 'massage.png'}
                                        alt="massage"
                                    />
                                    <CardContent>
                                        <Typography component="div" variant="h6">
                                            {appointment.service_details.name}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </CardActionArea>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Paper variant='outlined' sx={{p:2, minHeight: 265}}>
                            <Typography variant="body1">Billing Details</Typography>
                            <Box sx={{py:2, mt: 8}}>
                                <Typography variant="h4">₱ {parseFloat(appointment.service_details.cost).toFixed(2)}</Typography>
                                <Typography variant='body1' color="GrayText">Please pay this amount on the day of your appointment</Typography>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
                <Grid item xs={12} sx={{display: 'flex', justifyContent: 'center'}}>
                    <Button disabled={isSubmitting} size="large" variant='outlined' sx={{borderRadius: 20 , width: 200, mr: 2}} onClick={handleBack}>Back</Button>
                    <Button disabled={isSubmitting} size="large" variant='contained' sx={{borderRadius: 20 , width: 300}} onClick={handleSubmit}>
                        {isSubmitting ? 'Creating your Appointment...' : 'Confirm Appointment'}
                    </Button>
                </Grid>
            </Fragment>
            )}

            {success && (
                <Grid item xs={12}>
                    <Paper variant='outlined' sx={{p:2, minHeight: 265,textAlign: 'center'}}>
                        <CheckCircle sx={{fontSize: 150, color: '#114920'}} />
                        <Typography variant='h4'>Appointment Confirmed!</Typography>
                        <Typography variant="body2" sx={{px: 50}} color="GrayText">
                            Your appointment has been confirmed. We also sent you an email with the confirmation of your appointment.
                        </Typography>
                        <Button size="large" variant='contained' sx={{borderRadius: 20 , width: 300, mt: 2, }}
                            onClick={() => setSelectedSection('all_appointments')}
                        >Check My Appointments</Button>
                    </Paper>
                </Grid>
            )}

        </Fragment>
    )
}
export default CustomerApp;
