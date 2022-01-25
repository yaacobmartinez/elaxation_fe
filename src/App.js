import './App.css';
import { createTheme, ThemeProvider } from '@mui/material';
import {BrowserRouter as Router, Switch} from 'react-router-dom'
import { AdminRoute, AppRoute, UserRoute } from './library/routes';
import LandingPage from './components/LandingPage';
import CustomerApp from './components/CustomerApp';
import Dashboard from './components/Dashboard';


const theme = createTheme({
  typography: {
    fontFamily: [
			"Poppins",
			"-apple-system",
			"BlinkMacSystemFont",
			'"Segoe UI"',
			"Roboto",
			'"Helvetica Neue"',
			"Arial",
			"sans-serif",
			'"Apple Color Emoji"',
			'"Segoe UI Emoji"',
			'"Segoe UI Symbol"',
		].join(","),
  }
})


function App() {
  return (
    <div>
      <Router>
        <ThemeProvider theme={theme}>
          <Switch>
            <AppRoute exact path="/" component={() => <LandingPage type="login" />} />
            <AppRoute exact path="/register" component={() => <LandingPage type="register" />} />
            <AppRoute exact path="/verifieduser" component={() => <LandingPage type="verified" />} />
            <AppRoute exact path="/forgot" component={() => <LandingPage type="forgot" />} />
            <AppRoute exact path="/changepassword" component={() => <LandingPage type="changepassword" />} />

            <UserRoute exact path="/app" component={CustomerApp} />
            <AdminRoute exact path="/dashboard" component={Dashboard} />
          </Switch>
        </ThemeProvider>
      </Router>
    </div>
  );
}

export default App;
