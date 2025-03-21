import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { MyConfigModule } from 'src/config/config.module';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [MyConfigModule],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get('mail.host'),
          port: config.get('mail.port'),
          secure: false,
          auth: {
            user: config.get('mail.username'),
            pass: config.get('mail.password'),
          },
        },
        defaults: {
          from: `"No Reply" <${config.get('mail.fromAddress')}>`,
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class MailModule {}
