import axios from "axios";
import { cloneDeep } from "lodash";
import {fetchFromStorage} from "../utils/Storage"

const axiosInstance = axios.create({
    baseURL: 'https://w3ypmdrcw3.execute-api.ap-southeast-1.amazonaws.com',
    //baseURL: 'http://localhost:5001',
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  axiosInstance.interceptors.request.use(async (config) => {
    const clonedConfig = cloneDeep(config);
    const token = fetchFromStorage("token");
  
    if (token) {
      clonedConfig.headers.common = {
        Authorization: `Bearer ${token}`,
      };
    }
  
    return clonedConfig;
  });
  
  export default axiosInstance;
  