<!-- coderabbit-ai-generated:v1 -->

# EduGuide Gauteng

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:e39ce53ed2f94906d1d9f7e866ea38344d94a11d2298f552cc80ff9d9ad6a3cb -->

Run the website with Node.js 24 or later:

<!-- /coderabbit-ai-generated:v1 -->

```sh
node server.js
```

Open http://localhost:3000. Set `PORT` to change the port. Accounts and the last five questions asked while signed in are stored in `data/accounts.json`; `EDUGUIDE_DATA_FILE` can select another persistent file. Keep this file private and back it up if profiles need to survive redeployment. Sessions expire after 24 hours or when the server restarts. Questions asked while signed out are not added to a profile, and clearing the chat does not delete profile activity.

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:6987bef5dce7685b7b86d8f99b370b1d21353898b32c17b2c00d1a0e2f77372b -->

This simple server is intended for a single instance. Public deployment needs HTTPS, durable private storage, and production protections such as login rate limiting and account recovery.

The audio lesson catalogue is seeded from `catalog.json` into `data/learning.sqlite`. Listening sessions are saved to the same SQLite database for signed-in accounts and can be filtered by the last 7 days, 30 days, or all time. Set `EDUGUIDE_LEARNING_DB` to change its location. Back up both the accounts file and the learning database. Playback uses the browser’s speech synthesis voice; stop or finish a lesson to save its session. The starter lessons are not a complete or verified CAPS curriculum.

<!-- /coderabbit-ai-generated:v1 -->
