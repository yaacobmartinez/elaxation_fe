import { Add, DateRange, Logout, Menu, Spa } from '@mui/icons-material';
import { AppBar, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Drawer, FormControl, IconButton, InputLabel, List, ListItem, ListItemIcon, ListItemText, MenuItem, Select, TextField, Toolbar, Typography } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useFormik } from 'formik';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import axiosInstance from '../library/axios';
import { clearStorage } from '../library/utils/Storage';
import * as Yup from 'yup';
import { format } from 'date-fns';
import { AppointmentDetailsModal } from './CustomerApp';

function Dashboard() {
    const [open, setOpen] = useState(true)
    const [selectedSection, setSelectedSection] = useState('appointments')
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
                <Toolbar/>
                <List>
                    <ListItem button onClick={() => setSelectedSection('appointments')}>
                        <ListItemIcon><DateRange /></ListItemIcon>
                        <ListItemText primary="Appointments" />
                    </ListItem>
                    <ListItem button onClick={() => setSelectedSection('services')}>
                        <ListItemIcon><Spa /></ListItemIcon>
                        <ListItemText primary="Services" />
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
            </Drawer>
            <Box sx={{ml: 32, mt: 2}}>
                <Toolbar />
                {selectedSection === 'appointments' && (
                    <Appointments />
                )}
                {selectedSection === 'services' && (
                    <Services />
                )}
            </Box>
        </Box>
  );
}

