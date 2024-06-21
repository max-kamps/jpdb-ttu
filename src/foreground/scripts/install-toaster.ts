import { install } from '@foreground/lib/install';
import { registerListener } from '@lib/messaging/register-listener';
import { displayToast } from '@lib/toast';

install('toaster', () => registerListener('toast', displayToast));
