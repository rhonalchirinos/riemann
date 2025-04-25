import { Controller, Get } from '@nestjs/common';

@Controller()
export class HomeController {
  @Get()
  hello(): string {
    return 'Hello World !';
  }
}
