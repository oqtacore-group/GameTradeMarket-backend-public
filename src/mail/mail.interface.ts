export interface IMailSend {
  from: string;
  to: string;
  subject: string;
  templateName: string;
  params: {
    email: string;
    code: number;
  };
}

export interface IMailSendParams {
  email: string;
  code: number;
  host: string;
}
