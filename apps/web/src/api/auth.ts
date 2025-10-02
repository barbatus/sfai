'use client';

import { initTsrReactQuery } from '@ts-rest/react-query/v5';
import { authContract } from 'ts-rest';

export const authApi = initTsrReactQuery(authContract, {
  baseUrl: '',
  jsonQuery: true,
});

export const useAuth = () => {
  return authApi.me.useQuery({
    queryKey: ['auth', 'me'],
    select: (d) => d.body,
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });
};

export const useLogin = () => {
  return authApi.login.useMutation();
};

export const useLogout = () => {
  return authApi.logout.useMutation();
};
