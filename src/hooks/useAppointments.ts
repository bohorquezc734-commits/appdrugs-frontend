import { useQuery } from '@tanstack/react-query';
import { appointmentsService, AppointmentDto } from '../services/appointments';

export const useMyAppointments = () => {
  return useQuery<AppointmentDto[], Error>({
    queryKey: ['my-appointments'],
    queryFn: async () => {
      const data = await appointmentsService.getMyAppointments();
      return data.items;
    },
  });
};