const Appointments = () => {
    const [appointments, setAppointments] = useState(null)
    const [selectedAppointment, setSelectedAppointment] = useState(null)
    const getAppointments = useCallback(async () => { 
        const {data} = await axiosInstance.get('/bookings')
        console.log(data)
        setAppointments(data.bookings.sort((a, b) => new Date(b.bookedTime) - new Date(a.bookedTime)))
    }, [])
    useEffect(() => {
        getAppointments()
    }, [getAppointments])
    return (
        <div style={{marginRight: 20}}>
            <Typography variant="h6" sx={{mb: 2}}>All Appointments</Typography> 
            {selectedAppointment && (
                <AppointmentDetailsModal 
                    open={Boolean(selectedAppointment)} 
                    onClose={() => setSelectedAppointment(null)}
                    appointment={selectedAppointment}
                    onChange={getAppointments}
                />
            )}
            {appointments && (
                <DataGrid rows={appointments}
                    autoHeight
                    rowHeight={35}
                    getRowId={(row) => row._id}
                    components={{
                        Toolbar: GridToolbar,
                    }}
                    onRowClick={(row) => setSelectedAppointment(row.row)}
                    columns={[
                        {
                            field: 'user', 
                            headerName: 'Client Name', 
                            flex: 1, 
                            minWidth: 250, 
                            valueFormatter: (params) => params.value.firstName + ' ' + params.value.lastName
                        }, 
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

const Services = () => {
    const [services, setServices] = useState(null)
    const [newService, setNewService] = useState(false)
    const [selectedService, setSelectedService] = useState(null)
    const getServices = useCallback(async () =>{
        const {data} = await axiosInstance.get(`/services`)
        setServices(data.services)
    }, [])
    useEffect(() => {
        getServices()
    }, [getServices])
    return (
        <div style={{marginRight: 20}}>
            <NewServiceDialog open={newService} onClose={() => setNewService(false)} onChange={getServices}/>
            {selectedService && (
                <ServiceDialog 
                    open={Boolean(selectedService)} 
                    onClose={() => setSelectedService(null)} 
                    onChange={getServices} 
                    row={selectedService} 
                />
            )}
            <Typography variant="h6">All Services</Typography> 
            <Button 
                variant='contained' 
                color="primary" 
                size="small" 
                startIcon={<Add />} 
                sx={{my: 2}}
                onClick={() => setNewService(true)}
            >Add New Service</Button>
            {services && (
                <DataGrid rows={services}
                    autoHeight
                    rowHeight={35}
                    getRowId={(row) => row._id}
                    components={{
                        Toolbar: GridToolbar,
                    }}
                    onRowClick={(row) => setSelectedService(row.row)}
                    columns={[
                        {
                            field: 'name', 
                            headerName: 'Service', 
                            flex: 1, 
                            minWidth: 250, 
                            renderCell: cell => {
                                return (
                                    <Typography variant="caption">
                                        {cell.value}
                                    </Typography>
                                )
                            }
                        }, 
                        {
                            field: 'type', 
                            headerName: 'Service Type', 
                            flex: 1, 
                            minWidth: 250, 
                            renderCell: cell => {
                                return (
                                    <Typography variant="caption">
                                        {cell.value.toUpperCase()}
                                    </Typography>
                                )
                            }
                        }, 
                        {
                            field: 'cost', 
                            headerName: 'Service Cost', 
                            flex: 1, 
                            minWidth: 250, 
                            renderCell: cell => {
                                return (
                                    <Typography variant="caption">
                                       ₱ {parseFloat(cell.value).toFixed(2)}
                                    </Typography>
                                )
                            }
                        },
                        {
                            field: 'charge_type', 
                            headerName: 'Charge Type', 
                            flex: 1, 
                            minWidth: 250, 
                            renderCell: cell => {
                                return (
                                    <Typography variant="caption">
                                       per {cell.value}
                                    </Typography>
                                )
                            }
                        }
                    ]}
                />
            )}
        </div>
    )
}
const ServiceDialog = ({open, onClose, onChange, row}) => {
    const {values, errors, handleChange, handleSubmit, isSubmitting} = useFormik({
        initialValues: row, 
        validationSchema: Yup.object({
            name: Yup.string().required('Service Name is required'), 
            type: Yup.string().required('Service Type is required'), 
            cost: Yup.number().required('Service Cost is required'),
            charge_type: Yup.string().required('Charge Type is required')
        }), 
        onSubmit: async (values, {setErrors, setSubmitting, resetForm}) => {
            setSubmitting(true)
            const {data} = await axiosInstance.put(`/services/${row._id}`, values)
            console.log(data)
            setSubmitting(false)
            resetForm()
            onChange()
            onClose()
        }
    })
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <Box component="form" onSubmit={handleSubmit}>
                <DialogTitle>Update Service Details</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        size='small'
                        sx={{my: 2}}
                        name="name"
                        label="Service Name"
                        fullWidth
                        variant="outlined"
                        value={values.name}
                        onChange={handleChange}
                        error={Boolean(errors.name)}
                        helperText={errors.name}
                    />
                    <FormControl fullWidth size='small' sx={{my: 2}}>
                        <InputLabel id="demo-simple-select-label">Service Type</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            name="type"
                            value={values.type}
                            label="Service Type"
                            onChange={handleChange}
                        >
                            <MenuItem value={'body massage'}>Body Massage</MenuItem>
                            <MenuItem value={'foot massage'}>Foot Massage</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        autoFocus
                        type="number"
                        size='small'
                        sx={{my: 2}}
                        name="cost"
                        label="Service Cost"
                        fullWidth
                        variant="outlined"
                        value={values.cost}
                        onChange={handleChange}
                        error={Boolean(errors.cost)}
                        helperText={errors.cost}
                    />
                    <FormControl fullWidth size='small'
                        sx={{my: 2}}>
                        <InputLabel id="demo-simple-select-label">Charge Type</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            name="charge_type"
                            value={values.charge_type}
                            label="Charge Type"
                            onChange={handleChange}
                        >
                            <MenuItem value={'hour'}>Per Hour</MenuItem>
                            <MenuItem value={'session'}>Per Session</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button variant='outlined' onClick={onClose}>Cancel</Button>
                    <Button disabled={isSubmitting} type="submit" variant='contained' color="primary">
                        Submit
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    )
}

const NewServiceDialog = ({open, onClose, onChange}) => {
    const {values, errors, handleChange, handleSubmit, isSubmitting} = useFormik({
        initialValues: {
            name: '', 
            type: 'body massage', 
            cost: 0, 
            charge_type: 'hour'
        }, 
        validationSchema: Yup.object({
            name: Yup.string().required('Service Name is required'), 
            type: Yup.string().required('Service Type is required'), 
            cost: Yup.number().required('Service Cost is required'),
            charge_type: Yup.string().required('Charge Type is required')
        }), 
        onSubmit: async (values, {setErrors, setSubmitting, resetForm}) => {
            setSubmitting(true)
            const {data} = await axiosInstance.post('/services', values)
            if (!data.success) return setErrors({name: data.message})
            setSubmitting(false)
            resetForm()
            onChange()
            onClose()
        }
    })
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <Box component="form" onSubmit={handleSubmit}>
                <DialogTitle>Add New Service</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        size='small'
                        sx={{my: 2}}
                        name="name"
                        label="Service Name"
                        fullWidth
                        variant="outlined"
                        value={values.name}
                        onChange={handleChange}
                        error={Boolean(errors.name)}
                        helperText={errors.name}
                    />
                    <FormControl fullWidth size='small' sx={{my: 2}}>
                        <InputLabel id="demo-simple-select-label">Service Type</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            name="type"
                            value={values.type}
                            label="Service Type"
                            onChange={handleChange}
                        >
                            <MenuItem value={'body massage'}>Body Massage</MenuItem>
                            <MenuItem value={'foot massage'}>Foot Massage</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        autoFocus
                        type="number"
                        size='small'
                        sx={{my: 2}}
                        name="cost"
                        label="Service Cost"
                        fullWidth
                        variant="outlined"
                        value={values.cost}
                        onChange={handleChange}
                        error={Boolean(errors.cost)}
                        helperText={errors.cost}
                    />
                    <FormControl fullWidth size='small'
                        sx={{my: 2}}>
                        <InputLabel id="demo-simple-select-label">Charge Type</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            name="charge_type"
                            value={values.charge_type}
                            label="Charge Type"
                            onChange={handleChange}
                        >
                            <MenuItem value={'hour'}>Per Hour</MenuItem>
                            <MenuItem value={'session'}>Per Session</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button variant='outlined' onClick={onClose}>Cancel</Button>
                    <Button disabled={isSubmitting} type="submit" variant='contained' color="primary">
                        Submit
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    )
}
export default Dashboard;
