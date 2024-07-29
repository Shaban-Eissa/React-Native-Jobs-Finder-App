import { useState, useEffect } from "react";
import axios from "axios";

const rapidApiKey = process.env.EXPO_PUBLIC_RAPID_API_KEY;
const rapidApiHost = process.env.EXPO_PUBLIC_RAPIDAPI_HOST;

const useFetch = (endpoint, query) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const options = {
    method: "GET",
    url: `https://jsearch.p.rapidapi.com/${endpoint}`,
    headers: {
      "X-RapidAPI-Key": `${rapidApiKey}`,
      "X-RapidAPI-Host": `${rapidApiHost}`,
    },
    params: { ...query },
  };

  const fetchData = async (retryCount = 0) => {
    setIsLoading(true);

    try {
      const response = await axios.request(options);
      setData(response.data.data);
      setIsLoading(false);
    } catch (error) {
      if (error.response && error.response.status === 429 && retryCount < 3) {
        // Exponential backoff
        const delay = Math.pow(2, retryCount) * 1000;
        setTimeout(() => fetchData(retryCount + 1), delay);
      } else {
        setError(error);
        console.log(error);
        setIsLoading(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refetch = () => {
    setIsLoading(true);
    fetchData();
  };

  return { data, isLoading, error, refetch };
};

export default useFetch;
