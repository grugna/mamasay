import { registerSignup, trackEvent } from './tracking';

export function initSignup() {
  document.querySelectorAll<HTMLFormElement>('form[data-signup-form]').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const status = form.querySelector<HTMLElement>('[data-signup-status]')!;
      const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
      const data = new FormData(form);
      const email = String(data.get('email') || '').trim();
      const firstName = String(data.get('name') || '').trim();
      const formId = form.dataset.signupForm || 'form';

      const show = (msg: string, state: 'ok' | 'error') => {
        status.textContent = msg;
        status.dataset.state = state;
        status.hidden = false;
      };

      // Honeypot: bots fill the hidden "website" field. Pretend success, send nothing.
      if (data.get('website')) return show(document.body.dataset.success || '', 'ok');

      button.disabled = true;
      try {
        await registerSignup(email, firstName, formId);
        trackEvent('sign_up', { method: 'email', form: formId });
        form.querySelectorAll('input').forEach((i) => ((i as HTMLInputElement).disabled = true));
        button.hidden = true;
        show(document.body.dataset.success || 'Thank you!', 'ok');
      } catch (err) {
        console.error(err);
        button.disabled = false;
        show(document.body.dataset.error || 'Something went wrong.', 'error');
      }
    });
  });
}
