import useSWR from "swr";
import api from "../api";

const fetcher = (url) => api.get(url).then((res) => res.data);

/**
 * Hook que obtiene y cachea los datos del dashboard.
 * Revalida automáticamente en background cada 60s y al enfocar la ventana.
 */
const useDashboard = () => {
  const { data, error, isLoading, mutate } = useSWR(
    "/dashboard/summary",
    fetcher,
    {
      revalidateOnFocus: true,
      refreshInterval: 60_000, // revalidar cada 60 segundos
      dedupingInterval: 10_000, // deduplicar peticiones en 10s
    }
  );

  return {
    data,
    error,
    isLoading,
    refresh: mutate,
  };
};

export default useDashboard;
