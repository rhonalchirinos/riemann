export interface CaptchaPortFactory {
  generate(): CaptchaPortFactory;
  get answer(): string;
}
