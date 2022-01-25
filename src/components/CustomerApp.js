import { DateRange, Logout, Menu, Today } from '@mui/icons-material';
import { LocalizationProvider, MobileDateTimePicker } from '@mui/lab';
import { AppBar, Box, Button, Card, CardActionArea, CardContent, CardMedia, Divider, Drawer, FormControl, FormControlLabel, FormLabel, Grid, IconButton, InputAdornment, InputLabel, List, ListItem, ListItemIcon, ListItemText, MenuItem, Paper, Radio, RadioGroup, Select, TextField, Toolbar, Typography } from '@mui/material';
import React, { Fragment, useState } from 'react';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { clearStorage, fetchFromStorage } from '../library/utils/Storage';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axiosInstance from '../library/axios';
import { format } from 'date-fns';
import { useHistory } from 'react-router-dom';

function CustomerApp() {
    const {push} = useHistory()
  return (
    <Box>
        <AppBar position="fixed" sx={{background: '#f8eae7', zIndex: (theme) => theme.zIndex.drawer + 1}} color="transparent">
        <Toolbar>
            <Typography variant="h6" component="div">
                E-laxation Spa and Appointment
            </Typography>
        </Toolbar>
        </AppBar>
        <Drawer variant="permanent" sx={{width: 240, flexShrink: 0,[`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box' },}}>
            <Toolbar />
            <Box sx={{ overflow: 'auto' }}>
                <List>
                    <ListItem button>
                        <ListItemIcon>
                            <Today />
                        </ListItemIcon>
                        <ListItemText primary={'New Appointment'} />
                    </ListItem>
                    <ListItem button>
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
            <BookingInformation />
        </Box>
    </Box>
  );
}

const services = [
    {
        name: 'Swedish Massage', 
        type: 'body massage', 
        cost: '399',
        charge_type: 'hour'
    },
    {
        name: 'Shiatsu Dry Massage', 
        type: 'body massage', 
        cost: '499',
        charge_type: 'hour'
    },
    {
        name: 'Signature Massage', 
        type: 'body massage', 
        cost: '699',
        charge_type: 'hour'
    },
    {
        name: 'Bentosa Massage', 
        type: 'body massage', 
        cost: '1499',
        charge_type: ''
    },
    {
        name: 'Foot Reflex with Back Massage', 
        type: 'foot massage', 
        cost: '399',
        charge_type: ''
    },
    {
        name: 'Hand and Foot Reflex', 
        type: 'foot massage', 
        cost: '299',
        charge_type: ''
    },
    {
        name: 'Foot Spa with Massage', 
        type: 'foot massage', 
        cost: '399',
        charge_type: ''
    },
    {
        name: 'Manicure and Pedicure', 
        type: 'foot massage', 
        cost: '299',
        charge_type: ''
    },
    {
        name: 'Manicure and Pedicure & Foot Spa with Massage', 
        type: 'foot massage', 
        cost: '599',
        charge_type: ''
    },
]
const BookingInformation = () => {
    const [currentStep, setCurrentStep] = useState(3)
    return (
        <Paper elevation={5} sx={{width: 'calc(93vw - 240px)', p:5}}>
            <Typography variant="h6" gutterBottom sx={{mb: 2}}>New Appointment Details</Typography>
            <Divider sx={{mb: 5}}/>
            <Grid container spacing={2}>
                {currentStep === 1 && (
                    <Step1 />
                )}
                {currentStep === 2 && (
                    <Step2 />
                )}
                {currentStep === 3 && (
                    <Step3 />
                )}
                <Grid item xs={12} sx={{display: 'flex', justifyContent: 'center'}}>
                    <Button size="large" variant='contained' sx={{borderRadius: 20 , width: 200}} onClick={() => setCurrentStep(currentStep + 1)}>Confirm</Button>
                </Grid>
            </Grid>
            
            
        </Paper>
    )
}

const Step1 = () => {
    return (
        <Fragment>
            <Grid item xs={12}>
                <FormControl>
                    <FormLabel id="haveVisited">Have you visited our Spa before?</FormLabel>
                    <RadioGroup
                        row
                        aria-labelledby="haveVisited"
                        name="haveVisited"
                    >
                        <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                        <FormControlLabel value="no" control={<Radio />} label="No" />
                    </RadioGroup>
                </FormControl>
            </Grid>

            <Grid item xs={12}>
                <FormLabel id="service">What service are you looking for?</FormLabel>
            </Grid>
            {services.map((service, index) => (
                <Grid item xs={12} sm={3} key={index}>
                    <CardActionArea sx={{mt: 2}}>
                        <Card elevation={5} sx={{display: 'flex', py:1, px:2, alignItems: 'center', minHeight: 125 }}>
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
        </Fragment>
    )
}

const Step2 = () => {
    const user = fetchFromStorage('user')
    const {values, handleChange, errors, handleSubmit, touched, setFieldValue} = useFormik({
        initialValues: {...user, gender: 'Male', age: 18, mobile: '', appointment_date: new Date()}, 
        validationSchema: Yup.object({
            gender: Yup.string(), 
            age: Yup.number().required('Age is required'), 
            email: Yup.string().email('We need a valid email address').required('Email is required'), 
            mobile: Yup.string().required('We need a way to contact you.'), 
            appointment_date: Yup.string().required('We need a valid date and time for you appointment.')
        }), 
        onSubmit: async (values, {setErrors}) => {
            console.log(values)
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
            
        </Fragment>
    )
}

const Step3 = () => {
    const user = fetchFromStorage('user')
    return (
        <Fragment>
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
                                    Male
                                </Typography>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                <Typography variant="body2" component="span" sx={{fontWeight: 'bold'}}>
                                    Age: {" "}
                                </Typography>
                                <Typography variant="body2" component="span">
                                    20
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
                                   +639159803576
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
                                {format(new Date(), 'eeee')}
                            </Typography>

                            <Typography variant="h6" color="GrayText">
                                {format(new Date(), 'd LLLL, yyyy')}
                            </Typography>

                            <Typography variant="h6">
                                {format(new Date(), 'p')}
                            </Typography>
                        </Box>
                        <CardActionArea sx={{mt: 2}}>
                            <Card elevation={0} variant='outlined' sx={{display: 'flex', py:1, px:2, alignItems: 'center' }}>
                                <CardMedia 
                                    component="img"
                                    sx={{width: 50, height: 50,}}
                                    image={'./foot.png'}
                                    alt="massage"
                                />
                                <CardContent>
                                    <Typography component="div" variant="h6">
                                        Swedish Massage
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
                            <Typography variant="h4">₱ 399.00</Typography>
                            <Typography variant='body1' color="GrayText">Please pay this amount on the day of your appointment</Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Fragment>
    )
}
export default CustomerApp;
