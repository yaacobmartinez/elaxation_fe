
import React from 'react'
import { Redirect, Route } from 'react-router'
import { fetchFromStorage } from '../utils/Storage'

export const AppRoute = ({component: Component, ...rest}) => {
    const user = fetchFromStorage('user')
    return (
        <Route
            {...rest}
            render={(props) =>{
                if (!user){
                    return (
                        <Component {...props} />
                    )
                }else if (user.access_level === 0){
                    return (
                        <Redirect 
                            to={{
                                pathname: '/app', 
                                state: {
                                    from: props.location
                                }
                            }}
                        />
                    )
                }else{
                    return (
                        <Redirect 
                            to={{
                                pathname: '/dashboard', 
                                state: {
                                    from: props.location
                                }
                            }}
                        />
                    ) 
                }
            }}
        />
    )
}

export const UserRoute = ({ component: Component, ...rest}) => {
    const user = fetchFromStorage('user')
    return (
        <Route
			{...rest}
			render={(props) => {
				if (!user) {
					return (
						<Redirect
							to={{
								pathname: "/",
								state: {
									from: props.location,
								},
							}}
						/>	
					)
				} else if (user.access_level === 0) {
					return (
                        <Component {...props}/>
					);
				} else {
					return (
						<Redirect
							to={{
								pathname: "/",
								state: {
									from: props.location,
								},
							}}
						/>
					);
				}
			}}
		/>
    )
}

export const AdminRoute = ({ component: Component, ...rest}) => {
    const user = fetchFromStorage('user')
    return (
        <Route
			{...rest}
			render={(props) => {
				if (!user) {
					return (
						<Redirect
							to={{
								pathname: "/",
								state: {
									from: props.location,
								},
							}}
						/>	
					)
				} else if (user.access_level === 1) {
					return (
                        <Component {...props}/>
					);
				} else {
					return (
						<Redirect
							to={{
								pathname: "/",
								state: {
									from: props.location,
								},
							}}
						/>
					);
				}
			}}
		/>
    )
}