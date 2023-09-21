/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import { type Schema, ValidationError } from 'yup';

export interface FormOptions {
  validationSchema?: Schema<any>;
  submitEvent?: string;
}

export class Form {
  private form: HTMLFormElement;
  private validationSchema?: Schema<any>;
  public errors: Record<string, string> = {};

  constructor(
    form: HTMLElement | null,
    { validationSchema, submitEvent = 'htmx:confirm' }: FormOptions = {}
  ) {
    if (!form) {
      throw new Error('Form not found. Are you sure your form selector is correct?');
    } else if (form.tagName !== 'FORM') {
      throw new Error('The selector you provided is not a form.');
    }

    if (validationSchema) {
      this.validationSchema = validationSchema;
    }

    this.onSubmit = this.onSubmit.bind(this);

    this.form = form as HTMLFormElement;
    this.form.addEventListener(submitEvent, this.onSubmit);
  }

  async onSubmit(event: Event) {
    event.preventDefault();

    const formData = new FormData(this.form);
    const data = Object.fromEntries(formData.entries());

    await this.validate(data);

    if (!Object.keys(this.errors).length) {
      console.log('Submitting: ', data);
      (event as CustomEvent).detail.issueRequest();
    }
  }

  addValidationSchema(validationSchema: Schema<any>) {
    this.validationSchema = validationSchema;
    return this;
  }

  public async validate(data: any) {
    if (!this.validationSchema) {
      throw new Error('No validation schema provided.');
    }

    return this.validationSchema
      .validate(data, { abortEarly: false })
      .then(() => {
        this.errors = {};
      })
      .catch((error) => {
        if (!(error instanceof ValidationError)) throw error;

        this.errors = error.inner.reduce((acc, { path, message }) => {
          if (!path) return acc;

          return {
            ...acc,
            [path]: message,
          };
        }, {});
      })
      .finally(() => {
        this.showErrors();
      });
  }

  private showErrors() {
    this.form.querySelectorAll('[data-error]').forEach((element) => {
      const fieldName = element.getAttribute('data-error');
      element.textContent = fieldName && fieldName in this.errors ? this.errors[fieldName] : '';
    });
  }
}
