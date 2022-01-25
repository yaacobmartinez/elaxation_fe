import { LockOutlined, Verified } from '@mui/icons-material';
import { Alert, Avatar, Box, Button, Checkbox, CssBaseline, FormControlLabel, Grid, Paper, Snackbar, TextField, Typography, } from '@mui/material';
import { useFormik } from 'formik';
import React from 'react';
import { Link } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import * as Yup from 'yup';
import axiosInstance from '../library/axios';
import { saveToStorage } from '../library/utils/Storage';

function LandingPage({type}) {
  return (
        <div style={{background: '#f8eae7'}}>
            <Grid container sx={{height: '100vh'}}>
                <CssBaseline />
                <Grid
                    item
                    xs={false}
                    sm={4}
                    md={7}
                    sx={{
                        backgroundImage: 'url(https://images.unsplash.com/photo-1620975522168-1ee4ca17ccb5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1974&q=80)',
                        backgroundRepeat: 'no-repeat',
                        backgroundColor: (t) =>
                        t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
                {type === 'login' && (
                    <LoginComponent />
                )}

                {type === 'register' && (
                    <RegisterComponent />
                )}

                {type === 'verified' && (
                    <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square sx={{background: '#f8eae7'}}>
                        <Box
                            sx={{
                                my: 8,
                                mx: 4,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}
                        >
                            <Verified sx={{fontSize: 200, mt:20}} />
                            <Typography variant="h6" sx={{mt: 5}}> Account Verified </Typography>
                            <Typography variant="body2"> Your account has been verified. Please sign in to continue. </Typography>
                            <Button size="small" href="/" variant="contained" color="primary" sx={{mt: 2, px: 3}}>Sign In</Button>
                        </Box>
                    </Grid>
                )}
            </Grid>
        </div>
    );
}
const LoginComponent = () => {
    const {push} = useHistory()
    const {values, errors, handleBlur, handleChange, handleSubmit, isSubmitting} = useFormik({
        initialValues: {
            email: '', 
            password: ''
        }, 
        validationSchema: Yup.object({
            email: Yup.string().email('We need a valid email addres').required('We need a valid email address'),
            password: Yup.string().required('Password is required')
        }), 
        onSubmit: async (values, {setErrors, resetForm}) => {
            console.log(values)
            const {data} = await axiosInstance.post(`/auth`, values)
            if (!data.success){
                return setErrors({[data.field]: data.message})
            }
            console.log(data)
            saveToStorage('token', data.token)
            saveToStorage('user', data.user)
            if (data.user.access_level === 0) {
                return push(`/app`)
            }
            return push(`/dashboard`)
        }
    })
    return (
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square sx={{background: '#f8eae7'}}>
            <Box
                sx={{
                my: 8,
                mx: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                }}
            >
                <img src={"./logo_with_name.png"} alt="img" />
                <Typography component="h1" variant="h5">
                    Sign in to your account
                </Typography>
                <Box component="form" noValidate sx={{ mt: 1 }} onSubmit={handleSubmit}>
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(errors.email)}
                    helperText={errors.email}
                />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(errors.password)}
                    helperText={errors.password}
                />
                <Button
                    disabled={isSubmitting}
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                >
                   {isSubmitting ? 'Checking account' : 'Sign In'}
                </Button>
                <Grid container>
                    <Grid item xs>
                    <Link to="/forgot" variant="body2">
                        Forgot password?
                    </Link>
                    </Grid>
                    <Grid item>
                    <Link to="/register" variant="body2">
                        {"Don't have an account? Sign Up"}
                    </Link>
                    </Grid>
                </Grid>
                </Box>
            </Box>
        </Grid>
    )
}

const RegisterComponent = () => {
    const [success, setSuccess] = React.useState(null)
    const {values, errors, handleChange, handleBlur, handleSubmit, isSubmitting} = useFormik({
        initialValues: {
            firstName: '', 
            lastName: '', 
            email: '', 
            password: '',
            confirmPassword: ''
        }, 
        validationSchema: Yup.object({
            firstName: Yup.string().required('We need to know your first name'),
            lastName: Yup.string().required('We need to know your last name'),
            email: Yup.string().email('We need a valid email address').required('We need a way to contact you.'),
            password: Yup.string().required('Please enter your desired password.')
            .matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/,
                "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character"
            ),
            confirmPassword: Yup.string()
            .required('Passwords must match')
            .oneOf([Yup.ref("password"), null], "Passwords must match"),
        }), 
        onSubmit: async (values, {setErrors, resetForm, setSubmitting}) => {
            console.log(values)
            setSubmitting(true)
            const {data} = await axiosInstance.post(`/register`, values)
            console.log(data)
            if(data.success){
                resetForm()
                setSubmitting(false)
                return setSuccess({type: 'success', message : 'Account Created. Please check your email to activate your account.'})
            }
            setSubmitting(false)
            return setErrors({email: data.message})
        }
    })
    return(
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square sx={{background: '#f8eae7'}}>
            {success && (
                <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    open={Boolean(success)}
                    onClose={() => setSuccess(null)}
                    autoHideDuration={10000}
                >
                    <Alert variant='filled' onClose={() => setSuccess(null)} severity={success.type} sx={{width: '100%'}}>
                        {success.message}
                    </Alert>
                </Snackbar>
            )}
            <Box
                sx={{
                my: 8,
                mx: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                }}
            >
                <img src={"./logo_with_name.png"} alt="img" />
                <Typography component="h1" variant="h5">
                    Create your account
                </Typography>
                <Box component="form" noValidate sx={{ mt: 1 }} onSubmit={handleSubmit}>
                    <TextField
                        size="small"
                        margin="normal"
                        required fullWidth
                        label="First Name"
                        name="firstName"
                        autoFocus
                        value={values.firstName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={Boolean(errors.firstName)}
                        helperText={errors.firstName}
                    />
                    <TextField
                        size="small"
                        margin="normal"
                        required fullWidth
                        label="Last Name"
                        name="lastName"
                        value={values.lastName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={Boolean(errors.lastName)}
                        helperText={errors.lastName}
                    />
                    <TextField
                        size="small"
                        margin="normal"
                        required fullWidth
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={Boolean(errors.email)}
                        helperText={errors.email}
                    />
                    <TextField
                        size='small'
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={Boolean(errors.password)}
                        helperText={errors.password}
                    />
                    <TextField
                        size='small'
                        margin="normal"
                        required
                        fullWidth
                        name="confirmPassword"
                        label="Confirm Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={values.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={Boolean(errors.confirmPassword)}
                        helperText={errors.confirmPassword}
                    />
                    <Button
                        disabled={isSubmitting}
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        {isSubmitting ? 'Creating Account' : 'Create Account' }
                    </Button>
                    <Grid container>
                        <Grid item>
                            <Link to="/" variant="body2">
                                {"Have an account? Sign In"}
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Grid>
    )
}
export default LandingPage;
