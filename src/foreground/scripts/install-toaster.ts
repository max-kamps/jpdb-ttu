import { registerListener } from '@lib/messaging';
import { displayToast } from '@lib/toast';
import { install } from '../lib';

install('toaster', () => registerListener('toast', displayToast));
