import { registerListener } from '@lib/messaging';

function install() {
  registerListener('parsePage', async () => {
    alert('Hello from the parser!');
  });
}

if (!(window as any).___PARSER_INSTALLED) {
  install();
}

(window as any).___PARSER_INSTALLED = true;
