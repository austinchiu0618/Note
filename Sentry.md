 [vue 使用文件](https://docs.sentry.io/platforms/javascript/guides/vue/)

- 建立帳號，並建立專案
- 安裝
  ```
  yarn add @sentry/vue
  ```
- vue 引入
  ```js
  import { createApp } from "vue";
  import { createRouter } from "vue-router";
  import * as Sentry from "@sentry/vue";

  const app = createApp({
    // ...
  });
  const router = createRouter({
    // ...
  });

  Sentry.init({
    app,
    dsn: "", // 專案的dsn
    integrations: [
      Sentry.browserTracingIntegration({ router }),
      Sentry.replayIntegration(),
    ],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for tracing.
    // We recommend adjusting this value in production
    // Learn more at
    // https://docs.sentry.io/platforms/javascript/ configuration/options/#traces-sample-rate
    tracesSampleRate: 1.0,

    // Set `tracePropagationTargets` to control for which   URLs trace propagation should be enabled
    tracePropagationTargets: ["localhost", /^https:\/\/ yourserver\.io\/api/],

    // Capture Replay for 10% of all sessions,
    // plus for 100% of sessions with an error
    // Learn more at
    // https://docs.sentry.io/platforms/javascript/ session-replay/configuration/  #general-integration-configuration
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });

  app.use(router);
  app.mount("#app");
  ```

### 上報錯誤的方式
- captureException: 上報一個錯誤，function captureException(exception: any): string;
- captureMessage：上報一個文本消息，function captureMessage(message: string, level?: Severity): string;
- captureEvent：上報一個手動創建的事件，function captureEvent(event: Event): string;
