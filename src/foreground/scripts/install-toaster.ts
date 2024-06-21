import { registerListener } from '@lib/messaging/register-listener';
import { displayToast } from '@lib/toast';
import { install } from '../lib/install';

install('toaster', () => registerListener('toast', displayToast));
