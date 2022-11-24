import { of } from 'rxjs';

export const activatedRouteStub = {
  queryParamMap: of({
    get() {
      return 'challenge-pack';
    },
  }),
  params: of({ id: 'challenge-pack' }),
};
