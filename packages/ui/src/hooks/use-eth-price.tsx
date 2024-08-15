import { useQuery } from '@tanstack/react-query';

const fetchEthPrice = async () => {
    const response = await fetch('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data.USD;
};

export const useEthPrice = () => {
    const query = useQuery<number>({
        queryKey: ['ethPrice'],
        queryFn: fetchEthPrice,
        initialData: 0,
    });

    return { ethPrice: query.data, isLoading: query.isLoading }
};
